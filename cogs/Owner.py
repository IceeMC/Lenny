import asyncio
import json
import io
import textwrap
import traceback
import os
import sys
from contextlib import redirect_stdout
from discord.ext import commands


class Owner:
    """OwO owner commands."""
    def __init__(self, bot):
        self.bot = bot
        self._last_result = None

    async def __local_check(self, ctx):
        if ctx.author.id not in self.bot.config["developers"]:
            await ctx.send("Hmm, It appears you are not one of my developers.")
            return False
        return True

    @staticmethod
    def clean_code(code: str):
        if code.startswith("```") and code.endswith("```"):
            return "\n".join(code.split("\n")[1:-1])
        return code.strip("` \n")

    @commands.command()
    async def reload(self, ctx, *, cog: str):
        """Reloads a cog."""
        try:
            self.bot.unload_extension("cogs.{}".format(cog))
            self.bot.load_extension("cogs.{}".format(cog))
            await ctx.message.add_reaction("✅")
        except discord.Forbidden:
            pass

    @commands.command()
    async def reboot(self, ctx, *, delay: int = None):
        """Reboots the bot."""
        if delay is None:
            delay = 1
        reboot_time = f"{delay} seconds." if delay > 1 else f"{delay} second."
        await ctx.send(f"Rebooting in {reboot_time}")
        await asyncio.sleep(delay)
        await self.bot.logout()
        os.execv(sys.executable, ["python3"] + ["bot.py"])

    # Taken from https://github.com/Rapptz/RoboDanny/blob/rewrite/cogs/admin.py
    # I am in no way affiliated with them at all.
    @commands.command()
    async def eval(self, ctx, *, code: str):
        """Evaluates python code."""
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
            exec("async def func():\n{}".format(textwrap.indent(code, "  ")), env)
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
            if self.bot.ws.token in val:
                val = val.replace(self.bot.ws.token, "BISH THIS IS MY TOKEN")

            await ctx.message.add_reaction("✅")

            if ret is None:
                if val:
                    await ctx.send("```py\n{}\n```".format(val))
            else:
                self._last_result = ret
                await ctx.send("```py\n{}\n```".format(ret))


def setup(bot):
    bot.add_cog(Owner(bot))
