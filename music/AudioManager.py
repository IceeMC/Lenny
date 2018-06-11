import json
from .AudioNode import AudioNode
from .AudioPlayer import AudioPlayer


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
        self.session = self.bot.session

    def get_player(self, ctx, node_host):
        if not self.nodes.get(node_host):
            raise Exception("No node with host: {} found.".format(node_host))
        player = self.players.get(ctx.guild.id)
        if player is None:
            player = AudioPlayer(ctx, self, self.nodes.get(node_host))
            self.players[ctx.guild.id] = player

        return player

    async def get_tracks(self, player, search: str):
        async with self.session.get(f"http://{player.node.host}:2333/loadtracks?identifier={search}", headers={"Authorization": player.node.password}) as resp:
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
            await self.nodes.get("localhost").send(**payload)

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
        
    async def start_bg_task(self):
        for i in range(len(self._nodes)):
            node = AudioNode(self, self.shards, self._nodes[i]["host"], self._nodes[i]["password"], self._nodes[i]["port"])
            await node.launch()
            self.nodes[node.host] = node
        await self.lavalink_event_task()

    async def lavalink_event_task(self):
        for node in self.nodes.values():
            @node.ee.on("track_start")
            async def on_track_start(event):
                event.player.m = await event.player.ctx.send(f":musical_note: Now playing: **{event.track.title}** requested by `{event.track.requester.name}#{event.track.requester.discriminator}`")
                try:
                    await event.player.m.add_reaction("⏸") # Pause
                    await event.player.m.add_reaction("⏯") # Resume
                    await event.player.m.add_reaction("⏹") # Stop
                    await event.player.m.add_reaction("🔁") # Repeat
                    await event.player.m.add_reaction("➖") # Volume decrease
                    await event.player.m.add_reaction("➕") # Volume increase
                except Exception:
                    return
                try:
                    while event.player.playing:
                        reaction, user = await self.bot.wait_for("reaction_add", check=lambda r, u: u.id == event.player.current.requester.id and r.message.id == event.player.m.id)
                        if reaction.emoji == "⏸":
                            await event.player.set_paused(True)
                            await event.player.m.remove_reaction(reaction.emoji, user)
                        if reaction.emoji == "⏹":
                            event.player.queue.clear()
                            await event.player.stop()
                            await event.player.m.clear_reactions()
                        if reaction.emoji == "⏯":
                            await event.player.set_paused(False)
                            await event.player.m.remove_reaction(reaction.emoji, user)
                        if reaction.emoji == "🔁":
                            event.player.repeating = not event.player.repeating
                            await event.player.m.remove_reaction(reaction.emoji, user)
                        if reaction.emoji == "➖":
                            await event.player.set_volume(event.player.volume - 10)
                            await event.player.m.remove_reaction(reaction.emoji, user)
                        if reaction.emoji == "➕":
                            await event.player.set_volume(event.player.volume + 10)
                            await event.player.m.remove_reaction(reaction.emoji, user)
                except Exception as e:
                    print(e)

            @node.ee.on("track_end")
            async def on_track_end(event):
                try:
                    await event.player.m.delete()
                except Exception:
                    pass
                await event.player.play()

            @node.ee.on("queue_concluded")
            async def on_queue_concluded(event):
                await self.leave(event.player.ctx)
