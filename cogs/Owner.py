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
                
                @command.commands(name='eval')
                async def _eval(ctx, *, body):
                    """Evaluates python code"""
                  if not dev_check(ctx.author.id):
                       return await ctx.send("You cannot use this because you are not a developer.")
                  env = {
        'ctx': ctx,
        'channel': ctx.channel,
        'author': ctx.author,
        'guild': ctx.guild,
        'message': ctx.message,
        '_': bot._last_result,
    }

    env.update(globals())

    body = cleanup_code(body)
    stdout = io.StringIO()
    err = out = None

    to_compile = f'async def func():\n{textwrap.indent(body, "  ")}'

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
        with redirect_stdout(stdout):
            ret = await func()
    except Exception as e:
        value = stdout.getvalue()
        err = await ctx.send(f'```py\n{value}{traceback.format_exc()}\n```')
    else:
        value = stdout.getvalue()
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
            bot._last_result = ret
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
