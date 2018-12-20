const { Canvas } = require("canvas-constructor");
const fetch = require("node-fetch");

class CanvasUtil {

    static async profileCard(message) {
        // const { member, config: { coins, level }, user: { config: { theme = "#CFC668" } } } = member;
        // // Thanks York#0001
        // const previousLevel = Math.floor((level / 0.1) ** 2);
        // const nextLevel = Math.floor(((level + 1) / 0.1) ** 2);
        // const progress = Math.round(((coins - previousLevel) / (nextLevel - previousLevel)) * 500);
        const canvas = new Canvas(1000, 1000)
            .setColor("#151515")
            .addRect(0, 0, 1000, 1000)
            .setColor("#CFC668")
            .addRect(0, 0, 1000, 450)
            .setColor("#4D4D4D")
            .addImage((await this.fetchIcon(message.member)), canvas.heigth / 2, canvas.width / 2, 512, 512);
        return await canvas.toBufferAsync();
    }

    static async fetchIcon(member) {
        const url = member.user.displayAvatarURL({ format: "png", size: 2048 });
        return await fetch(url).then(r => r.buffer());
    }

}