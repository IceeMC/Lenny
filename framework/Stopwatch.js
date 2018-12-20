/**
 * Represents a Stopwatch.
 */
class Stopwatch {

    constructor(ending) {
        this.ending = ending;
        this.startTime = null;
        this.stopTime = null;
    }

    /**
     * Starts the stopwatch.
     * @returns {this}
     */
    start() {
        this.startTime = Date.now();
        return this;
    }

    /**
     * Restarts the stopwatch setting the start to the current time.
     * @returns {this}
     */
    restart() {
        this.startTime = Date.now();
        this.endTime = null;
        return this;
    }

    /**
     * Stops the stopwatch and returns the duration.
     * @returns {number}
     */
    stop() {
        this.stopTime = Date.now();
        return (this.stopTime - this.startTime).toFixed(this.ending || 0);
    }

}

module.exports = Stopwatch;