from discord.ext import commands


class Music:
    """Play those sick tunes."""
    def __init__(self, bot):
        self.bot = bot
        self.music = self.bot.music_manager
    
    @commands.command()
    async def play(self, ctx, *, query: str):
        """Plays music in your voice channel."""
        player = self.music.get_player(ctx, "localhost")

        if ctx.author.voice is None:
            return await ctx.send(":thinking: How do I join a voice channel with no one in it?")
        if ctx.author.voice.channel:
            await self.music.connect(ctx, "localhost")

        query = query.strip("<>")
        if not query.startswith("http"):
            query = f"ytsearch:{query}"

        tracks = await self.music.get_tracks(player, query)

        if not tracks:
            return await ctx.send("Aw man, No songs found.")

        if player.paused:
            return await ctx.send("Oof, You cannot add songs while nothing I am paused.")

        player.enqueue(track=tracks[0], requester=ctx.author)
        
        if player.playing:
            await ctx.send(f":ok_hand: Enqueued song: **{tracks[0]['info']['title']}** in position: **{len(player.queue)}**")
        else:
            await player.play()

    @commands.command()
    async def queue(self, ctx):
        """Displays the music queue."""
        player = self.music.get_player(ctx, "localhost")

        if len(player.queue) == 0:
            return await ctx.send("There are no songs in the queue. Kthx.")

        queue_str = ""
        count = 0
        for track in player.queue:
            count += 1
            queue_str += f"{str(count)}: **{track.title}** requested by `{tracl.requester.name}#{track.requester.discriminator}`"

        return await ctx.send(f"Showing the music queue for: `{ctx.guild.name}`\n{queue_str}")

    @commands.command()
    async def loop(self, ctx):
        """Loops the current song forever."""
        player = self.music.get_player(ctx, "localhost")

        if player.playing is False:
            return await ctx.send(":thinking: How do you expect me to repeat thin air?")

        if player.current.requester.id != ctx.author.id:
            return await ctx.send("Hmm, It seems like you didn't request this song.")
        else:
            player.repeating = not player.repeating

            return await ctx.send(f":repeat: has been **{'enabled' if player.repeating else 'disabled'}**")

    @commands.command()
    async def pause(self, ctx):
        """Pauses the current song."""
        player = self.music.get_player(ctx, "localhost")

        if player.playing is False:
            return await ctx.send(":thinking: How do you expect me to pause thin air?")

        if player.paused:
            return await ctx.send("Hmm, It seem's like I am already paused. Kthx.")

        if player.current.requester.id != ctx.author.id:
            return await ctx.send("Hmm, It seems like you didn't request this song.")
        else:
            player.paused = True

            await player.set_paused(True)
            return await ctx.send("The player is now paused.")

    @commands.command()
    async def resume(self, ctx):
        """Resumes the current song"""
        player = self.music.get_player(ctx, "localhost")

        if player.playing is False:
            return await ctx.send(":thinking: How do you expect me to resume thin air?")

        if player.paused is False:
            return await ctx.send("Hmm, It seem's like I am not already paused. Kthx.")
    
        if player.current.requester.id != ctx.author.id:
            return await ctx.send("Hmm, It seems like you didn't request this song.")
        else:
            player.paused = False

            await player.set_paused(False)
            return await ctx.send("The player is now resumed.")

    @commands.command()
    async def stop(self, ctx):
        """Completely destroys the player."""
        player = self.music.get_player(ctx, "localhost")

        if player.playing is False:
            return await ctx.send(":thinking: How do you expect me to stop thin air?")
    
        if player.current.requester.id != ctx.author.id:
            return await ctx.send("Hmm, It seems like you didn't request this song.")
        else:
            player.queue.clear()
            await player.stop()


def setup(bot):
    bot.add_cog(Music(bot))
