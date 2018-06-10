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
                return await ctx.send("Bruh how tf can I reload nothing.")
            try:
                self.bot.unload_extension("cogs.{}".format(cog))
                self.bot.load_extension("cogs.{}".format(cog))
                await ctx.message.add_reaction("✅")
            except Exception:
                t = await ctx.send("Error, Cog not found.")
                await t.add_reaction("❌")

    def clean_code(self, code):
        if code.startswith("```") and code.endswith("```"):
            return "\n".join(code.split("\n")[1:-1])
        return code.strip("` \n")

    # Thanks Free TNT
    @commands.command()
    async def eval(self, ctx, *, code=None):
        """Evaluates python code."""
        if not self.developer(ctx.author.id):
            return await ctx.send("Hmm, It appears you are not one of my developers.")
        else:
            env = {
               "bot": self.bot,
               "music": self.bot.music_manager,
               "guild": ctx.guild, 
               "channel": ctx.channel,
               "message": ctx.message,
               "author": ctx.author,
               "ctx": ctx
            }
            env.update(globals())

            code = self.clean_code(code)
            out = io.StringIO()
            err = out = None

            to_compile = f'async def func():\n{textwrap.indent(code, "  ")}'

            def paginate(text: str):
                '''Simple generator that paginates text.'''
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
            exec(to_compile, env)
        except Exception as e:
            err = await ctx.send(f'```py\n{e.__class__.__name__}: {e}\n```')
            return await ctx.message.add_reaction('\u2049')

        func = env['func']
        try:
            with redirect_stdout(out):
                ret = await func()
        except Exception as e:
            value = out.getvalue()
            err = await ctx.send(f'```py\n{value}{traceback.format_exc()}\n```')
        else:
            value = out.getvalue()
            if ret is None:
                if value:
                    try:
                        out = await ctx.send(f'```py\n{value}\n```')
                    except:
                        paginated_text = paginate(value)
                        for page in paginated_text:
                            if page == paginated_text[-1]:
                                out = await ctx.send(f'```py\n{page}\n```')
                                break
                            await ctx.send(f'```py\n{page}\n```')
            else:
                self._last_result = ret
                try:
                    out = await ctx.send(f'```py\n{value}{ret}\n```')
                except:
                    paginated_text = paginate(f"{value}{ret}")
                    for page in paginated_text:
                        if page == paginated_text[-1]:
                            out = await ctx.send(f'```py\n{page}\n```')
                            break
                        await ctx.send(f'```py\n{page}\n```')

        if out:
            await ctx.message.add_reaction('\u2705')  # tick
        elif err:
            await ctx.message.add_reaction('\u2049')  # x
        else:
            await ctx.message.add_reaction('\u2705')

def setup(bot):
    bot.add_cog(Owner(bot))
