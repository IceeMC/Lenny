import discord
from discord.ext import commands


class Moderation:
    """Get that boot, hammer, or zipper quick!!!"""
    def __init__(self, bot):
        self.bot = bot

    async def send_to_mod_logs(self, ctx, **kwargs):
        mod_logs = self.bot.get_channel(await self.bot.db.get_mod_log_channel(ctx.guild.id))
        if not mod_logs:
            pass
        try:
            cases = await self.bot.db.get_mod_log_cases(ctx.guild.id)
            cases.append(kwargs)
            await self.bot.db.update_config(ctx.guild.id, {"mod_log_cases": cases})
            em = discord.Embed(color=0xffffff, title=kwargs.get("type"))
            em.add_field(name="Reason", value=kwargs.get("reason"))
            em.add_field(name="Member", value=kwargs.get('mem') if kwargs.get("mem") else "None")
            em.add_field(name="Moderator", value=kwargs.get("mod"))
            em.add_field(name="Case Number", value=kwargs.get("case"))
            await mod_logs.send(embed=em)
        except discord.Forbidden:
            pass

    @commands.command()
    @commands.has_permissions(kick_members=True)
    async def mute(self, ctx, member: discord.Member, reason: str = None):
        """Use that zipper. This is channel only."""
        if member is ctx.author:
            return await ctx.send("Not so fast. You cannot mute yourself. Kthx.")
        try:
            await ctx.channel.set_permissions(member, send_messages=False)
        except discord.Forbidden:
            return await ctx.send("Oof, I cannot mute members. Please give me the manage permissions, permission.")
        try:
            await ctx.message.delete()
        except discord.Forbidden:
            pass
        await ctx.send("User muted.")
        case_count = len(await self.bot.db.get_mod_log_cases(ctx.guild.id))
        temp_reason = reason if reason else "No reason provided by moderator."
        mem = f"{str(member)}({member.id})"
        mod = f"{str(ctx.author)}({ctx.author.id})"
        await self.send_to_mod_logs(ctx, type="Mute", case=case_count + 1, reason=temp_reason, mem=mem, mod=mod)

    @commands.command()
    @commands.has_permissions(kick_members=True)
    async def unmute(self, ctx, member: discord.Member, reason: str = None):
        """Unzip someones mouth. This is channel only."""
        if member is ctx.author:
            return await ctx.send("Not so fast. You cannot unmute yourself. Kthx.")
        try:
            await ctx.channel.set_permissions(member, send_messages=False)
        except discord.Forbidden:
            return await ctx.send("Oof, I cannot unmute members. Please give me the manage permissions, permission.")
        try:
            await ctx.message.delete()
        except discord.Forbidden:
            pass
        await ctx.send("User unmuted.")
        case_count = len(await self.bot.db.get_mod_log_cases(ctx.guild.id))
        temp_reason = reason if reason else "No reason provided by moderator."
        mem = f"{str(member)}({member.id})"
        mod = f"{str(ctx.author)}({ctx.author.id})"
        await self.send_to_mod_logs(ctx, type="Unmute", case=case_count + 1, reason=temp_reason, mem=mem, mod=mod)

    @commands.command()
    @commands.has_permissions(kick_members=True)
    async def kick(self, ctx, member: discord.Member, reason: str = None):
        if member is ctx.author:
            return await ctx.send("Not so fast. You cannot kick yourself. Kthx.")
        try:
            await member.kick(reason=reason)
            case_count = len(await self.bot.db.get_mod_log_cases(ctx.guild.id))
            temp_reason = reason if reason else "No reason provided by moderator."
            mem = f"{str(member)}({member.id})"
            mod = f"{str(ctx.author)}({ctx.author.id})"
            await self.send_to_mod_logs(ctx, type="Kick", case=case_count + 1, reason=temp_reason, mem=mem, mod=mod)
            try:
                await ctx.message.delete()
            except discord.Forbidden:
                pass
            await ctx.send("User kicked")
        except discord.Forbidden:
            return await ctx.send("This member cannot be kicked.")

    @commands.command()
    @commands.has_permissions(kick_members=True)
    async def ban(self, ctx, member: discord.Member, reason: str = None):
        """Bans a member from the guild."""
        if member is ctx.author:
            return await ctx.send("Not so fast. You cannot ban yourself. Kthx.")
        try:
            await member.ban(reason=reason)
            case_count = len(await self.bot.db.get_mod_log_cases(ctx.guild.id))
            temp_reason = reason if reason else "No reason provided by moderator."
            mem = f"{str(member)}({member.id})"
            mod = f"{str(ctx.author)}({ctx.author.id})"
            await self.send_to_mod_logs(ctx, type="Ban", case=case_count + 1, reason=temp_reason, mem=mem, mod=mod)
            try:
                await ctx.message.delete()
            except discord.Forbidden:
                pass
            await ctx.send("User banned")
        except discord.Forbidden:
            return await ctx.send("This member cannot be banned.")

    @commands.command(aliases=["clean", "prune"])
    @commands.has_permissions(manage_messages=True)
    async def purge(self, ctx, amount: int):
        if amount > 99:
            return await ctx.send("Please provide a number less than 99")
        try:
            await ctx.channel.purge(limit=amount+1)
        except discord.NotFound:
            pass
        await ctx.send("Purged successfully.")


def setup(bot):
    bot.add_cog(Moderation(bot))
