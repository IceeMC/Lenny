import aiohttp
from music.AudioManager import AudioManager
from discord.ext import commands
import json
import os
import random
import asyncio
import discord

with open("config.json") as config_file:
    config = json.load(config_file)


bot = commands.Bot(command_prefix=commands.when_mentioned_or("^"))
bot.remove_command("help")


bot.session = aiohttp.ClientSession()
bot.music_manager = AudioManager(bot, config["nodes"], shards=1)


bot.load_extension("cogs.General")
bot.load_extension("cogs.Music")
bot.load_extension("cogs.Owner")
bot.load_extension("cogs.Utility")


def capitalize(text: str):
    new_str = []
    for split in text.split("_"):
        new_str.append(split.title())
    return " ".join(new_str)


@bot.event
async def on_message(msg):
    """Ignores the message of bots."""
    if not msg.author.bot:
        await bot.process_commands(msg)


@bot.event
async def on_ready():
    print("Bot is online.")
    bot.loop.create_task(bot.music_manager.start_bg_task())
    games = [
        f"^help | with {len(bot.guilds)} servers!",
        f"^help | with {len(bot.users)} users!",
        "^help | Python > NodeJS",
        "^help | ACK",
        "^help | I pet my dog",
        "^help | 00F",
        "^help | ...",
        "^help | Google > Bing",
        "^help | Mine diamonds",
        "^help | I'm always 🤔",
        "^help | My name jif."
    ]
    while True:
        await bot.change_presence(activity=discord.Game(name=random.choice(games)))
        await asyncio.sleep(10)


@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        pass
    if isinstance(error, commands.BotMissingPermissions):
        pass
    if isinstance(error, (commands.BadArgument, commands.MissingRequiredArgument, commands.BadArgument, commands.TooManyArguments)):
        return await ctx.send(f"Invalid command usage the proper usage is `{ctx.prefix}{ctx.command.signature}`.")
    if isinstance(error, commands.CommandOnCooldown):
        cooldown_str = f"{error.retry_after} seconds" if error.retry_after > 1 else f"{error.retry_after} second"
        return await ctx.send(f"Ack! This command is on cooldown for {cooldown_str}")
    if isinstance(error, commands.MissingPermissions):
        permissions = "\n".join([capitalize(perm) for perm in error.missing_perms])
        return await ctx.send(f"Psst, You lack the permissions:\n{permissions}")
    if isinstance(error, commands.DisabledCommand):
        return await ctx.send("Hmm, This command is currently disabled.")


bot.run(config["token"])
