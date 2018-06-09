import discord
import json
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
                await ctx.send("Bruh how tf can I reload nothing.")
            try:
                self.bot.unload_extention("cogs.{}".format(cog))
                self.bot.load_extention("cogs.{}".format(cog))
            except Exception:
                await ctx.send("Error, Cog not found.")

def setup(bot):
    bot.add_cog(Owner(bot))