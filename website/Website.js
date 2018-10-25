const express = require("express");
const serveStatic = require("serve-static");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const Discord = require("passport-discord");
const LevelSessionStore = require("level-session-store")(session);
const WebSocket = require("ws");
const http = require("http");
const helmet = require("helmet");
const exec = require("util").promisify(require("child_process").exec);

class Website {

    constructor(client) {
        Object.defineProperty(this, "client", { value: client, writable: false });
        this.express = express();
        this.app = require("next")({ dev: true, dir: __dirname });
        this.requestHandler = this.app.getRequestHandler();
        this.server = http.createServer(this.express);
        this.store = new LevelSessionStore();
        this.wss = null;
    }

    loadGetRoutes() {
        this.express.get("/", (rq,_,n)=>{rq.session.last = "/";n();}, (req, res) => {
            this.app.render(req, res, "/homepage", {
                authorized: req.isAuthenticated(),
                stats: { guilds: this.client.guilds.size },
                usr: req.user ? req.user : null,
                owner: req.user ? this.isOwner(req.user) : false
            });
        });
        this.express.get("/player", (rq,_,n)=>{rq.session.last = "/";n();}, (req, res) => {
            res.render("musicplayer", {
                authorized: req.isAuthenticated(),
                stats: { guilds: this.client.guilds.size },
                usr: req.user ? req.user : null,
                owner: req.user ? this.isOwner(req.user) : false
            });
        });
        this.express.get("/login", passport.authenticate("discord", {
            failureRedirect: "/"
        }), (req, res) => res.redirect(req.session.last || "/"));
        this.express.get("/logout", this.authCheck, (req, res) => {
            req.logout();
            res.redirect("/");
        });
        /* this.express.get("/console", (rq,_,n)=>{rq.session.last = "/console";n();}, this.authCheck, (req, res) => {
            if (this.isOwner(req.user)) {
                res.render("console", {
                    authorized: req.isAuthenticated(),
                    stats: { guilds: this.client.guilds.size },
                    usr: req.user ? req.user : null,
                    log: this.client.logger.read()
                });
            }
        }); */
        this.express.get("*", (req, res) => {
            return this.requestHandler(req, res);
        });
    }

    loadPostRoutes() {
        // Later
    }

    isOwner(user) {
        return this.client.config.developers.includes(user.id);
    }

    authCheck(req, res, next) {
        if (req.isAuthenticated()) return next();
        return res.redirect("/login");
    }

    start() {
        this.client.console.log("Starting build...");
        const start = Date.now();
        // Execute 'npx next build' to build app.
        exec("npx next build", { cwd: __dirname }).then(v => {
            this.client.console.log(`Finished building in ${(Date.now() - start).toFixed(2)}ms.`);
            // Prepare next.js after building the files
            this.app.prepare().then(() => {
                // Passport and helmet
                this.express.use(helmet({
                    frameguard: false
                }));
                passport.deserializeUser((user, done) => done(null, user));
                passport.serializeUser((user, done) => done(null, user));
                passport.use(new Discord.Strategy({
                    clientID: this.client.user.id,
                    clientSecret: this.client.config.secret,
                    callbackURL: "https://remixbot.ml/login",
                    scope: ["identify"]
                }, (_, __, profile, done) => {
                    process.nextTick(() => {
                        return done(null, profile);
                    });
                }));
                // Use express session
                this.express.use(session({
                    secret: this.client.config.sessionSecret,
                    cookie: {
                        secure: true,
                        httpOnly: true,
                        domain: "remixbot.ml",
                        path: "/",
                        maxAge: 31536000000
                    },
                    store: this.store,
                    saveUninitialized: true,
                    resave: true
                }));
                // Initialize passport and passport.session
                this.express.use(passport.initialize());
                this.express.use(passport.session());
                // Body parser
                this.express.use(bodyParser.json());
                this.express.use(bodyParser.urlencoded({ extended: false }));
                // Statically serve assets
                this.express.use("/assets", serveStatic(`${process.cwd()}/assets`));
                // Load routes
                this.loadGetRoutes();
                this.loadPostRoutes();
                // Listen
                this.server.listen(3232, () => {
                    this.startWebsocket();
                    this.client.console.log("> Ready on port 3232");
                });
            });
        }).catch(e => console.error(e));
    }

    socketSend(socket, payload) {
        if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
    }

    startWebsocket() {
        this.wss = new WebSocket.Server({ server: this.server });
        this.wss.on("listening", () => {
            this.client.console.log(`[WSS] listening.`);
        });
        this.wss.on("error", error => {
            this.client.console.wtf(`[WSS] Error: ${error}`);
        });
        this.wss.on("connection", socket => {
            socket.guildId = null;
            socket.playerListeners = {
                start: null,
                pause: null,
                end: null,
                stuck: null,
                update: null,
                volume: null
            };
            socket.on("message", packet => {
                try { JSON.parse(packet); } catch { return socket.close(1009, "Invalid JSON payload."); }
                const { id, alive } = JSON.parse(packet);
                const player = this.client.audioManager.get(id);
                if (alive) return this.socketSend(socket, { alive: true, now: Date.now() });
                if (!this.client.guilds.get(id)) return this.socketSend(socket, {
                    type: "NO_GUILD",
                    id: null,
                    data: null
                });
                socket.guildId = id;
                if (player) return this.playerListener(socket, player, id);
                this.socketSend(socket, {
                    type: "NO_PLAYER",
                    id: null,
                    data: null
                });
                this.client.once("newPlayer", player => this.playerListener(socket, player, id));
            });
            socket.on("error", error => this.client.console.wtf(`[WS ERROR] ${error}`));
            socket.on("close", () => {
                const player = this.client.audioManager.get(socket.guildId);
                if (!player) return;
                for (const [event, listener] of Object.entries(socket.playerListeners)) {
                    player.removeListener(event, listener);
                }
            });
        });
    }

    playerListener(socket, player, id) {
        this.socketSend(socket, {
            type: "PLAYER_INFO",
            id,
            data: {
                currentTrack: player.queue.length ? player.queue[0].toJSON() : null,
                currentQueue: player.queue.slice(1).length > 1 ? player.queue.slice(1).length.map(t => t.toJSON()) : null,
                position: player.playerState.currentPosition || 0
            }
        });
        socket.playerListeners.start = () => this.socketSend(socket, {
            type: "PLAYER_TRACK_START",
            id,
            data: {
                currentTrack: player.queue.length ? player.queue[0].toJSON() : null,
                currentQueue: player.queue.slice(1).length > 1 ? player.queue.slice(1).length.map(t => t.toJSON()) : null,
                position: player.playerState.currentPosition
            }     
        });
        socket.playerListeners.pause = paused => {
            if (paused) {
                this.socketSend(socket, {
                    type: "PLAYER_PAUSE",
                    id,
                    paused
                });
            } else {
                this.socketSend(socket, {
                    type: "PLAYER_RESUME",
                    id,
                    paused
                });
            }
        };
        socket.playerListeners.end = endEvent => {
            if (endEvent.reason === "REPLACED") return this.socketSend(socket, {
                type: "PLAYER_TRACK_REPLACED",
                id,
                data: {
                    currentTrack: player.queue.length ? player.queue[0].toJSON() : null,
                    currentQueue: player.queue.slice(1).length > 1 ? player.queue.slice(1).length.map(t => t.toJSON()) : null,
                    position: player.playerState.currentPosition,
                }
            });
            if (endEvent.reason === "FINISHED" && player.queue.length < 1) return this.socketSend(socket, {
                type: "PLAYER_QUEUE_FINISHED",
                id,
                data: null,
            });
        };
        socket.playerListeners.stuck = stuck => {
            this.socketSend(socket, {
                type: "PLAYER_STUCK",
                id,
                data: stuck
            });
        };
        socket.playerListeners.update = data => {
            this.socketSend(socket, {
                type: "PLAYER_UPDATE",
                id,
                data: {
                    currentTrack: player.queue.length ? player.queue[0].toJSON() : null,
                    currentQueue: player.queue.slice(1).length > 1 ? player.queue.slice(1).length.map(t => t.toJSON()) : null,
                    position: data.position
                }
            });
        }
        socket.playerListeners.volume = (oldVolume, newVolume) => {
            this.socketSend(socket, {
                type: "VOLUME_CHANGE",
                id,
                data: { oldVolume, newVolume }
            });
        }
        player.on("start", socket.playerListeners.start.bind(this));
        player.on("pause", socket.playerListeners.pause.bind(this));
        player.on("end", socket.playerListeners.end.bind(this));
        player.on("stuck", socket.playerListeners.stuck.bind(this));
        player.on("update", socket.playerListeners.update.bind(this));
        player.on("volume", socket.playerListeners.volume.bind(this));
    }

}

module.exports = Website;