const { Task } = require("klasa");
const { inspect } = require("util");
const { post } = require("superagent");

class DBL extends Task {

    async run() {
        return post(`https://discordbots.org/api/bots/${this.client.user.id}/stats`)
            .set("Authorization", this.client.config.dbl)
            .send({ server_count: this.client.guilds.size });
    }

    async init() {
        if (!this.client.settings.schedules.some(schedule => schedule.taskName === this.name)) {
            await this.client.schedule.create("DBL", "*/15 * * * *");
        }
    }

}

module.exports = DBL;