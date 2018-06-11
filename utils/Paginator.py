import discord
import asyncio
import re


class Paginator:
    """
    A class that implements pagination to the bot.
    Note: pages are based of a 1 based index not 0 based index.

    Parameters
    ------------
    ctx: Context
        The command context.
    pages: List[discord.Embed()]
        A list of embeds to paginate.
    color: int
        The color of the embed.
        This defaults to white (0xffffff)
    """

    def __init__(self, ctx, pages=[], color=0xffffff):
        self.ctx = ctx
        self.bot = ctx.bot
        self.pages = pages
        self.reactions = ["⏪", "◀", "⏹", "▶", "⏩"]
        self.message = None
        self.enabled = False
        self.current = 0
        self.color = color

    async def react(self):
        for reaction in self.reactions:
            if len(self.pages) < 4 and reaction in "⏪⏩":
                continue
            try:
                await self.message.add_reaction(reaction)
            except discord.Forbidden:
                pass

    def is_valid_page(self, page: int):
        if page == -1 or page == len(self.pages):
            return False
        return True

    async def switch_page(self, page: int):
        if not self.is_valid_page(page):
            return  # Wait for a valid page
        self.current = page

        if self.enabled:
            to_switch_to = self.pages[page]
            to_switch_to.color = self.color
            to_switch_to.set_footer(text=f"Showing page {page + 1} out of {len(self.pages)}")
            await self.message.edit(embed=to_switch_to)
        else:
            self.enabled = True
            self.pages[0].color = self.color
            self.pages[0].set_footer(text=f"Showing page {page + 1} out of {len(self.pages)}")
            self.message = await self.ctx.send(embed=self.pages[0])
            await self.react()

    def check(self, reaction, user):
        return reaction.message.id == self.message.id and user.id == self.ctx.author.id and reaction.emoji in self.reactions

    async def start(self):
        if self.enabled is False:
            await self.switch_page(0)
        while self.enabled:
            try:
                reaction, user = await self.bot.wait_for("reaction_add", check=self.check, timeout=30)
            except asyncio.TimeoutError:
                await self.end()
            else:
                try:
                    await self.message.remove_reaction(reaction, user)
                except discord.Forbidden:
                    pass
                if reaction.emoji == "◀":
                    await self.backward()
                if reaction.emoji == "▶":
                    await self.forward()
                if reaction.emoji == "⏹":
                    await self.end()
                if reaction.emoji == "⏪":
                    await self.first_page()
                if reaction.emoji == "⏩":
                    await self.last_page()

    async def first_page(self):
        await self.switch_page(0)

    async def last_page(self):
        await self.switch_page(len(self.pages) - 1)

    async def forward(self):
        await self.switch_page(self.current + 1)

    async def backward(self):
        await self.switch_page(self.current - 1)

    async def end(self):
        self.enabled = False
        try:
            await self.message.clear_reactions()
        except Exception:
            pass
