const { Command } = require("klasa");
const AudioTrack = require("../../utils/music/AudioTrack.js");
const { get } = require("superagent");

class Play extends Command {

    constructor(...args) {
        super(...args, {
            name: "play",
            runIn: ["text"],
            description: language => language.get("COMMAND_PLAY_DESCRIPTION"),
            usage: "<query:string>",
            requiredPermissions: ["CONNECT", "SPEAK", "ADD_REACTIONS"],
        });
        this.regex = {
            replacer: /(?:\<|\>)/g,
            youtube: {
                full: /https:\/\/?(?:www\.)?youtube\.com\/watch\?v=(.*)/,
                short: /https:\/\/?(?:www\.)?youtu\.be\/(.*)/,
                playlist: /(?:\?|\&)list=(.*)/
            },
            soundcloud: {
                track: /https:\/\/?(?:www\.)?soundcloud\.com\/.*\/.*/,
                playlist: /https:\/\/?(?:www\.)?soundcloud\.com\/.*\/.*\/.*/
            },
            spotify: {
                trackOrAlbum: /https:\/\/(?:embed\.|open\.)spotify\.com\/(track|album)\/(.{22})/,
                customPlaylist: /https:\/\/(?:embed\.|open\.)spotify\.com\/user\/(.{25})\/playlist\/(.{22})/
            }
        }
    }

    async handle(audioTrack, message, playlist = false) {
        let audioPlayer = this.client.audioManager.get(message.guild.id);
        if (!audioPlayer) {
            audioPlayer = await this.client.audioManager.join({
                guildId: message.guild.id,
                channelId: message.member.voice.channelID,
                host: "localhost"
            });

            audioPlayer.enQueue(audioTrack)
            audioPlayer.playing = true;
            return this.play(message, true);
        } else if (audioPlayer.queue.length < 1 && audioPlayer.idle) {
            await this.client.audioManager.join({
                guildId: message.guild.id,
                channelId: message.member.voice.channelID,
                host: "localhost"
            });
            audioPlayer.enQueue(audioTrack);
            audioPlayer.playing = true;
            audioPlayer.idle = false;
            return this.play(message);
        } else {
            audioPlayer.enQueue(audioTrack);
            if (playlist) return;
            return message.channel.send(message.language.get("COMMAND_MUSIC_ENQUEUED", audioTrack));
        }
    }

    play(message, listen = false) {
        if (listen) this._listen(message);
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        audioPlayer.play(audioPlayer.queue[0].track);
        return message.channel.send(message.language.get("COMMAND_MUSIC_PLAYING", audioPlayer));
    }

    _listen(message) {
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        audioPlayer.on("end", event => {
            if (event.reason === "REPLACED") return;
            if (event.reason === "FINISHED") {
                if (audioPlayer.looping) return audioPlayer.play(audioPlayer.queue[0].track);
                audioPlayer.queue.shift();
                if (audioPlayer.queue.length < 1) {
                    audioPlayer.idle = true;
                    message.channel.send(message.language.get("COMMAND_MUSIC_END"));
                    this.client.audioManager.leave(message.guild.id);
                    // Discord bug fix
                    for (const player of this.client.audioManager.values()) {
                        if (player.idle) continue;
                        player.pause();
                        setTimeout(() => player.resume(), 700);
                    }
                } else {
                    audioPlayer.play(audioPlayer.queue[0].track);
                    return message.channel.send(message.language.get("COMMAND_MUSIC_PLAYING", audioPlayer));
                }
            }
        });
        audioPlayer.on("stuck", stuck => this.client.console.error(`Player ${message.guild.id} | Stuck position: ${stuck.stuckAt}ms`));
        audioPlayer.on("error", error => this.client.console.error(`Player ${message.guild.id} | Error: ${error.error}`));
    }

    convert(tracks, requester) {
        return tracks.map(track => new AudioTrack(track, requester));
    }

    async run(message, [query]) {
        query = query.replace(this.regex.escaper, "");

        if (!message.member.voice.channelID) throw message.language.get("COMMAND_PLAY_NO_VC");

        if (await this.fromLink(message, query)) return;
        const tracks = await this.client.utils.getTracks(`ytsearch:${query}`, "localhost");
        if (!tracks) throw message.language.get("COMMAND_PLAY_NO_TRACKS");
        const converted = this.convert(tracks.slice(0, 10), message.author);
        const prompt = await message.prompt(`
**Song selection**

${converted.map((t, i) => `📻(${i+1}) ➡ **${t.title}** (${t.length})`).join("\n")}

Please provide a number between 1 and 10.
If you wish to cancel this selection type \`cancel\` or \`quit\`
**This will automatically cancel in 1 minute!**
        `, 60000);
        const index = parseInt(prompt.content);
        const invalidNumber = (isNaN(index) == true) ? NaN : (index < 0 && 11 > index) ? NaN : index;
        if (prompt.content.search("cancel") !== -1 || invalidNumber != index)
            return message.send(`Song selection canceled.${isNaN(invalidNumber) ? " You didn't provide a number between 1 and 10." : ""}`);
        else return await this.handle(converted[index - 1], message);
    }

    async fromLink(message, query) {
        const youtubeFullMatch = this.regex.youtube.full.exec(query);
        const youtubeShortMatch = this.regex.youtube.full.exec(query);
        const youtubePlaylistMatch = this.regex.youtube.full.exec(query);

        const soundcloudTrack = this.regex.soundcloud.track.exec(query);
        const soundcloudPlaylist = this.regex.soundcloud.playlist.exec(query);

        const spotifyTrackOrAlbum = this.regex.spotify.trackOrAlbum.exec(query);
        // const spotifyPlaylist = this.regex.spotify.customPlaylist.exec(query);

        // Test matches
        if (youtubeFullMatch) {
            const tracks = await this.client.utils.getTracks(youtubeFullMatch[1], "localhost");
            if (!tracks) throw message.language.get("COMMAND_PLAY_NO_TRACKS");
            await this.handle(this.convert(tracks, message.author)[0], message);
            return true;
        } else if (youtubeShortMatch) {
            const tracks = await this.client.utils.getTracks(youtubeShortMatch[1], "localhost");
            if (!tracks) throw message.language.get("COMMAND_PLAY_NO_TRACKS");
            await this.handle(this.convert(tracks, message.author)[0], message);
            return true;
        } else if (youtubePlaylistMatch) {
            const { name, tracks } = await this.client.utils.getTracks(youtubePlaylistMatch[1], "localhost");
            if (!tracks) throw message.language.get("COMMAND_PLAY_NO_TRACKS");
            for (let i = 0; i < 50; i++) {
                if (!tracks[i]) continue;
                await this.handle(new AudioTrack(tracks[i], message.author), message, true);
            }
            message.sendLocale("COMMAND_PLAYLIST_queueD", [{ name, tracks }]);
            return true;
        } else if (soundcloudTrack) {
            const tracks = await this.client.utils.getTracks(soundcloudTrack[0], "localhost");
            if (!tracks) throw message.language.get("COMMAND_PLAY_NO_TRACKS");
            await this.handle(new AudioTrack(tracks[0], message.author), message);
            return true;
        } else if (soundcloudPlaylist) {
            const tracks = await this.client.utils.getTracks(soundcloudPlaylist[0], "localhost");
            if (!tracks) throw message.language.get("COMMAND_PLAY_NO_TRACKS");
            await this.handle(new AudioTrack(tracks[0], message.author), message);
            return true;
        } else if (spotifyTrackOrAlbum) {
            const type = spotifyTrackOrAlbum[1];
            const id = spotifyTrackOrAlbum[2];
            if (type === "track") {
                const m = await message.send("Please wait... I am processing your request! (Note that this does not actually play songs from spotify!)");
                let track = (await get(`https://api.spotify.com/v1/tracks/${id}`).set("Authorization", `Bearer ${this.client.spotifyToken}`)).body;
                track = await this.client.utils.getTracks(`ytsearch:${track.name}`, "localhost");
                if (!track) throw message.language.get("COMMAND_PLAY_NO_TRACKS");
                await m.delete();
                await this.handle(new AudioTrack(track[0], message.author), message);
            }
            if (type === "album") {
                const m = await message.send("Please wait... I am processing your request! (Note that this does not actually play songs from spotify!)");
                let album = (await get(`https://api.spotify.com/v1/albums/${id}`).set("Authorization", `Bearer ${this.client.spotifyToken}`)).body;
                for (let i = 0; i < 50; i++) {
                    if (!album.tracks.items[i]) continue;
                    const result = await this.client.utils.getTracks(`ytsearch:${album.tracks.items[i].name}`, "localhost");
                    if (!result) continue;
                    await this.handle(new AudioTrack(result[0], message.author), message, true);
                }
                await m.delete();
                message.sendLocale("COMMAND_PLAYLIST_ENQUEUED", [{ name: album.name, tracks: album.tracks.items  }]);
            }
            return true;
        }

        return false;
    }

}

module.exports = Play;