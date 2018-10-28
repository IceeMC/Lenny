const { Canvas } = require("canvas-constructor");
const { get } = require("superagent");
const fs = require("fs");
const { join } = require("path");
const { MessageAttachment } = require("discord.js");

class TicTacToe {

    constructor(msg) {
        this.players = new Map();
        this.iconCache = new Map();
        this.msg = msg;
        this.host = msg.author;
        this.last = 0;
        this.started = false;
        this.board = [
            { userId: null, taken: false, taker: null },
            { userId: null, taken: false, taker: null },
            { userId: null, taken: false, taker: null },
            { userId: null, taken: false, taker: null },
            { userId: null, taken: false, taker: null },
            { userId: null, taken: false, taker: null },
            { userId: null, taken: false, taker: null },
            { userId: null, taken: false, taker: null },
            { userId: null, taken: false, taker: null }
        ];
        this.tttGames = msg.client.tttGames;
        this.winner = false;
        this.tie = false;
    }

    async start() {
        this.started = true;
        const player = this.players.get(this.playerKeys()[0]);
        this.msg.channel.send(`${player}, **Has the first move.**`);
        const res = await this.msg.channel.awaitMessages(m => m.content > 0 && m.content < 10 && m.author.id === player.id && m.channel.id === this.msg.channel.id, { max: 1 });
        this.fillSlot(this.board[parseInt(res.first().content) - 1], player);
    }

    addPlayer(user) {
        if (this.started) return this.msg.channel.send(":x: **This game is already in-progress**.");
        if (!this.players.get(user.id)) {
            this.players.set(user.id, user);
            this.msg.channel.send(`${user}, **Has joined the game. ${this.players.size === 2 ? `\n${this.host}, You can start the game now. \`${this.msg.guild.settings.prefix}ttt start\`**` : "**"}`);
        } else {
            this.msg.send(":x: **You are already in the game!**");
        }
    }

    playerKeys() { return Array.from(this.players.keys()); }

    removePlayer(user) {
        if (this.players.get(user.id)) {
            this.players.delete(user.id);
            this.msg.send(`${user}, **Has left the game.**`);
        } else {
            this.msg.send(":x: **You are not in the game!**");
        }
    }

    async fillSlot(slot, player) {
        this.msg.channel.startTyping();
        if (slot.taken === false) {
            slot.userId = player.id;
            slot.taken = true;
            slot.taker = player.displayAvatarURL();
            if (!this.iconCache.get(player.id))
                this.iconCache.set(player.id, (await get(player.displayAvatarURL({ format: "png" }))).body);
            this.checkForWinner(player);
            if (this.winner || this.tie) return;
            await this.drawBoard();
        }
        if (this.last === 1) {
            this.last = 0;
            await this.switchPlayer(0);
        } else if (this.last === 0) {
            this.last = 1;
            await this.switchPlayer(1);
        }
    }

    async switchPlayer(playerNum) {
        const next = this.players.get(this.playerKeys()[playerNum]);
        try {
            this.msg.channel.send(`${next}, **It's now your turn.**`);
            const res = await this.msg.channel.awaitMessages(m => m.content > 0 && m.content < 10 && m.author.id === next.id && m.channel.id === this.msg.channel.id, { max: 1, time: 30000, errors: ["time"] });
            return this.fillSlot(this.board[parseInt(res.first().content) - 1], next);
        } catch (_) {
            this.msg.channel.send(`${next}, **You did not reply in 30 seconds... Game ended.**`);
            return this.tttGames.delete(this.msg.channel.id);
        }
    }

    async checkForWinner(player) {
        if (this.board.filter(s => s.taken === true).length === 9) this.tie = true;
        if (this.board[0].taker === player.displayAvatarURL() && this.board[1].taker === player.displayAvatarURL() && this.board[2].taker === player.displayAvatarURL()) this.winner = true;
        if (this.board[3].taker === player.displayAvatarURL() && this.board[4].taker === player.displayAvatarURL() && this.board[5].taker === player.displayAvatarURL()) this.winner = true;
        if (this.board[6].taker === player.displayAvatarURL() && this.board[7].taker === player.displayAvatarURL() && this.board[8].taker === player.displayAvatarURL()) this.winner = true;
        if (this.board[0].taker === player.displayAvatarURL() && this.board[3].taker === player.displayAvatarURL() && this.board[6].taker === player.displayAvatarURL()) this.winner = true;
        if (this.board[1].taker === player.displayAvatarURL() && this.board[4].taker === player.displayAvatarURL() && this.board[7].taker === player.displayAvatarURL()) this.winner = true;
        if (this.board[2].taker === player.displayAvatarURL() && this.board[5].taker === player.displayAvatarURL() && this.board[8].taker === player.displayAvatarURL()) this.winner = true;
        if (this.board[0].taker === player.displayAvatarURL() && this.board[4].taker === player.displayAvatarURL() && this.board[8].taker === player.displayAvatarURL()) this.winner = true;
        if (this.board[2].taker === player.displayAvatarURL() && this.board[4].taker === player.displayAvatarURL() && this.board[6].taker === player.displayAvatarURL()) this.winner = true;

        if (this.winner) {
            await this.drawBoard();
            this.msg.channel.send(`${player}, **Has won the game of Tic Tac Toe :tada:!**`);
            return this.tttGames.delete(this.msg.channel.id);
        }

        if (this.tie) {
            const host = this.players.get(this.playerKeys()[0]);
            const guest = this.players.get(this.playerKeys()[1]);
            await this.drawBoard();
            this.msg.channel.send(`${host} ${guest}, **It's a tie, Better luck next time.**`);
            return this.tttGames.delete(this.msg.channel.id);
        }
    }

    async drawBoard() {
        try {
            const slotBuffers = this.board.reduce((b, v) => [...b, this._getTaker(v)], []);
            const mainBoard = await fs.readFileSync(join(__dirname, "..", "assets", "ttt.png"));
            const blankSlot = Buffer.alloc(0);

            const board = new Canvas(500, 500)
                .addImage(mainBoard, 0, 0, 500, 500)
                .addImage(slotBuffers[0] || blankSlot, 0, 0, 164, 164)
                .addImage(slotBuffers[1] || blankSlot, 169, 0, 164, 164)
                .addImage(slotBuffers[2] || blankSlot, 169 * 2, 0, 164, 164)
                .addImage(slotBuffers[3] || blankSlot, 0, 169, 164, 164)
                .addImage(slotBuffers[4] || blankSlot, 169, 169, 164, 164)
                .addImage(slotBuffers[5] || blankSlot, 169 * 2, 169, 164, 164)
                .addImage(slotBuffers[6] || blankSlot, 0, 169 * 2, 164, 164)
                .addImage(slotBuffers[7] || blankSlot, 169, 169 * 2, 164, 164)
                .addImage(slotBuffers[8] || blankSlot, 169 * 2, 169 * 2, 164, 164);
            await this.msg.channel.send(new MessageAttachment(await board.toBufferAsync()));
            this.msg.channel.stopTyping(true);
        } catch (e) { console.error(e.stack); }
    }

    _getTaker(slot) {
        if (!slot.taker) return null;
        const cached = this.iconCache.get(slot.userId);
        return cached;
    }

};

module.exports = TicTacToe;