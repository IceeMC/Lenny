from .Events import TrackStart, QueueConcluded
from .AudioTrack import AudioTrack
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
        self.manager = manager
        self.node = node
        self.volume = 50
        self.playing = False
        self.paused = False
        self.repeating = False
        self.current = None
        self.queue = []
        self.m = None

    def enqueue(self, track: dict, requester: User):
        self.queue.append(AudioTrack().make(track, requester))

    async def play(self):
        if not self.queue:
            self.node.ee.emit("queue_concluded", QueueConcluded(self.manager.get_player(self.ctx, self.node.host)))
        else:
            self.playing = True
            track = self.queue.pop(0)
            self.current = track
            await self.set_volume(self.volume)
            await self.node.send(op="play", guildId=str(self.ctx.guild.id), track=track.track)
            self.node.ee.emit("track_start", TrackStart(self.manager.get_player(self.ctx, self.node.host), track))

    async def stop(self):
        await self.node.send(op="stop", guildId=str(self.ctx.guild.id))

    async def set_paused(self, paused):
        self.paused = paused
        await self.node.send(op="pause", guildId=str(self.ctx.guild.id), pause=self.paused)

    @staticmethod
    def valid_volume(volume):
        return 10 <= volume <= 150

    async def set_volume(self, volume):
        if not self.valid_volume(volume):
            return
        self.volume = volume
        await self.node.send(op="volume", guildId=str(self.ctx.guild.id), volume=volume)


