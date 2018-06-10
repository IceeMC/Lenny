import discord
from music.AudioManager import AudioManager
from discord.ext import commands
import json
import os
with open("config.json") as config_file:
    config = json.load(config_file)

def load_cogs():
    cogs = [x.strip(".py") for x in os.listdir("cogs")]
    for cog in cogs:
        if cog == "__pycache__":
            return
        try:
            bot.load_extension("cogs.{}".format(cog))
            print("Loaded cog: {}".format(cog))
        except Exception as e:
            print("Failed to load the cog {} because {}:{}".format(cog, type(e).__name__, e))

bot = commands.Bot(command_prefix=commands.when_mentioned_or("^"))
bot.manager = AudioManager(bot, config["nodes"], shards=1)

@bot.event
async def on_ready():
    print("Bot is online.")
    load_cogs()
    bot.loop.create_task(bot.manager.create())

@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        pass

bot.run(config["token"])