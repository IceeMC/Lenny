import discord
import json
import io
import os
import sys
import textwrap
import traceback
from contextlib import redirect_stdout
from discord.ext import commands
with open("config.json") as config_file:
    config = json.load(config_file)

class Owner:
    def __init__(self, bot):
        self.bot = bot
        self._last_result = None

    def developer(self, user_id):
        if user_id in config["developers"]:
            return True

        return False

    @commands.command()
    async def reload(self, ctx, *, cog=None):
        """Reloads a cog."""
        if not self.developer(ctx.author.id):
            return await ctx.send("Hmm, It appears you are not one of my developers.")
        else: 
            if cog is None:
                return await ctx.send("Bruh how tf can I reload nothing. Kthx.")
            try:
                self.bot.unload_extension("cogs.{}".format(cog))
                self.bot.load_extension("cogs.{}".format(cog))
                await ctx.message.add_reaction("✅")
            except Exception:
                await ctx.send("```py\n{}```".format(traceback.format_exc()))

    def clean_code(self, code):
        if code.startswith("```") and code.endswith("```"):
            return "\n".join(code.split("\n")[1:-1])
        return code.strip("` \n")

    # Taken from https://github.com/Rapptz/RoboDanny/blob/rewrite/cogs/admin.py
    # I am in no way affiliated with them at all.
    @commands.command(name="eval")
    async def _eval(self, ctx, *, code):
        """Evaluates python code."""
        if not self.developer(ctx.author.id):
            return await ctx.send("Hmm, It appears you are not one of my developers.")
        else:
            env = {
                "bot": self.bot,
                "ctx": ctx,
                "guild": ctx.guild,
                "author": ctx.author,
                "channel": ctx.channel,
                "music": self.bot.music_manager,
                "_": self._last_result,
            }

            env.update(globals())

            code = self.clean_code(code)
            stdout = io.StringIO()

            try:
                exec("async def func():{}\n".format(textwrap.indent(code, "  ")), env)
            except Exception as e:
                val = stdout.getvalue()
                return await ctx.send("```py\n{}: {}```".format(e.__class__.__name__, e))
            
            func = env["func"]
            try:
                with redirect_stdout(stdout):
                    ret = await func()
            except Exception as e:
                val = stdout.getvalue()
                return await ctx.send("```py\n{}{}```".format(val, traceback.format_exc()))
            else:
                val = stdout.getvalue()
                try:
                    await ctx.message.add_reaction("✅")
                except:
                    pass

                if ret is None:
                    if val:
                        await ctx.send("```py\n{}\n```".format(val))
                else:
                    self._last_result = ret
                    await ctx.send("```py\n{}\n```".format(ret))


def setup(bot):
    bot.add_cog(Owner(bot))
