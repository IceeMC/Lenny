const Store = require("../Store");

class TaskStore extends Store {

    async setupAfterReady() {
        for (const task of [...this.files.values()]) {
            console.log(task);
            if (task.interval > 0) setInterval(task._run.bind(this), task.interval);
        }
    }

}

module.exports = TaskStore;