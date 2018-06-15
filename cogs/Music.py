from discord.ext import commands
import re


class Music:
    """Play those sick tunes."""
    def __init__(self, bot):
        self.bot = bot
        self.music = self.bot.music_manager
    
    @commands.command()
    async def play(self, ctx, *, query: str):
        """Plays music in your voice channel."""
        player = self.music.get_player(ctx, "localhost")

        if not ctx.author.voice:
            return await ctx.send(":thinking: How do I join a voice channel with no one in it?")
        if ctx.author.voice.channel:
            await self.music.connect(ctx, "localhost")
        if player.paused:
            return await ctx.send("Oof, You cannot add songs while the player is paused.")

        query = query.strip("<>")
        track = None
        playlist = False

        if re.match(r"https:\/\/?(www\.)?youtube\.com\/watch\?v=(.*)", query):
            tracks = await self.music.get_tracks(player, query)
            if not tracks:
                return await ctx.send("Aw man, No songs found.")
        elif re.match(r"https:\/\/?(www\.)?youtu\.be\/(.*)", query):
            tracks = await self.music.get_tracks(player, query)
            if not tracks:
                return await ctx.send("Aw man, No songs found.")
            track = tracks[0]
        elif re.match(r".*list=(.*)", query):
            tracks = await self.music.get_tracks(player, query)
            if not tracks:
                return await ctx.send("Aw man, No songs found.")
            track = tracks
            playlist = True
        else:
            tracks = await self.music.get_tracks(player, f"ytsearch:{query}")
            if not tracks:
                return await ctx.send("Aw man, No songs found.")
            track = tracks[0]

        if playlist:
            async with ctx.typing():
                for x in track:
                    player.enqueue(x, ctx.author)
                await ctx.send(f"Alright, The playlist has been enqueued with **{len(track)}** tracks.")
        else:
            player.enqueue(track, ctx.author)
            await ctx.send(f"Alright, **{track['info']['title']}** has been enqueued. In position `{len(player.queue)}`")

        if not player.playing:
            await player.play()

    @commands.command()
    async def queue(self, ctx):
        """Displays the music queue."""
        player = self.music.get_player(ctx, "localhost")

        if not player.queue:
            return await ctx.send("There are no songs in the queue. Kthx.")

        queue_str = ""
        count = 0
        for track in player.queue:
            count += 1
            queue_str += f"{str(count)}: **{track.title}** requested by `{track.requester.name}#{track.requester.discriminator}`"

        if len(queue_str) > 2040:
            await ctx.send("Oof, The queue is too long to fit in a message.")
        else:
            await ctx.send(f"Showing the music queue for: `{ctx.guild.name}`\n{queue_str}")

    @commands.command()
    async def loop(self, ctx):
        """Loops the current song forever."""
        player = self.music.get_player(ctx, "localhost")

        if not player.playing:
            return await ctx.send(":thinking: How do you expect me to repeat thin air?")

        if player.current.requester.id != ctx.author.id:
            return await ctx.send("Hmm, It seems like you didn't request this song.")

        player.repeating = not player.repeating
        await ctx.send(f":repeat: has been **{'enabled' if player.repeating else 'disabled'}**")

    @commands.command()
    async def pause(self, ctx):
        """Pauses the current song."""
        player = self.music.get_player(ctx, "localhost")

        if not player.playing:
            return await ctx.send(":thinking: How do you expect me to pause thin air?")

        if player.paused:
            return await ctx.send("Hmm, It seem's like I am already paused. Kthx.")

        if player.current.requester.id != ctx.author.id:
            return await ctx.send("Hmm, It seems like you didn't request this song.")

        player.paused = True
        await player.set_paused(True)
        await ctx.send("The player is now paused.")

    @commands.command()
    async def resume(self, ctx):
        """Resumes the current song"""
        player = self.music.get_player(ctx, "localhost")

        if not player.playing:
            return await ctx.send(":thinking: How do you expect me to resume thin air?")

        if not player.paused:
            return await ctx.send("Hmm, It seem's like I am not already paused. Kthx.")
    
        if player.current.requester.id != ctx.author.id:
            return await ctx.send("Hmm, It seems like you didn't request this song.")

        player.paused = False
        await player.set_paused(False)
        await ctx.send("The player is now resumed.")

    @commands.command()
    async def skip(self, ctx):
        """Skips the current song."""
        player = self.music.get_player(ctx, "localhost")

        if not player.playing:
            return await ctx.send(":thinking: How do you expect me to stop thin air?")

        if player.current.requester.id != ctx.author.id:
            return await ctx.send("Hmm, It seems like you didn't request this song.")

        if not player.queue:
            return await ctx.send("Hmm, The queue appears to be empty.")
        if player.repeating:
            return await ctx.send("Oof, You cannot skip a repeated song.")

        await ctx.send("Alright, That song has been skipped.")
        await player.play()

    @commands.command()
    async def lastskip(self, ctx):
        """Plays the last song in the queue."""
        player = self.music.get_player(ctx, "localhost")

        if not player.playing:
            return await ctx.send(":thinking: How do you expect me to stop thin air?")

        if player.current.requester.id != ctx.author.id:
            return await ctx.send("Hmm, It seems like you didn't request this song.")

        if len(player.queue) == 0:
            return await ctx.send("Hmm, The queue appears to be empty.")
        if player.repeating:
            return await ctx.send("Oof, You cannot skip a repeated song.")

        await ctx.send("Alright, That song has been skipped.")
        last_song = player.queue[len(player.queue) - 1]
        player.queue = [last_song]
        await player.play()

    @commands.command()
    async def stop(self, ctx):
        """Stops the current song and leave your voice channel."""
        player = self.music.get_player(ctx, "localhost")

        if not player.playing:
            return await ctx.send(":thinking: How do you expect me to stop thin air?")
    
        if player.current.requester.id != ctx.author.id:
            return await ctx.send("Hmm, It seems like you didn't request this song.")

        player.queue.clear()
        await self.music.leave(ctx)


def setup(bot):
    bot.add_cog(Music(bot))
