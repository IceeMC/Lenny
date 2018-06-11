

class AudioTrack:
    def make(self, track, requester):
        try:
            self.track = track["track"]
            self.id = track["info"]["identifier"]
            self.seekable = track["info"]["isSeekable"]
            self.author = track["info"]["author"]
            self.length = track["info"]["length"]
            self.stream = track["info"]["isStream"]
            self.title = track["info"]["title"]
            self.url = track["info"]["uri"]
            self.requester = requester

            return self
        except KeyError:
            raise Exception("Invalid track passed: {}".format(str(track)))
