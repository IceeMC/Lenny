const { Command } = require("klasa");
const Chart = require("chartjs-node");

class MemUsage extends Command {

    constructor(...args) {
        super(...args, {
            name: "memusage",
            runIn: ["text"],
            description: language => language.get("COMMAND_MEM_USAGE_DESCRIPTION"),
            aliases: ["memstats", "memory"],
        });
    }

    async run(message) {
        const node = new Chart(500, 500);
        const labels = this.client.memoryCaptures.map((c, i) => `${i+1}: (${c.usage}MB)`);
        const data = this.client.memoryCaptures.map(c => c.usage);
        const backgroundColor = this.client.memoryCaptures.map(c => c.color);
        await node.drawChart({
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Memory Captures",
                    data,
                    backgroundColor
                }]
            },
            options: {
                scales: { yAxes: [ { ticks: { beginAtZero: true } } ] },
                legend: {
                    labels: {
                        display: true,
                        fontColor: "white",
                        fontSize: 18
                    },
                },
            }
        });
        const buffer = await node.getImageBuffer("image/png");
        await message.channel.sendFile(buffer, "memoryCaptures.png");
        node.destroy();
    }

}

module.exports = MemUsage;