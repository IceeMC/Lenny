import discord
import json
from discord.ext import commands
import psutil
from utils.Paginator import Paginator
from functools import reduce


class General:
    """The main commands for the bot."""
    def __init__(self, bot):
        self.bot = bot

    def new_cog_embed(self, cog: str):
        command_string = ""
        gotten_cog = self.bot.get_cog(cog)
        embed = discord.Embed(color=0xffffff)
        for command in self.bot.commands:
            if command.cog_name == cog and not command.hidden:
                command_string += f"`{command.signature}: {command.short_doc if command.short_doc else 'No help available.'}`\n"
        embed.title = f"{cog.replace('_', ' ')}"
        embed.description = f"***{gotten_cog.__doc__ if gotten_cog.__doc__ else 'No description provided.'}***"
        embed.add_field(name="Signature help", value="Understanding the signature for the bot is pretty simple:\n\n[arg] means that arg is __not required__.\n<arg> means the arg is __required__.")
        embed.add_field(name="Command list", value=command_string)
        return embed

    def new_command_embed(self, command: str):
        embed = discord.Embed(color=0xffffff)
        embed.title = f"Help for command: {command}"
        gotten_command = self.bot.get_command(command)
        embed.add_field(name="Signature help", value="Understanding the signature for the bot is pretty simple:\n\n[arg] means that arg is __not required__.\n<arg> means the arg is __required__.")
        embed.add_field(name="Usage", value=gotten_command.signature)
        embed.add_field(name="Description", value=gotten_command.short_doc if gotten_command.short_doc else "")
        if gotten_command.aliases:
            embed.add_field(name="Aliases", value=", ".join([alias for alias in gotten_command.aliases]))
        return embed

    @staticmethod
    def total_ram():
        return f"{(psutil.virtual_memory().total / 1073741824):.2f} GB"

    @staticmethod
    def used_ram():
        free = psutil.virtual_memory().total - psutil.virtual_memory().free
        convert = free / 1073741824
        return f"{convert:.2f} GB"

    @staticmethod
    def free_ram():
        free = psutil.virtual_memory().total - psutil.virtual_memory().free
        convert = free / 1073741824
        total = psutil.virtual_memory().total / 1073741824
        return f"{(total - convert):.2f} GB"

    @commands.command()
    async def help(self, ctx, *, cmd: str = None):
        """Displays the help for the bot."""
        if not cmd:
            pages = []
            for cog in self.bot.cogs:
                pages.append(self.new_cog_embed(cog))

            page_session = Paginator(ctx, pages=pages)
            await page_session.start()
        else:
            thing = self.bot.get_cog(cmd) or self.bot.get_command(cmd)
            if thing is None:
                cmd = cmd.replace('@', '@\u200b')
                return await ctx.send(f"Category or command: {cmd} was not found.")

            if isinstance(thing, commands.Command):
                await ctx.send(embed=self.new_command_embed(thing.name))
            else:
                await ctx.send(embed=self.new_cog_embed(type(thing).__name__))

    @commands.command()
    async def ping(self, ctx):
        """Ping pong? Anyone?"""
        embed = discord.Embed(color=0xffffff)
        embed.description = f"they see me ponging. They waiting for **{self.bot.latency * 1000:.0f}**ms."
        embed.description = f"they see me ponging. They waiting for about **{self.bot.latency * 1000:.0f}ms.**"
        await ctx.send(embed=embed)
        
    @commands.command()
    async def support(self, ctx):
        """Join the dank place."""
        await ctx.send("Your turn to join the dank place: <https://discord.gg/ftsNNMM>")

    @commands.command()
    async def invite(self, ctx):
        """Add me to that dank place."""
        link = 'https://discordapp.com/api/oauth2/authorize?client_id=459153545917235200&permissions=8&scope=bot'
        await ctx.send(f"Invite me to your dank place: <{link}>")

    @commands.command(aliases=["botinfo", "binfo", "statistics"])
    async def stats(self, ctx):
        """Bot stats. Go for it!"""
        embed = discord.Embed(color=0xffffff, title="Bot statistics", description="Here are some statistics about the bot.")
        embed.add_field(name="Total Servers", value=str(len(self.bot.guilds)))
        embed.add_field(name="Total Users", value=str(len(self.bot.users)))
        embed.add_field(name="Total RAM", value=self.total_ram())
        embed.add_field(name="RAM Usage", value=f"{self.used_ram()} ({psutil.virtual_memory().percent}%)")
        embed.add_field(name="GitHub", value="[Click This](https://github.com/IceeMC/Lenny)")
        embed.add_field(name="Support server", value="[Click This](https://discord.gg/ftsNNMM)")
        embed.add_field(name="Library/Language", value="[discord.py 1.0.0a](https://github.com/Rapptz/discord.py/tree/rewrite)/[python](https://www.python.org/)")
        embed.add_field(name="Command ran", value=reduce((lambda prev, val: prev + val), list(self.bot.commands_ran.values())))
        embed.set_thumbnail(url=self.bot.user.avatar_url)
        await ctx.send(embed=embed)

    @commands.command()
    async def commands(self, ctx):
        """Sends a list of all commands users have used."""
        await ctx.send(f"```json\n{json.dumps(self.bot.commands_ran, indent=4)}```")


def setup(bot):
    bot.add_cog(General(bot))
