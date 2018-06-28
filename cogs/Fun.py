import discord
from discord.ext import commands
from utils.Paginator import Paginator
from bs4 import BeautifulSoup
import traceback


class Fun:
    """Jokes, Urban, and memes...I don't need to explain more."""
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @commands.cooldown(1, 5, commands.BucketType.user)
    async def urban(self, ctx, *, term: str):
        """Gets a term from the dictionary."""
        async with ctx.typing():
            resp = await (await self.bot.session.get(f"https://api.urbandictionary.com/v0/define?term={term}")).json()

        pages = []
        if resp["result_type"] == "no_results":
            return await ctx.send("Aw shucks, This search returned no results.")
        else:
            for item in resp["list"]:
                em = discord.Embed()
                em.title = f"Word: {item['word']}"
                em.description = f"{item['definition']}\n\n{item['example']}\n\n:thumbsup: {item['thumbs_up']} :thumbsdown: {item['thumbs_down']}"
                pages.append(em)

            page_session = Paginator(ctx, pages=pages)
            await page_session.start()

    @commands.command()
    @commands.cooldown(1, 5, commands.BucketType.user)
    async def fml(self, ctx):
        """Gets many random fuck my life jokes."""
        async with ctx.typing():
            resp = await (await self.bot.session.get("http://fmylife.com/random")).text()

        pages = []
        data = BeautifulSoup(resp, "lxml")
        parsed = data.find("div", {"class": "panel-content"})
        for x in range(15):
            content = parsed[x].find("div", {"class": "panel-content"})
            em = discord.Embed(title=f"FML Joke")
            em.description = content.find("p").text
            if content.find("button", {"class": "btn btn-default vote-up title"}):
                em.add_field(name="Likes", value=content.find("button", {"class": "btn btn-default vote-up title"}).text)
            if content.find("button", {"class": "btn btn-default vote-down title"}):
                em.add_field(name="Dislikes", value=content.find("button", {"class": "btn btn-default vote-down title"}).text)
            pages.append(em)

        page_session = Paginator(ctx, pages=pages)
        await page_session.start()


def setup(bot):
    bot.add_cog(Fun(bot))
