const Event = require("../framework/Event.js");

class GuildUpdateEvent extends Event {

    async run(oldGuild, newGuild) {
        if (!oldGuild.config.logs.guild) return;
        const updates = [];
        if (newGuild.name !== oldGuild.name) updates.push({ text: "Name Change", old: oldGuild.name, new: newGuild.name });
        if (newGuild.iconURL() !== oldGuild.iconURL()) updates.push({ text: "Icon Change", old: oldGuild.iconURL(), new: newGuild.iconURL() });
        if (newGuild.region !== oldGuild.region) updates.push({ text: "Region Change", old: oldGuild.region, new: newGuild.region });
        if (newGuild.owner !== oldGuild.owner) updates.push({ text: "Owner Change", old: oldGuild.owner.user.tag, new: newGuild.owner.user.tag });
        this.client.emit("logs", newGuild, {
            type: "guildUpdate",
            updates
        });
    }

}

module.exports = GuildUpdateEvent;