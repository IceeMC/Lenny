class PlayerSocket {

    constructor() {
        this.ws = null;
        this.id = null;
        this.elapsedInterval = null;
        this.elapsedTime = 0;
        this.barPaused = false;
        this.keepAliveInterval = null;
        this.barInterval = null;
        this.barElapsed = 0;
        this.alreadyInvalid = false;
        this.noIdPresent = false;
        this.trackLength = 0;
        this.jumbotronLead = document.getElementById("jumboTronLead");
    }

    send(payload) {
        const payloadString = JSON.stringify(payload);
        if (this.ws.readyState === WebSocket.OPEN) return this.ws.send(payloadString);
    }

    connect(id) {
        this.id = id;
        if (this.ws) {
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
        if (type === "NO_PLAYER" || type === "PLAYER_QUEUE_FINISHED") return this.destroy();
        if (type === "VOLUME_CHANGE") return this.updateVolume(data);
        if (type === "PLAYER_INFO") return this.playerInfo(data);
        if (type === "PLAYER_TRACK_START" || type === "PLAYER_TRACK_REPLACED") return this.playingSong(data);
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
        if (!data.currentTrack) return this.destroy();
        this.trackLength = data.currentTrack.msLength;
        const playerDiv = document.getElementById("playerDiv");
        if (this.jumbotronLead) this.jumbotronLead.innerText = `Music player info for: <strong>${data.guild.name}</strong>`;
        playerDiv.innerHTML = `
        <center><strong>${data.currentTrack.title}</strong></center>
        <p id="time">
            Elapsed time: ${this.convertTime(data.position ? data.position : this.elapsedTime)}
            Duration: ${this.convertTime(data.currentTrack.msLength)}
            Current Volume: ${data.volume}
        </p>
        <div class="progress">
            <div class="progress-bar" id="songProgress" style="width: 0%; background-color: #E84536;" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        `;
        this.elapsedInterval = setInterval(() => {
            this.elapsedTime += 1000;
            const elapsed = document.getElementById("time");
            if (elapsed) elapsed.innerText = `
            Elapsed time: ${this.convertTime(data.position ? data.position : this.elapsedTime)}
            Duration: ${this.convertTime(data.currentTrack.msLength)}
            Current Volume: ${data.volume}
            `;
        }, 1000);
        this.startProgressBar(data.position ? data.position : this.elapsedTime);
    }

    updateVolume(data) {
        const elapsed = document.getElementById("time");
        if (elapsed) elapsed.innerText = `
        Elapsed time: ${this.convertTime(data.position ? data.position : this.elapsedTime)}
        Duration: ${this.convertTime(data.currentTrack.msLength)}
        Current Volume: ${data.newVolume}
        `;
    }

    playerInfo(data) {
        this.elapsedTime = data.position || 0;
        if (!data.currentTrack) return this.destroy();
        const playerDiv = document.getElementById("playerDiv");
        if (this.jumbotronLead) this.jumbotronLead.innerText = `Music player info for: <strong>${data.guild.name}</strong>`;
        playerDiv.innerHTML = `
        <strong style="color: #334049;">${data.currentTrack.title}</strong>
        <p id="time">
            Elapsed time: ${this.convertTime(this.elapsedTime)}
            Duration: ${this.convertTime(data.currentTrack.msLength)}
        </p>
        <div class="progress">
            <div class="progress-bar" id="songProgress" style="width: 0%; background-color: #E84536;" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
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
        this.startProgressBar(data.position ? data.position : this.elapsedTime);
    }

    startProgressBar(pos) {
        this.barElapsed = pos;
        if (!this.barInterval) this.barInterval = setInterval(() => {
            this.barElapsed += 1000;
            const bar = document.getElementById("songProgress");
            if (bar) {
                const progress = Math.ceil(this.barElapsed / pos * 100);
                bar.style.backgroundColor = "#E84536";
                bar.style.width = `${progress}%`;
                bar.setAttribute("aria-valuenow", progress);
            } else {
                clearInterval(this.barInterval);
                this.barInterval = null;
                this.barElapsed = 0;
            }
        }, 1000);
    }

    destroy() {
        // Only remove if overlay is present
        const overlay = document.getElementById("playerDivOverlay");
        if (overlay) overlay.remove();
        // Clear intervals
        clearInterval(this.barInterval);
        clearInterval(this.elapsedInterval);
        // Reset props
        this.id = null;
        this.elapsedInterval = null;
        this.elapsedTime = 0;
        this.barPaused = false;
        this.keepAliveInterval = null;
        this.barInterval = null;
        this.barElapsed = 0;
        this.alreadyInvalid = false;
        this.noIdPresent = false;
        this.trackLength = 0;
        // Try and remove progress bar
        const bar = document.getElementById("songProgress");
        if (bar) bar.remove();
        // Try and remove time and volume
        const elapsed = document.getElementById("time");
        if (elapsed) elapsed.remove();
        // Set player div inner HTML
        const playerDiv = document.getElementById("playerDiv");
        playerDiv.innerHTML = `
        <center>
            <p>Nothing is currently playing. Queue up a song first!</p>
        </center>
        `;
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

    noGuildIdPresent() {
        const playerDiv = document.getElementById("playerDiv");
        const invalidGuild = document.createElement("div");
        invalidGuild.innerHTML = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <h4 class="alert-heading">Oops!</h4>
            <p>
                You need to provide a <strong>guild id</strong>. Please enter one and try again!<br>
                This will disappear in 10 seconds.
            </p>
        </div>
        `;
        const overlay = document.getElementById("playerDivOverlay");
        if (overlay && playerDiv)  {
            if (this.noIdPresent) return;
            this.noIdPresent = true;
            overlay.remove();
            playerDiv.appendChild(invalidGuild);
            playerDiv.appendChild(overlay);
            setTimeout(() => {
                this.noIdPresent = false;
                playerDiv.removeChild(invalidGuild);
            }, 10000);
        }
    }

}

const socket = new PlayerSocket();
const guildIdBox = document.getElementById("guildId");
const submitButton = document.getElementById("submit");
const clickEvent = () => {
    console.log("[WS] Opening a connection to wss://remixbot.ml/");
    if (guildIdBox instanceof HTMLInputElement) {
        if (!guildIdBox.value) return socket.noGuildIdPresent();
        socket.connect(guildIdBox.value);
    }
};
const keyDown = event => {
    const keyCode = event.keyCode ? event.keyCode : event.which;
    if (keyCode === 13 && !event.shiftKey) submitButton.click();
}
submitButton.addEventListener("click", clickEvent.bind(this));
guildIdBox.addEventListener("keydown", keyDown.bind(this));