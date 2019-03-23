const Task = require("../framework/Task");

class Spotify extends Task {

    constructor(...args) {
        super(...args, {
            runAfterSetup: true,
            interval: 60 * 60 * 1000
        })
    }

    async run() {
        this.client.console.log("Getting spotify token...");
        const { error, token } = await this.client.utils.getSpotifyToken();
        if (error) return this.client.console.wtf(`Failed to get spotify token: ${error.message || error}`);
        this.client.console.log(`Got spotify token: ${token}`);
        this.client.spotifyToken = token;
    }

}

module.exports = Spotify;