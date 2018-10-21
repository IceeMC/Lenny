const { Task } = require("klasa");
const randomHexColor = require("random-hex-color");
const { loadavg } = require("os");

class CPUCapture extends Task {

    run() {
        const usage = loadavg().map(avg => avg * 10000 / 1000).reduce((p, v) => p + v).toFixed(2);
        const color = randomHexColor();
        if (this.client.cpuCaptures.length > 9) {
            this.client.cpuCaptures = [{ usage, color }];
        } else {
            this.client.cpuCaptures.push({ usage, color });
        }
    }

    async init() {
        if (!this.client.settings.schedules.some(schedule => schedule.taskName === this.name)) {
            await this.client.schedule.create("CPUCapture", "*/1 * * * *");
        }
    }

}

module.exports = CPUCapture;