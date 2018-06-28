import asyncio
import discord
import io
import textwrap
import traceback
import os
import sys
import subprocess
from contextlib import redirect_stdout
from discord.ext import commands


class Owner:
    """No."""
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
        if cog == "all":
            for cog in self.bot.cog_files:
                self.bot.unload_extension(f"cogs.{cog}")
                self.bot.load_extension(f"cogs.{cog}")
            await ctx.message.add_reaction("✅")
        else:
            try:
                self.bot.unload_extension(f"cogs.{cog}")
                self.bot.load_extension(f"cogs.{cog}")
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
        os.execv(sys.executable, ["clear"])
        os.execv(sys.executable, ["python3", "bot.py"])

    @commands.command()
    async def logout(self, ctx):
        """Logs the bot out."""
        await ctx.channel.send("<:nou:433731752855470081>")
        await self.bot.logout()

    @commands.command(alises=["update", "gitpull"])
    async def pull(self, ctx):
        """Fetches the latest changes from the GitHub repo. Then restarts the bot."""
        temp = await ctx.send("Give me a sec...")
        res = subprocess.run("git pull", shell=True, stdout=subprocess.PIPE)
        await temp.delete()
        stdout = res.stdout.decode("utf-8")
        await ctx.send(f"Here are the latest changes:\n```xl\n{stdout}```")
        os.execv(sys.executable, ["clear"])
        os.execv(sys.executable, ["python3", "bot.py"])

    @commands.command()
    async def exec(self, ctx, *, cmd: str):
        """Rums code on the shell."""
        temp = await ctx.send(f"Executing: `{cmd}` please wait...")
        result = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        await temp.delete()

        if result.stderr.decode("utf-8"):
            return await ctx.send(f"Error:\n\n```xl\n{result.stderr.decode('utf-8')}```")

        def paginate(text: str):
            """Simple generator that paginates text."""
            last = 0
            pages = []
            for curr in range(0, len(text)):
                if curr % 1980 == 0:
                    pages.append(text[last:curr])
                    last = curr
                    appd_index = curr
            if appd_index != len(text) - 1:
                pages.append(text[last:curr])
            return list(filter(lambda a: a != '', pages))

        try:
            await ctx.send(f"Success:\n\n```xl\n{result.stdout.decode('utf-8')}```")
        except discord.HTTPException:
            paginated_text = paginate(result.stdout.decode("utf-8"))
            for page in paginated_text:
                if page == paginated_text[-1]:
                    await ctx.send(f'```xl\n{page}\n```')
                    break
                await ctx.send(f'```xl\n{page}\n```')

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

        def paginate(text: str):
            """Simple generator that paginates text."""
            last = 0
            pages = []
            for curr in range(0, len(text)):
                if curr % 1980 == 0:
                    pages.append(text[last:curr])
                    last = curr
                    appd_index = curr
            if appd_index != len(text) - 1:
                pages.append(text[last:curr])
            return list(filter(lambda a: a != '', pages))

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
                    try:
                        await ctx.send("```py\n{}\n```".format(val))
                    except discord.HTTPException:
                        paginated_text = paginate(val)
                        for page in paginated_text:
                            if page == paginated_text[-1]:
                                await ctx.send(f'```py\n{page}\n```')
                                break
                            await ctx.send(f'```py\n{page}\n```')

            else:
                self._last_result = ret
                try:
                    await ctx.send("```py\n{}\n```".format(ret))
                except discord.HTTPException:
                    paginated_text = paginate(f"{value}{ret}")
                    for page in paginated_text:
                        if page == paginated_text[-1]:
                            await ctx.send(f'```py\n{page}\n```')
                            break
                        await ctx.send(f'```py\n{page}\n```')


def setup(bot):
    bot.add_cog(Owner(bot))
