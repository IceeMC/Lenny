import discord
import json
import io
import os
import sys
from discord.ext import commands
with open("config.json") as config_file:
    config = json.load(config_file)

class Owner:
    def __init__(self, bot):
        self.bot = bot

    def developer(self, user_id):
        if user_id in config["developers"]:
            return True

        return False

    @commands.command()
    async def reload(self, ctx, *, cog=None):
        """Reloads a cog."""
        if not self.developer(ctx.author.id):
            return await ctx.send("Hmm, This command is for developers only.")
        else: 
            if cog is None:
                return await ctx.send("Bruh how tf can I reload nothing.")
            try:
                self.bot.unload_extension("cogs.{}".format(cog))
                self.bot.load_extension("cogs.{}".format(cog))
                await ctx.message.add_reaction("✅")
            except Exception:
                t = await ctx.send("Error, Cog not found.")
                await t.add_reaction("❌")

def setup(bot):
    bot.add_cog(Owner(bot))
