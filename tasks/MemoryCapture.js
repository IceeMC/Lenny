const { Task } = require("klasa");
const randomHexColor = require("random-hex-color");

class MemoryCapture extends Task {

    run() {
        const usage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const color = randomHexColor();
        if (this.client.memoryCaptures.length > 9) {
            this.client.memoryCaptures = [{ usage, color }];
        } else {
            this.client.memoryCaptures.push({ usage, color });
        }
    }

    async init() {
        if (!this.client.settings.schedules.some(schedule => schedule.taskName === this.name)) {
            await this.client.schedule.create("MemoryCapture", "*/1 * * * *");
        }
    }

}

module.exports = MemoryCapture;