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

    def __init__(self, ctx, pages=[], color=0xffffff, footer=True):
        self.ctx = ctx
        self.bot = ctx.bot
        self.pages = pages
        self.color = color
        self.footer = footer
        self.reactions = ["⏪", "◀", "⏹", "▶", "⏩", "❔"]
        self.message = None
        self.enabled = False
        self.current = 0

    async def react(self):
        for reaction in self.reactions:
            if len(self.pages) < 2 and reaction in "⏪⏩":
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
            if self.footer:
                to_switch_to.set_footer(text=f"Showing page {page + 1} out of {len(self.pages)}")
            await self.message.edit(embed=to_switch_to)
        else:
            self.enabled = True
            self.pages[0].color = self.color
            if self.footer:
                self.pages[0].set_footer(text=f"Showing page {page + 1} out of {len(self.pages)}")
            self.message = await self.ctx.send(embed=self.pages[0])
            await self.react()

    def check(self, r, u):
        return r.message.id == self.message.id and u.id == self.ctx.author.id and r.emoji in self.reactions

    async def start(self):
        if not self.enabled:
            await self.switch_page(0)
        while self.enabled:
            reaction, user = await self.bot.wait_for("reaction_add", check=self.check)
            try:
                await self.message.remove_reaction(reaction.emoji, user)
            except discord.Forbidden:
                continue
            else:
                if reaction.emoji == "⏪":
                    await self.first_page()
                if reaction.emoji == "◀":
                    await self.backward()
                if reaction.emoji == "⏹":
                    await self.end()
                if reaction.emoji == "▶":
                    await self.forward()
                if reaction.emoji == "⏩":
                    await self.last_page()
                if reaction.emoji == "❔":
                    await self.show_help()

    async def first_page(self):
        await self.switch_page(0)

    async def last_page(self):
        await self.switch_page(len(self.pages) - 1)

    async def forward(self):
        await self.switch_page(self.current + 1)

    async def backward(self):
        await self.switch_page(self.current - 1)

    async def show_help(self):
        help_list = [
            "What do these buttons do?\n",
            "⏪ - Takes you to the first page.",
            "◀ - Takes you back a page.",
            "⏹ - Stops the paginator.",
            "▶ - Takes you forward a page.",
            "⏩ - Takes you to the last page.",
            "❔ - Shows this page."
        ]
        help_embed = discord.Embed(color=self.color)
        help_embed.add_field(name="Paginator Help", value="\n".join(help_list))
        help_embed.set_footer(text=f"Reverting back to the last page in 10 seconds.")
        await self.message.edit(embed=help_embed)
        await asyncio.sleep(10)
        await self.switch_page(self.current)

    async def end(self):
        self.enabled = False
        try:
            await self.message.delete()
        except discord.NotFound:
            pass
