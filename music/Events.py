class TrackStart:
    def __init__(self, player, track):
        self.player = player
        self.track = track


class TrackEnd:
    def __init__(self, player, track, reason):
        self.player = player
        self.track = track
        self.reason = reason


class QueueConcluded:
    def __init__(self, player):
        self.player = player
