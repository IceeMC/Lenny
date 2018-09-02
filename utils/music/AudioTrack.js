/**
 * Represents a lavalink track.
 */
class AudioTrack {

    constructor(data, requester) {
        Object.defineProperty(this, "data", { value: data, writable: false });
        Object.defineProperty(this, "requester", { value: requester, writable: true });
        this.track = data.track;
        this.identifier = data.info.identifier;
        this.isSeekable = data.info.isSeekable;
        this.author = data.info.author;
        this.length = this._timestamp(data.info.length);
        this.isStream = data.info.isStream;
        this.title = data.info.title;
        this.uri = data.info.uri;
    }

    _timestamp(time) {
        const seconds = parseInt((time / 1000) % 60);
        const minutes = parseInt((time / (1000 * 60)) % 60);
        const hours = parseInt((time / (1000 * 60 * 60)) % 24);
        return `${hours === 0 ? "" : `${this._pad(hours, 2)}:`}${minutes === 0 ? "" : `${this._pad(minutes, 2)}:`}${this._pad(seconds, 2)}`;
    }

    _pad(num, idleLength) {
        let str = `${num}`;
        while (str.length < idleLength) {
            str = `0${str}`;
        }
        return str;
    }

    toString() {
        return `
Title: ${this.title}
Author: ${this.author}
Length: ${this.length}
Url: ${this.uri}
        `;
    }

    toJSON() {
        return {
            requester: {
                username: this.requester.username,
                id: this.requester.id,
                discriminator: this.requester.discriminator,
                tag: this.requester.tag
            },
            track: this.title,
            identifier: this.identifier,
            isSeekable: this.isSeekable,
            author: this.author,
            length: this.length,
            msLength: this.data.info.length,
            isStream: this.isSeekable,
            title: this.title,
            uri: this.uri
        };
    }

}

module.exports = AudioTrack;