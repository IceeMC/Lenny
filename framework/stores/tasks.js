const Store = require("../Store");

class TaskStore extends Store {

    async setup() {
        for (const task of [...this.files.values()]) {
            if (task.runAfterSetup) await task._run();
            if (task.interval > 0) setInterval(task._run.bind(this), task.interval);
        }
    }

}

module.exports = TaskStore;