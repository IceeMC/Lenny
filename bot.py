import asyncio
import json
import random
import re
import time
import traceback

import aiohttp
import discord
from discord.ext import commands

from music.AudioManager import AudioManager

bot = commands.Bot(command_prefix=commands.when_mentioned_or("="))
bot.remove_command("help")

with open("config.json") as config_file:
    bot.config = json.load(config_file)

bot.session = aiohttp.ClientSession(loop=bot.loop)
bot.music_manager = AudioManager(bot, bot.config["nodes"], shards=1)
bot.version = 1


bot.load_extension("cogs.General")
bot.load_extension("cogs.Music")
bot.load_extension("cogs.Utility")
bot.load_extension("cogs.Idiotic")
bot.load_extension("cogs.Owner")


def capitalize(text: str):
    new_str = []
    for split in text.split("_"):
        new_str.append(split.title())
    return " ".join(new_str)


@bot.event
async def on_message(msg):
    """Ignores the message of bots."""
    if not msg.author.bot and msg.guild:
        await bot.process_commands(msg)


@bot.event
async def on_message_edit(old_msg, new_msg):
    """Runs a command if someone mistypes a command.

    Example:
        before: =bobros
        after: =bobross
    If the old message equals the new message the bot will ignore it same thing if the author is a bot.
    Else the bot will process the command.
    """
    if old_msg.author.bot and new_msg.author.bot:
        return  # Ignore bots
    if old_msg.content == new_msg.content:
        return  # Ignore the same content
    else:
        # Run the command
        await bot.process_commands(new_msg)


@bot.event
async def on_ready():
    print("Bot is online.")
    bot.started_at = time.time()

@bot.event
async def on_command_error(ctx, error):
    ignored = (
        commands.CommandNotFound,
        commands.NoPrivateMessage,
        discord.Forbidden,
        commands.CheckFailure
    )
    if isinstance(error, ignored):
        pass
    elif isinstance(error, commands.BadArgument):
        member_not_found = re.match('Member "(.*)" not found', error.args[0])
        if member_not_found:
            await ctx.send(f"The requested member `{member_not_found.group(1)}` was not found on this server.")
    elif isinstance(error, (commands.MissingRequiredArgument, commands.TooManyArguments)):
        await ctx.send(f"Invalid command usage the proper usage is `{ctx.prefix}{ctx.command.signature}`.")
    elif isinstance(error, commands.CommandOnCooldown):
        cooldown_str = f"{error.retry_after:.0f} seconds" if error.retry_after > 1 else f"{error.retry_after:.0f} second"
        await ctx.send(f"Ack! This command is on cooldown for {cooldown_str}")
    elif isinstance(error, commands.MissingPermissions):
        permissions = "\n".join([capitalize(perm) for perm in error.missing_perms])
        await ctx.send(f"Psst, You lack the permissions:\n{permissions}")
    elif isinstance(error, commands.DisabledCommand):
        await ctx.send("Hmm, This command is currently disabled.")
    else:
        try:
            await ctx.send(f"An error occurred:\n```py\n{''.join(traceback.format_exception(type(error), error, error.__traceback__))}```\n\nYou should not get an error like this.\nPlease join the support server https://discord.gg/ftsNNMM so the developers can help you.")
        except discord.Forbidden:
            pass

games = [
    f"=help | with {len(bot.guilds)} servers!",
    f"=help | with {len(bot.users)} users!",
    "=help | Python > NodeJS",
    "=help | ACK",
    "=help | I pet my dog",
    "=help | 00F",
    "=help | ...",
    "=help | Google > Bing",
    "=help | Mine diamonds",
    "=help | I'm always 🤔",
    "=help | My name jif."
]

async def status_change():
    while not bot.is_closed():
        await bot.change_presence(activity=discord.Game(name=f"{random.choice(games)} | v{bot.version}"))
        await asyncio.sleep(10)

bot.loop.create_task_task(status_change())
bot.loop.create_task(bot.music_manager.start_bg_task())
bot.run(bot.config["token"])
