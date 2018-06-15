import discord
from utils.Paginator import Paginator
from discord.ext import commands


class Utility:
    """Useful commands for any occasion."""
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @commands.cooldown(1, 5, commands.BucketType.user)
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
                    em.title = f"Word: {item['word']}"
                    em.description = f"{item['definition']}\n\n{item['example']}\n\n:thumbsup: {item['thumbs_up']} :thumbsdown: {item['thumbs_down']}"
                    pages.append(em)
                page_session = Paginator(ctx, pages=pages)
                await page_session.start()

    @commands.command()
    async def userinfo(self, ctx, member: discord.Member = None):
        """Gets info for a user."""
        embed = discord.Embed(color=0xffffff)
        member = member if member else ctx.author
        embed.set_thumbnail(url=member.avatar_url if member.avatar_url else None)
        embed.add_field(name="Name", value=f"{member.name}#{member.discriminator}")
        embed.add_field(name="ID", value=member.id)
        embed.add_field(name="Account Type", value=":bust_in_silhouette: User" if not member.bot else ":robot: Bot")
        embed.add_field(name="Account Created", value=member.created_at.__format__("%b %m, %Y"))
        embed.add_field(name="Joined Server", value=member.joined_at.__format__("%b %m, %Y"))
        embed.add_field(name="Highest Role", value=member.top_role.name)
        embed.add_field(name="Roles", value=", ".join([r.name for r in member.roles]))
        embed.add_field(name="Role count", value=len(member.roles))
        if member.nick:
            embed.add_field(name="Nickname", value=member.nick)
        if member.activity:
            embed.add_field(name="Game", value=f"Currently playing **{member.activity.name}** in {member.status} mode.")
        await ctx.send(embed=embed)


def setup(bot):
    bot.add_cog(Utility(bot))
