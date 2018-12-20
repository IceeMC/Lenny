class Stopwatch {

    constructor(ending) {
        this.ending = ending;
        this.startTime = null;
        this.stopTime = null;
    }

    start() {
        this.startTime = Date.now();
        return this;
    }

    restart() {
        this.startTime = Date.now();
        this.endTime = null;
        return this;
    }

    stop() {
        this.stopTime = Date.now();
        return (this.stopTime - this.startTime).toFixed(this.ending || 0);
    }

}

module.exports = Stopwatch;