const Arg = require("../framework/commandUsage/Arg.js");

class ItemArg extends Arg {

    constructor(...args) {
        super(...args, { aliases: ["storeItem"] });
    }

    run(_, arg) {
        const stores = this.client.storeManager.values();
        const store = stores.filter(s => s.files.has(arg))[0];
        if (!store) throw `Item: \`${arg}\` does not exist!`;
        return store.get(arg);
    }

}

module.exports = ItemArg;