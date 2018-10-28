const cValRgx = /(?:R|G|B|Y|WILD)\+([0-9])/;

class UnoCard {

    constructor(rawName) {
        if (!this.isValidCard(rawName)) throw new Error("Invalid card. Makes sure you are getting it from UnoCard.cards.ALL");
        this.rawName = rawName;
        this.info = this.getInfo();
    }

    isValidCard(name) {
        return UnoCard.cards.ALL.includes(name);
    }

    getInfo() {
        let name, value, skip, reverse, wild, wild4, meta;
        name = this.getCardName();
        reverse = this.rawName.includes("REVERSE");
        value = cValRgx.test(this.rawName) ? parseInt(cValRgx.exec(this.rawName)[1]) : 0;
        wild = this.rawName.includes("WILD");
        wild4 = this.rawName.includes("WILD+4");
        meta = skip ? " Skip" : reverse ? " Reverse" : wild ? ` Wild ${value > 0 ? `+${value}` : ""}` : "";
        return { name, value, skip, addsCards, reverse, wild, wild4, meta };
    }


    getCardName() {
        if (this.rawName.startsWith("R")) return "Red";
        if (this.rawName.startsWith("G")) return "Green";
        if (this.rawName.startsWith("B")) return "Blue";
        if (this.rawName.startsWith("Y")) return "Yellow";
        if (this.rawName === "WILD") return "Wild";
        if (this.rawName === "WILD+4") return "Wild +4";
    }

    getHexCode() {
        if (this.info.name === "Red") return 0xC40C00;
        if (this.info.name === "Green") return 0x328A10;
        if (this.info.name === "Yellow") return 0xE7D004;
        if (this.info.name === "Green") return 0x328A10;
        return 0x000001;
    }
    
    toString() {
        return `${this.info.name}${this.info.meta}`;
    }

}

UnoCard.cards = {
    RED: ["R+2", "R0", "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "RREVERSE", "RSKIP", "RWILD+4", "RWILD"],
    GREEN: ["G+2", "G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "GREVERSE", "GSKIP", "GWILD+4", "GWILD"],
    BLUE: ["B+2", "B0", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "BREVERSE", "BSKIP", "BWILD+4", "BWILD"],
    YELLOW: ["Y+2", "Y0", "Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7", "Y8", "B9", "YREVERSE", "YSKIP", "YWILD+4", "YWILD"],
    ACTION: ["WILD", "WILD+4"]
};
UnoCard.cards.ALL = [...UnoCard.cards.RED, ...UnoCard.cards.GREEN, ...UnoCard.cards.BLUE, ...UnoCard.cards.YELLOW, ...UnoCard.cards.ACTION];

module.exports = UnoCard;