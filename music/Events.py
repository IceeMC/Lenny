class TrackStart:
    def __init__(self, player, track):
        self.player = player
        self.track = track

class TrackEnd:
    def __init__(self, player, track):
        self.player = player
        self.track = track

class QueueConcluded:
    def __init__(self, player):
        self.player = player