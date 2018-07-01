from discord.ext import commands
from utils.Paginator import Paginator
from bs4 import BeautifulSoup
import re
import discord


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
                for x in range(50):
                    player.enqueue(track[x], ctx.author)
                await ctx.send(f"Alright, The playlist has been enqueued with **50** tracks.")
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

        i = 0
        pages = []
        while i < len(player.queue):
            sliced = player.queue[i:i+6]
            embed = discord.Embed(color=0xffffff)
            embed.title = f"Showing songs from {i+1} to {i+6}"
            embed.description = "\n".join([f"`•` **[{track.title}]({track.url})** requester: `{track.requester}`" for track in sliced])
            pages.append(embed)
            i += 6

        paginator = Paginator(ctx, pages=pages)
        await paginator.start()

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

        await ctx.send("Alright, I have skipped that song. Enjoy!")
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

        await ctx.send("Alright, I skipped to the last song in the queue. Enjoy!")
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

    @commands.command(aliases=["songlyrics", "lyric"])
    async def lyrics(self, ctx, *, song: str):
        """Gets lyrics for a song."""
        async with ctx.typing():
            resp = await (await self.bot.session.get(f"https://api.genius.com/search?q={song}", headers={"Authorization": f"Bearer {self.bot.config['genius']}"})).json()

        if not resp["response"]["hits"]:
            return await ctx.send(f"No results found for. Try looking for a different song.")

        resp1 = await (await self.bot.session.get(resp["response"]["hits"][0]["result"]["url"])).text()
        scraped = BeautifulSoup(resp1, "lxml")

        if not scraped.find_all("p"):
            return await ctx.send(f"No results found for. Try looking for a different song.")

        description = scraped.find_all("p")[0].text
        if len(description) > 2045:
            description = f"{description[:2045]}..."

        embed = discord.Embed(title=resp["response"]["hits"][0]["result"]["full_title"], color=0xffffff)
        embed.description = description
        embed.set_footer(text="Powered by: https://genius.com", icon_url=ctx.author.avatar_url)
        embed.set_thumbnail(url=resp["response"]["hits"][0]["result"]["header_image_thumbnail_url"])
        await ctx.send(embed=embed)


def setup(bot):
    bot.add_cog(Music(bot))
