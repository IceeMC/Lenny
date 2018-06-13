import discord
from discord.ext import commands
from utils.Paginator import Paginator


class General:
    """The main commands for the bot."""
    def __init__(self, bot):
        self.bot = bot

    def new_cog_page(self, cog: str):
        command_string = ""
        gotten_cog = self.bot.get_cog(cog)
        embed = discord.Embed()
        for command in self.bot.commands:
            if command.cog_name == cog and not command.hidden:
                command_string += f"`{command.signature}: {command.short_doc if command.short_doc else 'No help available.'}`\n"
        embed.title = f"{cog.replace('_', ' ')}"
        embed.description = f"***{gotten_cog.__doc__ if gotten_cog.__doc__ else 'No description provided.'}***"
        embed.add_field(name="Signature help", value="Understanding the signature for the bot is pretty simple:\n\n[arg] means that arg is __not required__.\n<arg> means the arg is __required__.")
        embed.add_field(name="Command list", value=command_string)
        return embed

    @commands.command()
    async def help(self, ctx):
        """Displays the help for the bot."""
        pages = []
        for cog in self.bot.cogs:
            pages.append(self.new_cog_page(cog))

        page_session = Paginator(ctx, pages=pages)
        await page_session.start()

    @commands.command()
    async def ping(self, ctx):
        """Ping pong? Anyone?"""
        embed = discord.Embed(color=0xffffff)
        embed.description = f"they see me ponging.\nPing is: {self.bot.latency * 1000:.0f}ms"
        await ctx.send(embed=embed)
        
    @commands.command()
    async def support(self, ctx):
        await ctx.send("https://discord.gg/ftsNNMM")

    @commands.command()
    async def invite(self, ctx):
        invite = [
            "aye!",
            "get me up in there!",
            "https://discordapp.com/api/oauth2/authorize?client_id=454683946966581268&permissions=8&scope=bot"
        ]
        await ctx.send(" ".join(invite))
        
        
def setup(bot):
    bot.add_cog(General(bot))
