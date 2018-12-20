const Cooldown = require("./Cooldown.js");

class CooldownManager {

    constructor() {
        this.maps = new Map();
    }

    gen(name) {
        this.maps.set(name, new Map());
        return this.maps.get(name);
    }

    create(name, { key, cooldown, bypass = false } = {}) {
        if (!name || !key || !cooldown) throw null;
        if (bypass) throw null;
        if (!this.maps.has(name)) throw null;
        if (this.maps.get(name).has(key)) throw "CD_ACTIVE";
        const cd = new Cooldown(this, { name, key, cooldown });
        cd.run().then(() => cd.delete());
    }

    time(name, key) {
        if (!name || !key) return 0;
        if (!this.maps.get(name) || !this.maps.get(name).has(key)) return 0;
        return this.maps.get(name).get(key).cooldown;
    }

}

module.exports = CooldownManager;