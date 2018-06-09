import pyee
from .Events import TrackStart, QueueConcluded
from .AudioTrack import AudioTrack
from collections import deque
from discord import User

class AudioPlayer:
    """
    Class of AudioPlayer.
    This class has many uses.
    It can play music, skip music, pause music, resume music, seek music, and much more.
    """
    def __init__(self, ctx, manager, node):
        self.ctx = ctx
        self.state = {}
        self._manager = manager
        self._node = node
        self.playing = False
        self.paused = False
        self.repeating = False
        self.current = None
        self.queue = []

    def enqueue(self, track: dict, requester: User):
        self.queue.append(AudioTrack().make(track, requester))

    async def play(self):
        if len(self.queue) == 0:
            self._node.ee.emit("queue_concluded", QueueConcluded(self._manager.get_player(self.ctx, self._node.host)))
        else:
            if self.repeating:
                await self._node._send(op="play", guildId=str(self.ctx.guild.id), track=self.current.track)
                return self._node.ee.emit("track_start", TrackStart(self._manager.get_player(self.ctx, self._node.host), self.current))
            self.playing = True
            track = self.queue.pop(0)
            self.current = track
            await self._node._send(op="play", guildId=str(self.ctx.guild.id), track=track.track)
            self._node.ee.emit("track_start", TrackStart(self._manager.get_player(self.ctx, self._node.host), track))

    async def set_paused(self, paused):
        self.paused = paused
        await self._node._send(op="pause", guildId=str(self.ctx.guild.id), pause=self.paused)


