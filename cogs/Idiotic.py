from discord.ext import commands
import discord
import random


class Idiotic:
    """Commands for the Idiotic API."""
    def __init__(self, bot):
        self.bot = bot
        self.session = bot.session
        self.key = bot.config["idiotic"]

    async def request(self, endpoint, params):
        async with self.session.get(f"https://dev.anidiots.guide/{endpoint}{params}", headers={"Authorization": self.key}) as idiotic:
            if idiotic.status != 200:
                raise Exception(f"Idiotic API returned code other than 200 - {idiotic.status}")
            d = await idiotic.json()
            return bytes(d["data"])

    @commands.command()
    async def brighten(self, ctx, member: discord.Member = None):
        """Brightens you or someone else by 50%"""
        member = member if member else ctx.author
        async with ctx.typing():
            image = await self.request(endpoint="effects/brightness", params=f"?avatar={member.avatar_url_as(format='png')}&brightness=50")
        await ctx.send(f"**{member.name}** has been brightened.", file=discord.File(image, filename="file.png"))

    @commands.command()
    async def darken(self, ctx, member: discord.Member = None):
        """Darkens's you or someone else by 50%"""
        member = member if member else ctx.author
        async with ctx.typing():
            image = await self.request(endpoint="effects/darkness", params=f"?avatar={member.avatar_url_as(format='png')}&darkness=50")
        await ctx.send(f"**{member.name}** has been darkened.", file=discord.File(image, filename="file.png"))

    @commands.command()
    async def greyscale(self, ctx, member: discord.Member = None):
        """Hint of grey anyone?"""
        member = member if member else ctx.author
        async with ctx.typing():
            image = await self.request(endpoint="effects/greyscale", params=f"?avatar={member.avatar_url_as(format='png')}")
        await ctx.send(f"**{member.name}** just got scaled with grey.", file=discord.File(image, filename="file.png"))

    @commands.command()
    async def invert(self, ctx, member: discord.Member = None):
        """Inverts you or someone else."""
        member = member if member else ctx.author
        async with ctx.typing():
            image = await self.request(endpoint="effects/invert", params=f"?avatar={member.avatar_url_as(format='png')}")
        await ctx.send(f"**{member.name}** has been inverted.", file=discord.File(image, filename="file.png"))

    @commands.command()
    async def sepia(self, ctx, member: discord.Member = None):
        """Gives an avatar a tinge of red."""
        member = member if member else ctx.author
        async with ctx.typing():
            image = await self.request(endpoint="effects/sepia", params=f"?avatar={member.avatar_url_as(format='png')}")
        await ctx.send(f"**{member.name}** is now a tinge of red.", file=discord.File(image, filename="file.png"))

    @commands.command()
    async def achievement(self, ctx, *, achievement: str):
        """Achieve something."""
        if len(achievement) > 21:
            return await ctx.send("Max achievement length is 21. Sorry.")
        async with ctx.typing():
            image = await self.request(endpoint="generators/achievement", params=f"?avatar={ctx.author.avatar_url_as(format='png')}&text={achievement}")
        await ctx.send(f"**{ctx.author.name}** has gotten an achievement. OwO.", file=discord.File(image, filename="file.png"))

    @commands.command()
    async def slap(self, ctx, member: discord.Member):
        """Slap someone for a wrong doing or for fun."""
        async with ctx.typing():
            image = await self.request(endpoint="generators/batslap", params=f"?slapper={ctx.author.avatar_url_as(format='png')}&slapped={member.avatar_url_as(format='png')}")
        await ctx.send(f"**{member.name}** has been slapped by **{ctx.author.name}**. Ouch.", file=discord.File(image, filename="file.png"))

    @commands.command()
    async def beautiful(self, ctx, member: discord.Member = None):
        """Makes you or someone else pretty. Kthx."""
        member = member if member else ctx.author
        async with ctx.typing():
            image = await self.request(endpoint="generators/beautiful", params=f"?avatar={member.avatar_url_as(format='png')}")
        await ctx.send(f"**{member.name}** is more beautiful", file=discord.File(image, filename="file.png"))

    @commands.command()
    async def blame(self, ctx, *, the_blame: str):
        """Blame something. This can be anything."""
        if len(the_blame) > 1100:
            return await ctx.send("Max blame length is 1100. Sorry.")
        async with ctx.typing():
            image = await self.request(endpoint="generators/blame", params=f"?name={the_blame}")
        await ctx.send(f"**{ctx.author.name}** just blamed something.", file=discord.File(image, filename="file.png"))

    @commands.command()
    async def bobross(self, ctx, member: discord.Member = None):
        """You get a bob ross makeover."""
        member = member if member else ctx.author
        async with ctx.typing():
            image = await self.request(endpoint="generators/bobross", params=f"?avatar={member.avatar_url_as(format='png')}")
        await ctx.send(f"**{member.name}** just got a bob ross makeover.", file=discord.File(image, filename="file.png"))

    @commands.command()
    async def challenger(self, ctx, member: discord.Member = None):
        """You can make anyone become a challenger."""
        member = member if member else None
        async with ctx.typing():
            image = await self.request(endpoint="generators/challenger", params=f"?avatar={member.avatar_url_as(format='png')}")
        await ctx.send(f"**{member.name}** is now the challenger.", file=discord.File(image, filename="file.png"))

    @commands.command()
    async def confused(self, ctx, member: discord.Member = None):
        """Makes you or someone else have confusion."""
        member = member if member else ctx.author
        members = [m for m in ctx.guild.members if not m == member]
        async with ctx.typing():
            image = await self.request(endpoint="generators/confused", params=f"?avatar={member.avatar_url_as(format='png')}&photo={random.choice(members).avatar_url_as(format='png')}")
        await ctx.send(f"**{member.name}** is confusion.", file=discord.File(image, filename="file.png"))

    @commands.command()
    async def like(self, ctx, member: discord.Member):
        """You like anyone?"""
        if member == ctx.author:
            return await ctx.send("Are you really that lonely? Just ping someone!")
        async with ctx.typing():
            image = await self.request(endpoint="generators/crush", params=f"?crusher={member.avatar_url_as(format='png')}&crush={ctx.author.avatar_url_as(format='png')}")
        await ctx.send(f"**{ctx.author.name}** really likes **{member.name}** to the point where he looks at his/her photo.", file=discord.File(image, filename="file.png"))


def setup(bot):
    bot.add_cog(Idiotic(bot))
