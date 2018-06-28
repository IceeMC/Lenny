from motor.motor_asyncio import AsyncIOMotorClient
from .Logger import Logger


class DBHelper:
    def __init__(self, bot):
        self.bot = bot
        self.db = None

    def connect(self):
        Logger.info("Connecting to database...")
        self.db = AsyncIOMotorClient("mongodb://localhost:27017").lenny
        Logger.info("Connected to database!")

    # Configuration

    async def _get_config(self, guild_id: int):
        config = await self.db.configs.find_one({"_id": guild_id})
        if not config:
            await self.db.configs.insert_one({
                "_id": guild_id,
                "prefix": "=",
                "welcome_channel": None,
                "starboard_channel": None,
                "starboard_cache": [],
                "welcomes_enabled": False,
                "leaves_enabled": False,
                "welcome_message": "Hey **/u/**, Welcome to */g/*. Enjoy your stay while you can *winks*.",
                "leave_message": "Really **/u/**, had to ditch this server. Eh, We don't really care.",
                "auto_role": None,
                "anti_links": False,
                "anti_swear": False,
                "mod_log_channel": None,
                "mod_log_cases": []
            })
            found = await self.db.configs.find_one({"_id": guild_id})
            return found
        else:
            return config

    async def get_prefix(self, guild_id):
        config = await self._get_config(guild_id)
        return config["prefix"]

    async def get_welcome_channel(self, guild_id):
        config = await self._get_config(guild_id)
        return config["welcome_channel"]

    async def get_starboard_channel(self, guild_id):
        config = await self._get_config(guild_id)
        return config["starboard_channel"]

    async def get_starboard_cache(self, guild_id):
        config = await self._get_config(guild_id)
        return config["starboard_cache"]

    async def get_welcomes_enabled(self, guild_id):
        config = await self._get_config(guild_id)
        return config["welcomes_enabled"]

    async def get_auto_role(self, guild_id):
        config = await self._get_config(guild_id)
        return config["auto_role"]

    async def get_leaves_enabled(self, guild_id):
        config = await self._get_config(guild_id)
        return config["leaves_enabled"]

    async def get_welcome_message(self, guild_id):
        config = await self._get_config(guild_id)
        return config["welcome_message"]

    async def get_leave_message(self, guild_id):
        config = await self._get_config(guild_id)
        return config["leave_message"]

    async def get_anti_links(self, guild_id):
        config = await self._get_config(guild_id)
        return config["anti_links"]

    async def get_anti_swear(self, guild_id):
        config = await self._get_config(guild_id)
        return config["anti_swear"]

    async def get_mod_log_channel(self, guild_id):
        config = await self._get_config(guild_id)
        return config["mod_log_channel"]

    async def get_mod_log_cases(self, guild_id):
        config = await self._get_config(guild_id)
        return config["mod_log_cases"]

    async def update_config(self, guild_id, to_update):
        return await self.db.configs.update_one({"_id": guild_id}, {"$set": to_update})

    async def config_count(self):
        return await self.db.configs.count()
