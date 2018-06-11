import discord
from utils.Paginator import Paginator
from discord.ext import commands


class Utility:
    """Utility command m8"""
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def urban(self, ctx, *, term: str):
        """Gets a term from the dictionary."""
        async with self.bot.session.get("https://api.urbandictionary.com/v0/define?term={}".format(term)) as urban:
            pages = []
            resp = await urban.json()
            if resp["result_type"] == "no_results":
                return await ctx.send("Aw shucks, This search returned no results.")
            else:
                for item in resp["list"]:
                    em = discord.Embed()
                    em.description = f"{item['definition']}\n\n{item['example']}\n\n:thumbsup: {item['thumbs_up']} :thumbsdown: {item['thumbs_down']}"
                    pages.append(em)
                page_session = Paginator(ctx, pages=pages)
                await page_session.start()


def setup(bot):
    bot.add_cog(Utility(bot))
