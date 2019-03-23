const Store = require("../Store");

class TaskStore extends Store {

    async setupAfterReady() {
        for (const task of [...this.files.values()]) {
            if (task.runAfterSetup) await task._run();
            if (task.interval > 0) setInterval(async () => await task._run(), task.interval);
        }
    }

}

module.exports = TaskStore;