class Cooldown {

    constructor(manager, { name, key, cooldown }) {
        this.manager = manager;
        this.name = name;
        this.key = key;
        this.cooldown = cooldown;
        this.interval = null;
    }

    async run() {
        return new Promise(resolve => {
            this.interval = setInterval(() => this.update({ cooldown: this.cooldown - 1000 }), 1000);
            this.update();
            setTimeout(() => {
                clearInterval(this.interval);
                return resolve();
            }, this.cooldown);
        });
    }

    delete() {
        return this.manager.maps.get(this.name).delete(this.key);
    }

    update({
        cooldown = this.cooldown,
        interval = this.interval
    } = {}) {
        this.cooldown = cooldown;
        this.interval = interval;
        return this.manager.maps.get(this.name).set(this.key, { cooldown, interval });
    }

}

module.exports = Cooldown;