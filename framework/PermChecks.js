class PermChecks {

    constructor() {
        this.checks = {};
    }

    add(level, run, { sendError = false } = {}) {
        this.checks[level] = { sendError, run };
        return this;
    }

    async runCheck(level, message) {
        const check = this.checks[level];
        if (!check) throw `${level} returned an invalid level.`;
        const value = await check.run(message.client, message);
        if (typeof value !== "boolean") throw new Error(`PermCheck ${level} does not return a boolean.`);
        return { check, value };
    }

    async runAll(message) {
        const values = await Promise.all([...Object.keys(this.checks).map(async c => (await this.runCheck(c, message)).value)]);
        if (values.includes(false)) throw null;
        return null;
    }
 
}

module.exports = PermChecks;