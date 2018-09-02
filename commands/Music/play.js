const { Command , RichMenu } = require("klasa");
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
            return message.channel.send(`:white_check_mark: Enqueued song **${audioTrack.title}** by **${audioTrack.author}** (${audioTrack.length})`);
        }
    }

    play(message, listen = true) {
        if (listen) this._listen(message);
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        audioPlayer.setVolume(50);
        audioPlayer.play(audioPlayer.queue[0].track);
        return message.channel.send(`:musical_note: **${audioPlayer.queue[0].title}** is now being played as requested by \`${audioPlayer.queue[0].requester.tag}\``);
    }

    _listen(message) {
        const audioPlayer = this.client.audioManager.get(message.guild.id);
        audioPlayer.on("end", event => {
            if (event.reason === "REPLACED") return;
            if (event.reason === "FINISHED") {
                if (audioPlayer.looping) {
                    audioPlayer.play(audioPlayer.queue[0].track);
                    return message.channel.send(`:musical_note: **${audioPlayer.queue[0].title}** is now being played as requested by \`${audioPlayer.queue[0].requester.tag}\``);
                }
                audioPlayer.queue.shift();
                if (audioPlayer.queue.length < 1) {
                    audioPlayer.idle = true;
                    message.channel.send("The music party is over... Queue up some more music!");
                    this.client.audioManager.leave(message.guild.id);
                    // Discord bug fix
                    this.client.audioManager.forEach(aPlayer => {
                        aPlayer.pause();
                        return setTimeout(() => aPlayer.resume(), 700);
                    });
                } else {
                    audioPlayer.play(audioPlayer.queue[0].track);
                    return message.channel.send(`:musical_note: **${audioPlayer.queue[0].title}** is now being played as requested by \`${audioPlayer.queue[0].requester.tag}\``);
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

        if (!message.member.voiceChannel) return message.send("You must be in a voice channel first.");

        // YouTube URLS
        if (query.match(/https:\/\/?(www\.)?youtube\.com\/watch\?v=(.*)/)) {
            const tracks = await this.client.utils.getTracks(query, this.client.audioManager.nodes.get("localhost"));
            if (!tracks) return message.send("It seems like that URL is invalid. Enter a valid youtube URL and try again!");
            return await this.handle(new AudioTrack(tracks[0], message.author), message);
        }

        if (query.match(/https:\/\/?(www\.)?youtu\.be\/(.*)/)) {
            const tracks = await this.client.utils.getTracks(query, this.client.audioManager.nodes.get("localhost"));
            if (!tracks) return message.send("It seems like that URL is invalid. Enter a valid youtube URL and try again!");
            return await this.handle(new AudioTrack(tracks[0], message.author), message);
        }

        if (query.match(/(\?|\&)list=(.*)/)) {
            const { name, tracks } = await this.client.utils.getTracks(query, this.client.audioManager.nodes.get("localhost"));
            if (!tracks) return message.send("It seems like that URL is invalid. Enter a valid youtube URL and try again!");
            let queued = 0;
            for (let i = 0; i < 50; i++) {
                if (!tracks[i]) continue;
                await this.handle(new AudioTrack(tracks[i], message.author), message, true);
                queued++;
            }
            return message.send(`Playlist **${name}** enqueued with \`${queued}\` song${queued === 1 ? "" : "s"}.`);
        }

        // SoundCloud URLS
        if (query.match(/https:\/\/?(www\.)?soundcloud\.com\/.*\/.*/)) {
            const tracks = await this.client.utils.getTracks(query, this.client.audioManager.nodes.get("localhost"));
            if (!tracks) return message.send("It seems like that URL is invalid. Enter a valid soundcloud URL and try again!");
            return await this.handle(new AudioTrack(tracks[0], message.author), message);
        }

        if (query.match(/https:\/\/?(www\.)?soundcloud\.com\/.*\/.*\/.*/)) {
            const tracks = await this.client.utils.getTracks(query, this.client.audioManager.nodes.get("localhost"));
            if (!tracks) return message.send("It seems like that URL is invalid. Enter a valid soundcloud URL and try again!");
            return await this.handle(new AudioTrack(tracks[0], message.author), message);
        }

        const tracks = await this.client.utils.getTracks(`ytsearch:${query}`, this.client.audioManager.nodes.get("localhost"));
        if (!tracks) return message.send(`No songs found. Try looking for something different!`);
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