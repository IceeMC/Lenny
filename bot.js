require("./framework/extendedStructures.js");
const ChatNoirClient = require("./framework/ChatNoirClient.js");
const Raven = require("raven");
const client = new ChatNoirClient({
    disableEveryone: true,
    disabledEvents: ["TYPING_START", "GUILD_SYNC", "RELATIONSHIP_ADD", "RELATIONSHIP_REMOVE", "USER_SETTINGS_UPDATE", "USER_NOTE_UPDATE"],
    reconnect: true
});

Raven.config(client.config.sentry, {
    captureUnhandledRejections: true
}).install();

Raven.context(() => client.login());