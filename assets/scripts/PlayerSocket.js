class PlayerSocket {

    constructor() {
        this.ws = null;
        this.id = null;
        this.elapsedInterval = null;
        this.elapsedTime = 0;
        this.barPaused = false;
        this.keepAliveInterval = null;
        this.barInterval = null;
        this.alreadyInvalid = false;
    }

    send(payload) {
        const payloadString = JSON.stringify(payload);
        if (this.ws.readyState === WebSocket.OPEN) return this.ws.send(payloadString);
    }

    connect(id) {
        this.id = id;
        if (this.ws) {
            console.log("[WS] There is already an open connection.");
            this.send({ id: this.id });
        } else {
            this.ws = new WebSocket("wss://remixbot.ml/");
            this.ws.onopen = this.onOpen.bind(this);
            this.ws.onmessage = this.onMessage.bind(this);
            this.ws.onclose = this.onClose.bind(this);
        }
    }

    onOpen() {
        console.log("[WS] Connection opened.");
        this.send({ id: this.id });
        this.keepAlive();
    }

    onMessage(packet) {
        const { type, data } = JSON.parse(packet.data);
        console.log(`[WS] Message: ${packet.data}`);
        if (type === "NO_GUILD") return this.noGuild();
        if (type === "NO_PLAYER" || type === "PLAYER_QUEUE_FINISHED") return this.notPlayingSong();
        if (type === "VOLUME_CHANGE") return this.updateVolume(data);
        if (type === "PLAYER_INFO") return this.playerInfo(data);
        if (type === "PLAYER_TRACK_START" || type === "PLAYER_TRACK_REPLACED") return this.playingSong(data);
        if (type === "PLAYER_UPDATE") return this.playerUpdate(data);
        if (type === "PLAYER_PAUSE" || type === "PLAYER_RESUME") return this.barPaused = !this.barPaused;
    }

    onClose() {
        console.log("[WS] Closed reopening a session.");
        this.connect(this.id);
    }

    noGuild() {
        const playerDiv = document.getElementById("playerDiv");
        const invalidGuild = document.createElement("div");
        invalidGuild.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <h4 class="alert-heading">Oops!</h4>
            <p>
                You provided an <strong>invalid guild id</strong>. Please check the ID and try again!<br>
                This will disappear in 10 seconds.
            </p>
        </div>
        `;
        const overlay = document.getElementById("playerDivOverlay");
        if (overlay && playerDiv)  {
            if (this.alreadyInvalid) return;
            this.alreadyInvalid = true;
            overlay.remove();
            playerDiv.appendChild(invalidGuild);
            playerDiv.appendChild(overlay);
            setTimeout(() => {
                this.alreadyInvalid = false;
                playerDiv.removeChild(invalidGuild);
            }, 10000);
        }
    }

    playingSong(data) {
        if (!data) return;
        const playerDiv = document.getElementById("playerDiv");
        playerDiv.innerHTML = `
        <strong style="color: #334049;">${data.currentTrack.title}</strong>
        <p id="time">
            Elapsed time: ${this.convertTime(this.elapsedTime || 0)}
            Duration: ${this.convertTime(data.currentTrack.msLength)}
            Current Volume: ${data.volume}
        </p>
        <div class="progress">
            <div class="progress-bar" id="progress" style="width: 0%; background-color: #E84536;"role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        `;
        this.elapsedInterval = setInterval(() => {
            this.elapsedTime += 1000;
            const elapsed = document.getElementById("time");
            if (elapsed) elapsed.innerText = `
            Elapsed time: ${this.convertTime(this.elapsedTime || 0)}
            Duration: ${this.convertTime(data.currentTrack.msLength)}
            Current Volume: ${data.volume}
            `;
        }, 1000);
    }

    updateVolume(data) {
        const elapsed = document.getElementById("time");
        if (elapsed) elapsed.innerText = `
        Elapsed time: ${this.convertTime(this.elapsedTime || 0)}
        Duration: ${this.convertTime(data.currentTrack.msLength)}
        Current Volume: ${data.newVolume}
        `;
    }

    playerInfo(data) {
        this.elapsedTime = data.position || 0;
        if (!data.currentTrack) return this.notPlayingSong();
        const playerDiv = document.getElementById("playerDiv");
        playerDiv.innerHTML = `
        <strong style="color: #334049;">${data.currentTrack.title}</strong>
        <p id="time">
            Elapsed time: ${this.convertTime(this.elapsedTime)}
            Duration: ${this.convertTime(data.currentTrack.msLength)}
        </p>
        <div class="progress">
            <div class="progress-bar" id="progress" style="width: 0%; background-color: #E84536;"role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        `;
        if (data.position && data.position > 0) this.playerUpdate(data);
        this.elapsedInterval = setInterval(() => {
            this.elapsedTime += 1000;
            const elapsed = document.getElementById("time");
            if (elapsed) elapsed.innerText = `
            Elapsed time: ${this.convertTime(this.elapsedTime)}
            Duration: ${this.convertTime(data.currentTrack.msLength)}
            `;
        }, 1000);
    }

    notPlayingSong() {
        const playerDiv = document.getElementById("playerDiv");
        playerDiv.innerHTML = `
        <center>
            <p>Nothing is currently playing. Queue up a song first!</p>
        </center>
        `;
        const overlay = document.getElementById("playerDivOverlay");
        if (overlay) overlay.remove();
        this.destroy();
    }

    startProgressBar(data) {
        if (!this.barInterval) this.barInterval = setTimeout(() => {
            const bar = document.getElementById("progress");
            if (bar) {
                const progress = Math.ceil(data.position / data.currentTrack.msLength * 100);
                bar.style.backgroundColor = "#E84536";
                bar.style.width = `${progress}%`;
                bar.setAttribute("aria-valuenow", progress);
            } else {
                clearInterval(this.barInterval);
                this.barInterval = null;
            }
        });
    }

    destroy() {
        this.elapsedTime = 0;
        this.barPaused = false;
        this.alreadyInvalid = false;
        clearInterval(this.elapsedInterval);
        const bar = document.getElementById("progress");
        if (bar) bar.remove(); 
    }

    keepAlive() {
        this.keepAliveInterval = setInterval(() => {
            this.send({ alive: true });
        }, 20000);
    }

    convertTime(ms) {
        const seconds = parseInt((ms / 1000) % 60);
        const minutes = parseInt((ms / (1000 * 60)) % 60);
        const hours = parseInt((ms / (1000 * 60 * 60)) % 24);
        return `${hours === 0 ? "00:" : `${this.pad(hours, 2)}:`}${minutes === 0 ? "00:" : `${this.pad(minutes, 2)}:`}${this.pad(seconds, 2)}`;
    }

    pad(num, len) {
        let str = `${num}`;
        while (str.length < len) {
            str = `0${str}`;
        }
        return str;
    }

}