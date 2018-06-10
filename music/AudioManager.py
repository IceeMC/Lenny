import discord
import asyncio
import aiohttp
import json
from .AudioNode import AudioNode
from .AudioPlayer import AudioPlayer
from .AudioTrack import AudioTrack

class AudioManager:
    """
    Class of the AudioManager section.
    This is main class and controls all stuff like joining channels, leaving channels, and launching nodes.
    """
    def __init__(self, bot, nodes, shards=1):
        self.bot = bot
        bot.add_listener(self.on_socket_response)
        self.nodes = {}
        self.players = {}
        self._nodes = nodes
        self.shards = shards
        self.session = aiohttp.ClientSession()

    def get_player(self, ctx, node_host):
        if not self.nodes.get(node_host):
            raise Exception("No node with host: {} found.".format(node_host))
        player = self.players.get(ctx.guild.id)
        if player is None:
            player = AudioPlayer(ctx, self, self.nodes.get(node_host))
            self.players[ctx.guild.id] = player

        return player

    async def get_tracks(self, player, search):
        async with self.session.get("http://{}:2333/loadtracks?identifier=ytsearch:{}".format(player._node.host, search), headers={ "Authorization": player._node.password }) as resp:
            tracks = await resp.json()
            return tracks
    
    async def on_socket_response(self, data):
        if data["t"] == "VOICE_SERVER_UPDATE":
            payload = {
                "op": "voiceUpdate",
                "guildId": data["d"]["guild_id"],
                "sessionId": self.bot.get_guild(int(data["d"]["guild_id"])).me.voice.session_id,
                "event": data["d"]
            }
            await self.nodes.get("localhost")._send(**payload)

    async def connect(self, ctx, host: str):
        await self.bot.ws.send(json.dumps({
            "op": 4,
            "d": {
                "guild_id": ctx.guild.id,
                "channel_id": ctx.author.voice.channel.id,
                "self_mute": False,
                "self_deaf": False
            }
        }))
        if not self.nodes.get(host):
            raise Exception("No node with host: {} found.".format(host))
        p = self.get_player(ctx, host)
        p.connected = True

    async def leave(self, ctx):
        await self.bot.ws.send(json.dumps({
            "op": 4,
            "d": {
                "guild_id": ctx.guild.id,
                "channel_id":  None,
                "self_mute": False,
                "self_deaf": False
            }
        }))
        del self.players[ctx.guild.id]
        
    async def create(self):
        for i in range(len(self._nodes)):
            node = AudioNode(self, self.shards, self._nodes[i]["host"], self._nodes[i]["password"], self._nodes[i]["port"])
            await node._launch()
            self.nodes[node.host] = node
        await self.lavalink_event_task()

    async def lavalink_event_task(self):
        for node in self.nodes.values():
            @node.ee.on("track_start")
            async def on_track_start(event):
                m = await event.player.ctx.send(":musical_note: Now playing: **{0.title}** requested by `{1.name}#{1.discriminator}`".format(event.track, event.track.requester))
                try:
                    await m.add_reaction("⏸") # Pause
                    await m.add_reaction("⏹") # Stop
                    await m.add_reaction("⏯") # Resume
                    await m.add_reaction("🔁") # Repeat
                    await m.add_reaction("➖") # Volume decrease
                    await m.add_reaction("➕") # Volume increase
                except discord.Forbidden:
                    return
                try:
                    while event.player.playing:
                        reaction, user = await self.bot.wait_for("reaction_add", check=lambda reaction, user: user == event.player.current.requester)
                        if reaction.emoji == "⏸":
                            await event.player.set_paused(True)
                            await m.remove_reaction(reaction.emoji, user)
                        if reaction.emoji == "⏹":
                            event.player.queue.clear()
                            await event.player.stop()
                            await m.clear_reactions()
                        if reaction.emoji == "⏯":
                            await event.player.set_paused(False)
                            await m.remove_reaction(reaction.emoji, user)
                        if reaction.emoji == "🔁":
                            event.player.repeating = not event.player.repeating
                            await m.remove_reaction(reaction.emoji, user)
                        if reaction.emoji == "➖":
                            await event.player.set_volume(event.player.volume - 10)
                            await m.remove_reaction(reaction.emoji, user)
                        if reaction.emoji == "➕":
                            await event.player.set_volume(event.player.volume + 10)
                            await m.remove_reaction(reaction.emoji, user)
                except discord.Forbidden:
                    pass

            @node.ee.on("track_end")
            async def on_track_end(event):
                await event.player.play()

            @node.ee.on("track_skipped")
            async def on_track_skipped(event):
                await event.player.play()

            @node.ee.on("queue_concluded")
            async def on_queue_concluded(event):
                await self.leave(event.player.ctx)