import discord
from discord.ext import commands


class Utility:
    """Useful commands for any occasion."""
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def userinfo(self, ctx, member: discord.Member = None):
        """Gets info for a user."""
        embed = discord.Embed(color=0xffffff)
        member = member if member else ctx.author
        embed.set_thumbnail(url=member.avatar_url if member.avatar_url else None)
        embed.add_field(name="Name", value=f"{member.name}#{member.discriminator}")
        embed.add_field(name="ID", value=member.id)
        embed.add_field(name="Account Type", value=":bust_in_silhouette: User" if not member.bot else ":robot: Bot")
        embed.add_field(name="Account Created", value=member.created_at.__format__("%b %m, %Y"))
        embed.add_field(name="Joined Server", value=member.joined_at.__format__("%b %m, %Y"))
        embed.add_field(name="Highest Role", value=member.top_role.name)
        embed.add_field(name="Roles", value=", ".join([r.name for r in member.roles]))
        embed.add_field(name="Role count", value=len(member.roles))
        if member.nick:
            embed.add_field(name="Nickname", value=member.nick)
        if member.activity:
            embed.add_field(name="Game", value=f"Currently playing **{member.activity.name}** in {member.status} mode.")
        await ctx.send(embed=embed)

    @commands.command(aliases=['si', 'sinfo'])
    async def serverinfo(self, ctx, *, guild_name: str = None):
        """Lists some info about the current or passed server."""
        
        # Check if we passed another guild
        guild = None
        if guild_name is None:
            guild = ctx.guild
        else:
            for g in self.bot.guilds:
                if g.name.lower() == guild_name.lower():
                    guild = g
                    break
                if str(g.id) == str(guild_name):
                    guild = g
                    break
        if guild is None:
            # We didn't find it
            await ctx.send("I couldn't find that guild...")
            return
        
        server_embed = discord.Embed(color=ctx.author.color)
        server_embed.title = guild.name
        server_embed.description = "Server Stats"
        online_members = 0
        bot_member = 0
        bot_online = 0
        for member in guild.members:
            if member.bot:
                bot_member += 1
                if not member.status == discord.Status.offline:
                        bot_online += 1
                continue
            if not member.status == discord.Status.offline:
                online_members += 1
        bot_percent = "{:,g}%".format((bot_member/len(guild.members))*100)
        user_string = "{:,}/{:,} online ({:,g}%)".format(
                online_members,
                len(guild.members) - bot_member,
                round((online_members/(len(guild.members) - bot_member) * 100), 2)
        )
        b_string = "bot" if bot_member == 1 else "bots"
        user_string += "\n{:,}/{:,} {} online ({:,g}%)".format(
                bot_online,
                bot_member,
                b_string,
                round((bot_online/bot_member)*100, 2)
        )
        try:
            ban_count = len(await guild.bans())
        except discord.Forbidden:
            ban_count = "Lenny Lacks the `ban members` permission. (In order to retrieve bans)"
        verification_levels = {
            0: "**None** No Security measures have been taken.",
            1: "**Low** Light Security measures have been taken. (Verified Email)",
            2: "**Moderate** Moderate Security measures have been taken. (Registered on Discord for longer than 5 minutes)",
            3: "**High** High Security measures have been taken. (Member of server for longer than 10 minutes)",
            4: "**Fort Knox** Almost inpenetrable Security measures have been taken. (Verified Phone)"
        }
        content_filter = {
            0: "**None** No Scanning enabled. (Don't scan any messages.)",
            1: "**Moderate** Moderate Scanning enabled. (Scan messages from members without a role.)",
            2: "**High** High Scanning enabled. (Scans every message.)"
        }
        mfa_levels = {
            0: "Does not require 2FA for members with Admin permission.",
            1: "Requires 2FA for members with Admin permission."
        }
        server_embed.add_field(name="Members", value="{:,}/{:,} online ({:.2f}%)\n{:,} {} ({}%)".format(online_members, len(guild.members), bot_percent), inline=True)
        server_embed.add_field(name="Members ({:,} total)".format(len(guild.members)), value=user_string, inline=True)
        server_embed.add_field(name="Roles", value=str(len(guild.roles)), inline=True)
        chandesc = "{:,} text, {:,} voice".format(len(guild.text_channels), len(guild.voice_channels))
        server_embed.add_field(name="Channels", value=chandesc, inline=True)
        server_embed.add_field(name="Default Role", value=guild.default_role, inline=True)
        server_embed.add_field(name="Owner", value=guild.owner.name + "#" + guild.owner.discriminator, inline=True)
        server_embed.add_field(name="AFK Channel", value=guild.afk_channel, inline=True)
        server_embed.add_field(name="Verification", value=verification_levels[guild.verification_level])
        server_embed.add_field(name="Explicit Content Filter", value=content_filter[guild.explicit_content_filter])
        server_embed.add_field(name="2FA Requirement", value=mfa_levels[guild.mfa_level])
        server_embed.add_field(name="Ban Count", value=ban_count)
        server_embed.add_field(name="Voice Region", value=guild.region, inline=True)
        server_embed.add_field(name="Considered Large", value=guild.large, inline=True)
        # Find out where in our join position this server is
        joined_list = []
        pop_list = []
        for g in self.bot.guilds:
            joined_list.append({ 'ID' : g.id, 'Joined' : g.me.joined_at })
            pop_list.append({ 'ID' : g.id, 'Population' : len(g.members) })
        
        # sort the guilds by join date
        t_joined_list = sorted(joined_list, key=lambda x:x['Joined'])
        t_pop_list = sorted(pop_list, key=lambda x:x['Population'], reverse=True)
        
        check_item = {"ID" : guild.id, "Joined": guild.me.joined_at}
        total = len(t_joined_list)
        position = t_joined_list.index(check_item) + 1
        server_embed.add_field(name="Join Position", value="{:,} of {:,}".format(position, total), inline=True)
        
        # Get our population position
        check_item = {"ID": guild.id, "Population": len(guild.members)}
        total = len(t_pop_list)
        position = t_pop_list.index(check_item) + 1
        server_embed.add_field(name="Population Rank", value="{:,} of {:,}".format(position, total), inline=True)
        
        emojitext = ""
        emojicount = 0
        for emoji in guild.emojis:
            if emoji.animated:
                emoji_mention = "<a:"+emoji.name+":"+str(emoji.id)+">"
            else:
                emoji_mention = "<:"+emoji.name+":"+str(emoji.id)+">"
            test = emojitext + emoji_mention
            if len(test) > 1024:
                # TOOO BIIIIIIIIG
                emojicount += 1
                if emojicount == 1:
                    ename = "Emojis ({:,} total)".format(len(guild.emojis))
                else:
                    ename = "Emojis (Continued)"
                server_embed.add_field(name=ename, value=emojitext, inline=True)
                emojitext=emoji_mention
            else:
                emojitext = emojitext + emoji_mention

        if len(emojitext):
            if emojicount == 0:
                emojiname = "Emojis ({} total)".format(len(guild.emojis))
            else:
                emojiname = "Emojis (Continued)"
            server_embed.add_field(name=emojiname, value=emojitext, inline=True)

        if len(guild.icon_url):
            server_embed.set_thumbnail(url=guild.icon_url)
        else:
            # No Icon
            server_embed.set_thumbnail(url=ctx.author.default_avatar_url)
        server_embed.set_footer(text="Server ID: {}".format(guild.id))
        await ctx.send(embed=server_embed)


def setup(bot):
    bot.add_cog(Utility(bot))
