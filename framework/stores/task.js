const Store = require("../Store");

class TaskStore extends Store {

    async setup() {
        for (const task of [...this.files.values()]) {
            setInterval(async () => { await task.bound().catch(e => {
                e.name = `TaskError [at ${task.name}]`;
                e.task = task;
            }) }, task.interval);
        }
    }

}

module.exports = TaskStore;