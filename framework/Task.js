class Task {

    constructor(client, storeName, {
        name = null,
        interval = 0,
        once = false,
        runAfterSetup = false
    }) {
        this.client = client;
        this.store = this.client.storeManager.getStore(storeName);
        this.name = name;
        this.path = null;
        this.interval = interval;
        this.once = once;
        this.runAfterSetup = runAfterSetup;
        this._boundRun = null;
        this.runCount = 0;
    }

    async run() {
        throw `Task: ${this.constructor.name} does not have a run function.`;
    }

    get boundRun() {
        if (this._boundRun) return this._boundRun;
        this._boundRun = this.run.bind(this);
        return this._boundRun;
    }

    async _run() {
        this.runCount++;
        if (this.runCount === 1 && this.once) return this.store.files.delete(this.name);
        await this.boundRun().catch(e => {
            e.name = `TaskError [at ${this.name}]`;
            e.task = this;
            this.client.emit("error", e);
        });
    }

}

module.exports = Task;