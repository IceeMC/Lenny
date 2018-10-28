const cValRgx = /(?:R|G|B|Y|WILD)\+([0-9])/;

function validCardSave(save) {
    if (!save.rawName) return false;
    if (!save.info) return false;
    return true;
}

class UnoCard {

    constructor(rawName) {
        if (!UnoCard.cards.ALL.includes(rawName)) throw new Error(`${rawName} is NOT a valid UNO card.`);
        this.rawName = rawName;
        this.info = this.getInfo();
    }

    get cardUrl() {
        return `https://raw.githubusercontent.com/Ratismal/UNO/master/cards/${this.rawName}.png`;
    }

    getInfo() {
        let name, value, color, skip, reverse, wild, meta;
        name = this.getCardName();
        value = cValRgx.test(this.rawName) ? parseInt(cValRgx.exec(this.rawName)[1]) : 0;
        color = this.getHexCode(name);
        skip = this.rawName.includes("SKIP");
        reverse = this.rawName.includes("REVERSE");
        wild = this.rawName.includes("WILD");
        meta = skip ? " Skip" : reverse ? " Reverse" : wild ? ` Wild${value > 3 ? " +4" : ""}` : "";
        return { name, value, color, skip, reverse, wild, meta };
    }

    static from(cardSave) {

    }


    getCardName() {
        if (this.rawName.startsWith("R")) return "Red";
        if (this.rawName.startsWith("G")) return "Green";
        if (this.rawName.startsWith("B")) return "Blue";
        if (this.rawName.startsWith("Y")) return "Yellow";
        if (this.rawName === "WILD") return "Wild";
        if (this.rawName === "WILD+4") return "Wild +4";
    }

    getHexCode(name) {
        if (name === "Red") return 0xC40C00;
        if (name === "Green") return 0x328A10;
        if (name === "Yellow") return 0xE7D004;
        if (name === "Green") return 0x328A10;
        return 0x000001;
    }
    
    toString() {
        return `${this.info.name}${this.info.meta}`;
    }

    toJSON() {
        return {
            rawName: this.rawName,
            info: this.info,
            url: this.cardUrl
        };
    }

}

UnoCard.cards = {
    RED: ["R+2", "R0", "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "RREVERSE", "RSKIP"],
    GREEN: ["G+2", "G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "GREVERSE", "GSKIP"],
    BLUE: ["B+2", "B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "BREVERSE", "BSKIP"],
    YELLOW: ["Y+2", "Y0", "Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7", "Y8", "Y9", "YREVERSE", "YSKIP"],
    ACTION: ["WILD", "WILD+4"]
};
UnoCard.cards.ALL = [...UnoCard.cards.RED, ...UnoCard.cards.GREEN, ...UnoCard.cards.BLUE, ...UnoCard.cards.YELLOW, ...UnoCard.cards.ACTION];

module.exports = UnoCard;