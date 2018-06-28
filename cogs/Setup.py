import discord
from discord.ext import commands


class Setup:
    """Setup/Configure the bot for your server.
    You need the Manager Server permission to use any of these commands.
    NOTE: I am not responsible if someone with the manage server permission uses one of these command to mess up your configuration.
    You have been warned.
    """
    def __init__(self, bot):
        self.bot = bot
        self.placeholders = "\n".join([
            "/u/ - The user as a mention",
            "/u-nm/ - The user but as User#Discriminator",
            "/u-id/ - The ID of the user."
            "/g/ - The name of the guild",
            "/g-id/ - The id of the guild.",
            "/g-count/ - The count of member's in the guild."
        ])
        self.default_welcome_msg = "Hey **/u/**, Welcome to */g/*. Enjoy your stay."
        self.default_leave_msg = "Really **/u/**, had to ditch this server."

    async def prompt_for_welcome_channel(self, ctx, cache):
        cache.append(await ctx.send("Please mention the welcome channel you want welcomes/leaves to be in."))
        waiter = await self.bot.wait_for("message", check=lambda m: m.author.id == ctx.author.id)
        if waiter.content.startswith("<#"):
            await self.bot.db.update_config(ctx.guild.id, {"welcome_channel": int(waiter.content.strip("<#>"))})
            pass
        else:
            cache.append(await ctx.send("You provided an invalid channel. Please try again."))
            return await self.prompt_for_welcome_channel(ctx, cache=cache)

    async def prompt_for_mod_log_channel(self, ctx, cache):
        cache.append(await ctx.send("Please mention the mod log channel you want mod logs to be in."))
        waiter = await self.bot.wait_for("message", check=lambda m: m.author.id == ctx.author.id)
        if waiter.content.startswith("<#"):
            await self.bot.db.update_config(ctx.guild.id, {"mod_log_channel": int(waiter.content.strip("<#>"))})
            pass
        else:
            cache.append(await ctx.send("You provided an invalid channel. Please try again."))
            return await self.prompt_for_mod_log_channel(ctx, cache=cache)

    async def prompt_for_auto_role(self, ctx, cache):
        cache.append(await ctx.send("Please enter a role name for the auto feature. Note: Names are case sensitive."))
        waiter = await self.bot.wait_for("message", check=lambda m: m.author.id == ctx.author.id)
        role = discord.utils.get(ctx.guild.roles, name=waiter.clean_content)
        if role:
            await self.bot.db.update_config(ctx.guild.id, {"auto_role": role.id})
            pass
        else:
            cache.append(await ctx.send("You provided an invalid role name. Please try again."))
            return await self.prompt_for_auto_role(ctx, cache=cache)

    @commands.command(aliases=["setup"])
    @commands.has_permissions(manage_guild=True)
    async def configure(self, ctx):
        """Guides you through the setup for the bot."""
        cache = []
        cache.append(await ctx.send("What should the prefix be? (Say none for the default.)"))
        waiter1 = await self.bot.wait_for("message", check=lambda m: m.author.id == ctx.author.id)
        await self.bot.db.update_config(ctx.guild.id, {"prefix": waiter1.clean_content if waiter1.clean_content.lower() != "none" else "="})

        cache.append(await ctx.send(f"Prefix has been successfully set to: {waiter1.clean_content if waiter1.clean_content.lower() != 'none' else '='}"))
        cache.append(await ctx.send("Would you like to enable welcome/leave messages? (Yes/No)"))
        waiter2 = await self.bot.wait_for("message", check=lambda m: m.author.id == ctx.author.id)

        if waiter2.clean_content.lower() in ["yes", "y"]:
            await self.bot.db.update_config(ctx.guild.id, {"welcomes_enabled": True, "leaves_enabled": True})
            await self.prompt_for_welcome_channel(ctx, cache=cache)
            await self.prompt_for_auto_role(ctx, cache=cache)

            cache.append(await ctx.send(f"What should the welcome message be? (Type normal/default for the default) The valid placeholders are: ```\n{self.placeholders}```"))
            waiter4 = await self.bot.wait_for("message", check=lambda m: m.author.id == ctx.author.id)
            if waiter4.clean_content.lower() in ["default", "normal"]:
                await self.bot.db.update_config(ctx.guild.id, {"welcome_message": self.default_welcome_msg})
            else:
                await self.bot.db.update_config(ctx.guild.id, {"welcome_message": waiter4.clean_content})

            cache.append(await ctx.send(f"What should the leave message be? (Type normal/default for the default) The valid placeholders are: ```\n{self.placeholders}```"))
            waiter5 = await self.bot.wait_for("message", check=lambda m: m.author.id == ctx.author.id)
            if waiter5.clean_content.lower() in ["default", "normal"]:
                await self.bot.db.update_config(ctx.guild.id, {"leave_message": self.default_leave_msg})
            else:
                await self.bot.db.update_config(ctx.guild.id, {"leave_message": waiter5.clean_content})
        else:
            pass

        cache.append(await ctx.send("Would you like to enable mod logs?"))
        waiter6 = await self.bot.wait_for("message", check=lambda m: m.author.id == ctx.author.id)
        if waiter6.clean_content.lower() in ["yes", "y"]:
            await self.prompt_for_mod_log_channel(ctx, cache=cache)
        else:
            pass

        for cached in cache:
            try:
                await cached.delete()
            except discord.NotFound:
                pass
        prefix = await self.bot.db.get_prefix(ctx.guild.name)
        await ctx.send(f"Bot setup complete. Note that the guild prefix is `{prefix}`.")

    @commands.command()
    @commands.has_permissions(manage_guild=True)
    async def prefix(self, ctx, new_prefix: str):
        """Changes the servers prefix."""
        if len(new_prefix) > 5:
            return await ctx.send("Please enter a prefix that is less that 5 characters.")
        await self.bot.db.update_config(ctx.guild.id, {"prefix": new_prefix})
        await ctx.send(f"The guild prefix has been changed to: `{new_prefix}`")

    @commands.command()
    @commands.has_permissions(manage_guild=True)
    async def welcomes(self, ctx):
        """Enables or disables welcome/leave messages."""
        welcomes_enabled = await self.bot.db.get_welcomes_enabled(ctx.guild.id)
        leaves_enabled = await self.bot.db.get_leaves_enabled(ctx.guild.id)
        await self.bot.db.update_config(ctx.guild.id, {"welcomes_enabled": not welcomes_enabled, "leaves_enabled": not leaves_enabled})
        await ctx.send(f"Welcomes/Leaves have been **{'enabled' if welcomes_enabled else 'disabled'}**")

    @commands.command(aliases=["setc", "sc"])
    @commands.has_permissions(manage_guild=True)
    async def setchannel(self, ctx):
        """Changes the channel for welcomes/leaves."""
        cache = []
        await self.prompt_for_welcome_channel(ctx, cache=cache)
        for cached in cache:
            try:
                await cached.delete()
            except discord.Forbidden:
                pass

    @commands.command(alaises=["setar", "sar"])
    @commands.has_permissions(manage_guild=True)
    async def setarole(self, ctx):
        """Enables auto role for new members."""
        cache = []
        await self.prompt_for_auto_role(ctx, cache=cache)
        for cached in cache:
            try:
                await cached.delete()
            except discord.Forbidden:
                pass

    @commands.command(aliases=["setwm", "swm"])
    @commands.has_permissions(manage_guild=True)
    async def setwmessage(self, ctx, *, msg: str = None):
        """Sets the welcome message."""
        if not msg:
            await ctx.send(f"Please provide a welcome message you can use the following place holders.\n```\n{self.placeholders}```")
        else:
            await self.bot.db.update_config(ctx.guild.id, {"welcome_message": msg})

    @commands.command(aliases=["setlm", "slm"])
    @commands.has_permissions(manage_guild=True)
    async def setlmessage(self, ctx, *, msg: str = None):
        """Sets the leave message."""
        if not msg:
            await ctx.send(f"Please provide a leave message you can use the following place holders.\n```\n{self.placeholders}```")
        else:
            await self.bot.db.update_config(ctx.guild.id, {"leave_message": msg})

    @commands.command(aliases=["setml", "sml"])
    @commands.has_permissions(manage_guild=True)
    async def setmlogs(self, ctx):
        """Sets the mod-log channel for the server."""
        cache = []
        await self.prompt_for_mod_log_channel(ctx, cache=cache)
        for cached in cache:
            try:
                await cached.delete()
            except discord.Forbidden:
                pass


def setup(bot):
    bot.add_cog(Setup(bot))
