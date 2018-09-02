const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const Discord = require("passport-discord");
const LevelSessionStore = require("level-session-store")(session);
const WebSocket = require("ws");
const http = require("http");
const helmet = require("helmet");

class Website {

    constructor(client) {
        Object.defineProperty(this, "client", { value: client, writable: false });
        this.app = express();
        this.server = http.createServer(this.app);
        this.store = new LevelSessionStore();
        this.wss = null;
    }

    loadGetRoutes() {
        this.app.get("/", (rq,rs,n)=>{rq.session.last = "/";n();}, (req, res) => {
            res.render("index", {
                authorized: req.isAuthenticated(),
                client: this.client,
                usr: req.user,
                owner: req.user ? this.isOwner(req.user) : false
            });
        });
        this.app.get("/player", (rq,rs,n)=>{rq.session.last = "/";n();}, (req, res) => {
            res.render("musicplayer", {
                authorized: req.isAuthenticated(),
                client: this.client,
                usr: req.user,
                owner: req.user ? this.isOwner(req.user) : false
            });
        });
        this.app.get("/login", passport.authenticate("discord", {
            failureRedirect: "/"
        }), (req, res) => res.redirect(req.session.last || "/"));
        this.app.get("/logout", this.authCheck, (req, res) => {
            req.logout();
            res.redirect("/");
        });
        this.app.get("/console", (rq,rs,n)=>{rq.session.last = "/console";n();}, this.authCheck, (req, res) => {
            if (this.isOwner(req.user)) {
                res.render("console", {
                    authorized: req.isAuthenticated(),
                    owner: req.user ? this.isOwner(req.user) : false,
                    usr: req.user,
                    log: this.client.logger.read().replace(/\[(..m|..\;..m|m)/g,"")
                });
            }
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
        // Passport
        this.app.use(helmet({
            frameguard: false
        }));
        passport.serializeUser((user, done) => done(null, user));
        passport.deserializeUser((user, done) => done(null, user));
        passport.use(new Discord.Strategy({
            clientID: this.client.user.id,
            clientSecret: this.client.config.secret,
            callbackURL: "https://remixbot.ml/login",
            scope: ["identify"]
        }, (assessToken, refreshToken, profile, done) => {
            process.nextTick(() => {
                return done(null, profile);
            });
        }));
        this.app.set("port", 3232);
        this.app.use(session({
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
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        // Body parser
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        // View engine and session
        this.app.set("view engine", "ejs");
        this.app.use("/assets", express.static(`${process.cwd()}/assets`));
        // Load routes
        this.loadGetRoutes();
        this.loadPostRoutes();
        // Listen
        this.server.listen(this.app.get("port"), () => {
            this.startWebsocket();
            this.client.console.log("The site is online.");
        });
        for (const stack of this.app._router.stack) {
            if (!stack.route) continue;
            this.client.console.log(`${stack.route.stack[0].method.toUpperCase()} ${stack.route.path}`);
        }
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
                update: null
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
                position: player.playerState.currentPosition
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
        player.on("start", socket.playerListeners.start.bind(this));
        player.on("pause", socket.playerListeners.pause.bind(this));
        player.on("end", socket.playerListeners.end.bind(this));
        player.on("stuck", socket.playerListeners.stuck.bind(this));
        player.on("update", socket.playerListeners.update.bind(this));
    }

}

module.exports = Website;