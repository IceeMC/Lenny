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
        """Grabs a random fuck my life joke."""
        async with ctx.typing():
            resp = await (await self.bot.session.get("http://fmylife.com/random")).text()

        data = BeautifulSoup(resp, "lxml")
        joke = data.find("p", {"class": "block"})

        em = discord.Embed(title=f"Random FML Joke", color=0xffffff)
        em.description = joke.text
        em.set_footer(text="Powered by: http://fmylife.com/random", icon_url=ctx.author.avatar_url)

        await ctx.send(embed=em)


def setup(bot):
    bot.add_cog(Fun(bot))
