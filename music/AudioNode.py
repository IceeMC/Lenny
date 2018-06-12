import websockets
import asyncio
import logging
import json
from pyee import EventEmitter
from .Events import TrackEnd


class AudioNode:
    def __init__(self, manager, shards, host=None, password=None, port=None):
        self.stats = {}
        self.ee = EventEmitter()
        self._manager = manager
        self.shards = shards
        self.ready = False
        self.ws = None
        self.host = host
        self.password = password
        self.port = port
        self.stats = None

    def __str__(self):
        return f"""
A lavalink node class for the lavalink manager.
Shards: {self.shards}
Host: {self.host}
Port: {self.port}"""

    async def _wait_for_ws_message(self):
        while self.ws.open:
            try:
                data = json.loads(await self.ws.recv())
            except websockets.ConnectionClosed:
                return self._manager.bot.loop.create_task(self.launch())

            if data["op"] == "playerUpdate":
                player = self._manager.players.get(int(data["guildId"]))
                if player:
                    player.state["timestamp"] = data["state"]["time"]
                    player.state["position"] = data["state"]["position"]
            elif data["op"] == "stats":
                del data["op"]
                self.stats = data
            elif data["op"] == "event":
                player = self._manager.players.get(int(data["guildId"]))
                if data["type"] == "TrackEndEvent":
                    if player:
                        self.ee.emit("track_end", TrackEnd(player, data["track"], data["reason"]))
            else:
                return print(f"[AudioNode] Received message with no op code {str(data)}")

    def _headers(self):
        return {
            "Authorization": self.password,
            "Num-Shards": self.shards,
            "User-Id": self._manager.bot.user.id
        }

    async def launch(self):
        try:
            self.ws = await websockets.connect(f"ws://{self.host}:{self.port}", extra_headers=self._headers())
            if self.ws.open:
                print(f"An AudioNode has connected with host: {self.host} and port: {self.port}.")
                self._manager.bot.loop.create_task(self._wait_for_ws_message())
                self.ready = True
        except Exception:
            pass

    async def send(self, **data):
        if self.ws.open:
            await self.ws.send(json.dumps(data))
