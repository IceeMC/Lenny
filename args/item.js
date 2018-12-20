const Arg = require("../framework/commandUsage/Arg.js");

class ItemArg extends Arg {

    constructor(...args) {
        super(...args, { aliases: ["storeItem"] });
    }

    run(_, arg) {
        const stores = this.client.storeManager.values();
        const found = stores.map(s => s.get(arg));
        console.log(found);
        if (!found) throw `Item: \`${arg}\` does not exist!`;
        return found;
    }

}

module.exports = ItemArg;