const { Command } = require("klasa");
const AudioTrack = require("../../utils/music/AudioTrack.js");

class Play extends Command {

    constructor(...args) {
        super(...args, {
            name: "play",
            runIn: ["text"],
            description: language => language.get("COMMAND_PLAY_DESCRIPTION"),
            usage: "<query:string>",
            requiredPermissions: ["CONNECT", "SPEAK", "ADD_REACTIONS"],
        });
    }

    async handle(audioTrack, message, playlist = false) {
        let audioPlayer = this.client.audioManager.get(message.guild.id);
        if (!audioPlayer) {
            audioPlayer = await this.client.audioManager.join({
                guildId: message.guild.id,
                channelId: message.member.voiceChannel.id,
                host: "localhost"
            });

            audioPlayer.queue.push(audioTrack);
            audioPlayer.playing = true;
            return this.play(message);
        } else if (audioPlayer.queue.length < 1 && audioPlayer.idle) {
            await this.client.audioManager.join({
                guildId: message.guild.id,
                channelId: message.member.voiceChannel.id,
                host: "localhost"
            });
            audioPlayer.queue.push(audioTrack);
            audioPlayer.playing = true;
            return this.play(message, false);
        } else {
            audioPlayer.queue.push(audioTrack);
            if (playlist) return;
            return message.channel.send(message.language.get("COMMAND_MUSIC_ENQUEUED", audioTrack));
        }
    }

    play(message, listen = true) {
        if (listen) this._listen(message);
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        audioPlayer.setVolume(50);
        audioPlayer.play(audioPlayer.queue[0].track);
        return message.channel.send(message.language.get("COMMAND_MUSIC_PLAYING", audioPlayer));
    }

    _listen(message) {
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        audioPlayer.on("end", event => {
            if (event.reason === "REPLACED") return;
            if (event.reason === "FINISHED") {
                if (audioPlayer.looping) {
                    audioPlayer.play(audioPlayer.queue[0].track);
                    return message.channel.send(message.language.get("COMMAND_MUSIC_PLAYING", audioPlayer));
                }
                audioPlayer.queue.shift();
                if (audioPlayer.queue.length < 1) {
                    audioPlayer.idle = true;
                    message.channel.send(message.language.get("COMMAND_MUSIC_END"));
                    this.client.audioManager.leave(message.guild.id);
                    // Discord bug fix
                    this.client.audioManager.forEach(aPlayer => {
                        aPlayer.pause();
                        return setTimeout(() => aPlayer.resume(), 700);
                    });
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
        const temp = [];
        for (const track of tracks) temp.push(new AudioTrack(track, requester));
        return temp;
    }

    async run(message, [query]) {
        query = query.replace(/\</g, "").replace(/\>/g, "");

        if (!message.member.voiceChannel) throw message.language.get("COMMAND_PLAY_NO_VC");

        // YouTube URLS
        if (query.match(/https:\/\/?(www\.)?youtube\.com\/watch\?v=(.*)/)) {
            const tracks = await this.client.utils.getTracks(query, this.client.audioManager.nodes.get("localhost"));
            if (!tracks) throw message.language.get("COMMAND_PLAY_NO_TRACKS");
            return await this.handle(this.convert(tracks, message.author)[0], message);
        }

        if (query.match(/https:\/\/?(www\.)?youtu\.be\/(.*)/)) {
            const tracks = await this.client.utils.getTracks(query, this.client.audioManager.nodes.get("localhost"));
            if (!tracks) throw message.language.get("COMMAND_PLAY_NO_TRACKS");
            return await this.handle(this.convert(tracks, message.author)[0], message);
        }

        if (query.match(/(\?|\&)list=(.*)/)) {
            const { name, tracks } = await this.client.utils.getTracks(query, this.client.audioManager.nodes.get("localhost"));
            if (!tracks) throw message.language.get("COMMAND_PLAY_NO_TRACKS");
            let queued = 0;
            for (let i = 0; i < 50; i++) {
                if (!tracks[i]) continue;
                await this.handle(new AudioTrack(tracks[i], message.author), message, true);
                queued++;
            }
            return message.sendLocale("COMMAND_PLAYLIST_ENQUEUED", [{ name, tracks }]);
        }

        // SoundCloud URLS
        if (query.match(/https:\/\/?(www\.)?soundcloud\.com\/.*\/.*/)) {
            const tracks = await this.client.utils.getTracks(query, this.client.audioManager.nodes.get("localhost"));
            if (!tracks) throw message.language.get("COMMAND_PLAY_NO_TRACKS");
            return await this.handle(new AudioTrack(tracks[0], message.author), message);
        }

        if (query.match(/https:\/\/?(www\.)?soundcloud\.com\/.*\/.*\/.*/)) {
            const tracks = await this.client.utils.getTracks(query, this.client.audioManager.nodes.get("localhost"));
            if (!tracks) throw message.language.get("COMMAND_PLAY_NO_TRACKS");
            return await this.handle(new AudioTrack(tracks[0], message.author), message);
        }

        const tracks = await this.client.utils.getTracks(`ytsearch:${query}`, this.client.audioManager.nodes.get("localhost"));
        if (!tracks) throw message.language.get("COMMAND_PLAY_NO_TRACKS");
        const converted = this.convert(tracks.slice(0, 10), message.author);
        const prompt = await message.prompt(`
**Song select:tm:**

${converted.map(t => `📻 ➡ **${t.title}** (${t.length})`).join("\n")}

Please provide a number between 1 and 10.
If you wish to cancel this selection type \`cancel\` or \`quit\`
**This will cancel in 1 minute**
        `, 60000);
        let parsed = parseInt(prompt.content);
        if (prompt.content.match(/(cancel|quit)/)) return message.send("Song selection canceled.");
        if (parsed < 0 || parsed > 10) return message.send("You need to provide a number between 1 and 10... Selection stopped!");
        return await this.handle(converted[parsed - 1], message);
    }

}

module.exports = Play;