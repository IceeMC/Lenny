const express = require("express");
const serveStatic = require("serve-static");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const Discord = require("passport-discord");
const LevelSessionStore = require("level-session-store")(session);
const WebSocketServer = require("./WebSocketServer.js");
const http = require("http");
const helmet = require("helmet");
const exec = require("util").promisify(require("child_process").exec);
const fs = require("fs");
const { upvoteChannel } = require("../utils/Constants.js");
const { MessageEmbed } = require("discord.js");

class Website {

    constructor(client) {
        Object.defineProperty(this, "client", { value: client, writable: false });
        this.express = express();
        this.app = require("next")({ dev: false, dir: __dirname });
        this.requestHandler = this.app.getRequestHandler();
        this.server = http.createServer(this.express);
        this.store = new LevelSessionStore();
        this.wss = null;
    }

    loadGetRoutes() {
        this.express.get("/", (rq,_,n)=>{rq.last = "/";n();}, (req, res) => {
            this.app.render(req, res, "/homepage", {
                authorized: req.isAuthenticated(),
                stats: { guilds: this.client.guilds.size },
                usr: req.user ? req.user : null,
                owner: req.user ? this.isOwner(req.user) : false
            });
        });
        this.express.get("/player", (rq,_,n)=>{rq.last = "/";n();}, (req, res) => {
            this.app.render(req, res, "/musicplayer", {
                authorized: req.isAuthenticated(),
                stats: { guilds: this.client.guilds.size },
                usr: req.user ? req.user : null,
                owner: req.user ? this.isOwner(req.user) : false
            });
        });
        this.express.get("/login", passport.authenticate("discord", {
            failureRedirect: "/"
        }), (req, res) => res.redirect(req.last || "/"));
        this.express.get("/logout", this.authCheck, (req, res) => {
            req.logout();
            res.redirect("/");
        });
        /* this.express.get("/console", (rq,_,n)=>{rq.last = "/console";n();}, this.authCheck, (req, res) => {
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
        this.express.post("/upvotes", async (req, res) => {
            if (!req.headers["authorization"]) return res.status(400).json({ message: "Missing authorization header." });
            if (req.headers["authorization"] !== this.client.config.upvoteKey) return res.status(400).json({ message: "Invalid auth header." });
            const user = this.client.users.get(req.body.user) || await this.client.users.fetch(req.body.user);
            const type = req.body.type;
            const weekend = req.body.isWeekend ? "double the" : "";
            if (type === "upvote") {
                const channel = this.client.channels.get(upvoteChannel);
                channel.send(new MessageEmbed()
                    .setTitle("New Upvote")
                    .setColor(this.client.utils.color)
                    .setAuthor(user.tag, user.displayAvatarURL({ format: "png" }))
                    .setDescription(`${user} upvoted Chat Noir. Thanks for showing ${weekend} support!`)
                ).catch(e => this.client.emit("wtf", `[UPVOTES] Failed to send:\n${e.stack || e}`));
            }
        });
    }

    isOwner(user) {
        return this.client.config.developers.includes(user.id);
    }

    authCheck(req, res, next) {
        if (req.isAuthenticated()) return next();
        return res.redirect("/login");
    }

    async build() {
        this.client.console.log("Starting build! This could take a while...");
        const start = Date.now();
        // Try and delete the old next.js build
        if (fs.existsSync(`${__dirname}/.next`)) await exec(`rm -rf ${__dirname}/.next`);
        // Execute 'npx next build' to build app.
        await exec("npx next build", { cwd: __dirname });
        this.client.console.log(`Finished building in ${(Date.now() - start).toFixed(2)}ms.`);
        return true;
    }

    async start() {
        // Prepare next.js after building the files
        await this.app.prepare();
        // Build
        await this.build();
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
            cookie : {
                maxAge: 31536000000
            },
            secret: this.client.config.sessionSecret,
            saveUninitialized: true,
            resave: true,
            store: this.store   
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
            this.wss = new WebSocketServer(this).start();
            this.client.console.log("> Ready on port 3232");
        });
    }

}

module.exports = Website;