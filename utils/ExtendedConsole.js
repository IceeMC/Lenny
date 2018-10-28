const { KlasaConsole } = require("klasa");
const CatLoggr = require("cat-loggr");

class ExtendedConsole extends KlasaConsole {

    constructor(...args) {
        super(...args);
        
    }

    log(...data) {
        return this
    }

}