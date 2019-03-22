require("./framework/extendedStructures.js");
const ChatNoirClient = require("./framework/ChatNoirClient.js");
const client = new ChatNoirClient({
    disableEveryone: true,
    disabledEvents: ["TYPING_START", "GUILD_SYNC", "RELATIONSHIP_ADD", "RELATIONSHIP_REMOVE", "USER_SETTINGS_UPDATE", "USER_NOTE_UPDATE"],
    reconnect: true,
    messageSweepInterval: 30 * 60 * 1000
});
client.login();
