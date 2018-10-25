const fs = require("fs");
const { EventEmitter } = require("events");

class Logger extends EventEmitter {

    constructor(client, file) {
        super();
        Object.defineProperty(this, "client", { value: client, writable: false });
        this.fullPath = `${process.cwd()}/${file}`;
        this.filename = file;
        if (!fs.existsSync(this.fullPath)) {
            fs.openSync(this.fullPath, "w");
            this.client.console.log(`File saved as ${this.filename}`);
        } else {
            this._reset();
            this.client.console.log(`Loaded log file ${this.filename}`);
        }
    }

    read(length = null) {
        if (length) return fs.readFileSync(this.fullPath, { encoding: "utf8" }).slice(0, length);
        return fs.readFileSync(this.fullPath, { encoding: "utf8" });
    }

    write(text) {
        this.emit("write");
        return fs.appendFileSync(this.fullPath, text, { encoding: "utf8" });
    }

    _reset() {
        return fs.writeFileSync(this.fullPath, "");
    }

}

module.exports = Logger;