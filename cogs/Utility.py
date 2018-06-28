import discord
from discord.ext import commands


class Utility:
    """Useful commands for any occasion."""
    def __init__(self, bot):
        self.bot = bot

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
