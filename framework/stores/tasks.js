const Store = require("../Store");

class TaskStore extends Store {

    async setupAfterReady() {
        for (const task of [...this.files.values()]) {
            if (task.runAfterSetup) await task._run();
            if (task.interval > 0) setInterval(task._run.bind(this), task.interval);
        }
    }

    async forceRun(task, { time = task.interval, instant = false }) {
        if (instant) return await task._run();
        setTimeout(task._run.bind(this), time);
        return task;
    }

}

module.exports = TaskStore;