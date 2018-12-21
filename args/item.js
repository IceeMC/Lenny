const Arg = require("../framework/commandUsage/Arg.js");

class ItemArg extends Arg {

    constructor(...args) {
        super(...args, { aliases: ["storeItem"] });
    }

    run(_, arg) {
        const stores = this.client.storeManager.values();
        const store = stores.find(s => s.files.has(arg));
        if (!store) throw `Item: \`${arg}\` does not exist!`;
        return store.get(arg);
    }

}

module.exports = ItemArg;
