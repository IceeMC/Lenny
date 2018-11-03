const { Task } = require("klasa");
const { post } = require("superagent");

class SpotifyToken extends Task {

    async run() {
        const res = await post("https://accounts.spotify.com/api/token")
            .send({ grant_type: "client_credentials" })
            .set("Authorization", `Basic ${Buffer.from(`${this.client.config.spotify.id}:${this.client.config.spotify.secret}`).toString("base64")}`)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .catch(e => { res = e.response; });
        if (res.status !== 200) this.client.spotifyToken = null;
        this.client.spotifyToken = res.body.access_token;
    }

    async init() {
        const res = await post("https://accounts.spotify.com/api/token")
            .send({ grant_type: "client_credentials" })
            .set("Authorization", `Basic ${Buffer.from(`${this.client.config.spotify.id}:${this.client.config.spotify.secret}`).toString("base64")}`)
            .set("Content-Type", "application/x-www-form-urlencoded")
            .catch(e => { res = e.response; });
        if (res.status !== 200) this.client.spotifyToken = null;
        this.client.spotifyToken = res.body.access_token;
        res.status !== 200 ? 
            this.client.console.error(`Failed to get spotify authorization token: ${res.status} - ${STATUS_CODES[res.status]}`) :
            this.client.console.log(`Got spotify authorization token: ${res.body.access_token}`);
        if (!this.client.settings.schedules.some(schedule => schedule.taskName === this.name)) {
            await this.client.schedule.create("SpotifyToken", "*/60 * * * *");
        }
    }

}

module.exports = SpotifyToken;