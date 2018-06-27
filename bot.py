import asyncio
import json
import random
import re
import time
import os
import aiohttp
import discord
from discord.ext import commands
from music.AudioManager import AudioManager
from utils.Logger import Logger
from utils.DBHelper import DBHelper

async def prefix(bot, message):
    prefix = await bot.db.get_prefix(message.guild.id)
    return commands.when_mentioned_or(prefix)(bot, message)

bot = commands.Bot(command_prefix=prefix)

with open("config.json") as config_file:
    bot.config = json.load(config_file)

bot.cog_files = sorted([x.replace(".py", "") for x in os.listdir("cogs") if x.endswith(".py")])
bot.db = DBHelper(bot)
bot.db.connect()
bot.remove_command("help")
bot.session = aiohttp.ClientSession(loop=bot.loop)
bot.music_manager = AudioManager(bot, bot.config["nodes"], shards=1)
bot.version = "1.1"
bot.commands_ran = {}


def caps(perm: str):
    output = []
    for x in perm.split("_"):
        output.append(x.title())

    return " ".join(output)


@bot.event
async def on_message(msg):
    """Ignores the message of bots."""
    if not msg.author.bot and msg.guild:
        await bot.process_commands(msg)

        
@bot.event
async def on_guild_join(guild):
    lol = bot.get_channel(put a channel id here)
    em = discord.Embed(color=discord.Color(value=0x00ff00))
    em.title = "I have joined new server!"
    em.description = f"Server: {guild}"
    em.set_footer(text=f"ID: {guild.id}")
    em.set_thumbnail(url=guild.icon_url)
    await lol.send(embed=em)

      
@bot.event
async def on_guild_remove(guild):
    lol = bot.get_channel(put a channel id here)
    em = discord.Embed(color=discord.Color(value=0xf44242))
    em.title = "I have left a server."
    em.description = f"Server: {guild}"
    em.set_footer(text=f"ID: {guild.id}")
    await lol.send(embed=em)   

    
@bot.event
async def on_message_edit(old_msg, new_msg):
    """Runs a command if someone mistypes a command.

    Example:
        before: =bobros
        after: =bobross
    If the old message equals the new message the bot will ignore it same thing if the author is a bot.
    Else the bot will process the command.
    """
    if old_msg.author.bot and new_msg.author.bot or old_msg.content == new_msg.content:
        return
    else:
        # Run the command
        await bot.process_commands(new_msg)


@bot.event
async def on_ready():
    bot.started_at = time.time()
    Logger.info(f"Bot ready as: {bot.user} serving in {len(bot.guilds)} guilds with {len(bot.users)} users.")
    Logger.info("Loading cogs...")
    for cog in bot.cog_files:
        bot.load_extension(f"cogs.{cog}")
        Logger.info(f"Loaded cog: {cog}")
    Logger.info("All cogs loaded.")
    bot.loop.create_task(status_change())
    Logger.task("Status change has started.")
    bot.loop.create_task(bot.music_manager.audio_task())
    Logger.task("Audio task has started.")


@bot.event
async def on_member_join(member):
    chan = bot.get_channel(await bot.db.get_welcome_channel(member.guild.id))
    msg = (await bot.db.get_welcome_message(member.guild.id))\
        .replace("/u/", member.mention)\
        .replace("/u-nm/", str(member))\
        .replace("/u-id/", str(member.id))\
        .replace("/g/", str(member.guild))\
        .replace("/g-id/", str(member.guild.id))\
        .replace("/g-count/", str(len(member.guild.members)))
    welcomes_enabled = await bot.db.get_welcomes_enabled(member.guild.id)
    auto_role = await bot.db.get_auto_role(member.guild.id)
    if not welcomes_enabled or not chan:
        return
    try:
        await chan.send(msg)
        if not auto_role:
            pass
        else:
            await member.add_roles(auto_role)
    except Exception:
        pass


@bot.event
async def on_member_remove(member):
    chan = bot.get_channel(await bot.db.get_welcome_channel(member.guild.id))
    msg = (await bot.db.get_leave_message(member.guild.id))\
        .replace("/u/", member.mention)\
        .replace("/u-nm/", str(member))\
        .replace("/u-id/", str(member.id))\
        .replace("/g/", str(member.guild))\
        .replace("/g-id/", str(member.guild.id))\
        .replace("/g-count/", str(len(member.guild.members)))
    leaves_enabled = await bot.db.get_leaves_enabled(member.guild.id)
    if not leaves_enabled or not chan:
        return
    try:
        await chan.send(msg)
    except discord.Forbidden or discord.NotFound or discord.HTTPException:
        pass


@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, discord.Forbidden):
        pass
    elif isinstance(error, commands.CommandNotFound):
        pass
    elif isinstance(error, commands.BadArgument):
        member_not_found = re.match('Member "(.*)" not found', error.args[0])
        if member_not_found:
            await ctx.send(f"The requested member `{member_not_found.group(1)}` was not found on this server.")
    elif isinstance(error, (commands.MissingRequiredArgument, commands.TooManyArguments)):
        await ctx.send(f"Invalid command usage the proper usage is `{ctx.prefix}{ctx.command.signature}`.")
    elif isinstance(error, commands.CommandOnCooldown):
        if ctx.author.id in bot.config["developers"]:
            return await ctx.reinvoke()
        cooldown_str = f"{error.retry_after:.0f} seconds" if error.retry_after > 1 else f"{error.retry_after:.0f} second"
        await ctx.send(f"Ack! This command is on cooldown for {cooldown_str}")
    elif isinstance(error, commands.MissingPermissions):
        permissions = "\n".join([caps(perm) for perm in error.missing_perms])
        await ctx.send(f"Oh noes, It looks like you are missing the following permissions:\n{permissions}")
    elif isinstance(error, commands.DisabledCommand):
        if ctx.author.id in bot.config["developers"]:
            return await ctx.reinvoke()
        await ctx.send("Hmm, This command is currently disabled.")
    else:
        Logger.error(error)


@bot.event
async def on_command(ctx):
    if bot.commands_ran.get(ctx.command.name) is None:
        bot.commands_ran[ctx.command.name] = 1
    else:
        counter = bot.commands_ran.get(ctx.command.name)
        counter += 1
        print(counter)


async def status_change():
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
    while not bot.is_closed():
        await bot.change_presence(activity=discord.Game(name=f"{random.choice(games)} | v{bot.version}"))
        await asyncio.sleep(30)

bot.run(bot.config["token"])
