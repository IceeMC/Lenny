const Store = require("../Store");

class TaskStore extends Store {

    async setup() {
        for (const task of [...this.files.values()]) {
            setInterval(task._run.bind(this), task.interval);
        }
    }

}

module.exports = TaskStore;