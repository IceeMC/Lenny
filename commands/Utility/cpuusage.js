const { Command } = require("klasa");
const Chart = require("chartjs-node");

class CPUUsage extends Command {

    constructor(...args) {
        super(...args, {
            name: "cpuusage",
            runIn: ["text"],
            description: language => language.get("COMMAND_CPU_USAGE_DESCRIPTION"),
            aliases: ["cpustats", "cpu"],
        });
    }

    async run(message) {
        const node = new Chart(500, 500);
        const labels = this.client.cpuCaptures.map((c, i) => `${i+1}: (${c.usage}%)`);
        const data = this.client.cpuCaptures.map(c => c.usage);
        const backgroundColor = this.client.cpuCaptures.map(c => c.color);
        await node.drawChart({
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "CPU Captures",
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
        await message.channel.sendFile(buffer, "cpuCaptures.png");
        node.destroy();
    }

}

module.exports = CPUUsage;