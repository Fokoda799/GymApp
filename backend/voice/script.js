const socket = io();

let myId = null;
let myFirstname = null;
let myImage = null;

let peerConnections = {};
let localStream = null;
let currentRoom = null;

const config = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" }
    ],
    iceCandidatePoolSize: 10
};

const statusDiv = document.getElementById("status");

function addLog(message) {
    return;
}

window.onload = async () => {
    const roomId = new URLSearchParams(window.location.search).get("roomID");

    if (!roomId) {
        alert("Room ID missing");
        return;
    }

    const userID = new URLSearchParams(window.location.search).get("userID");
    const firstname = new URLSearchParams(window.location.search).get("username");
    const userImage = new URLSearchParams(window.location.search).get("image");

    if (!userID) {
        alert("User ID missing");
        return;
    }

    myId = userID;
    myFirstname = firstname || "Anonymous";
    myImage = userImage || null;

    socket.emit("register-user", {
        userID: myId,
        firstname: myFirstname,
        image: myImage
    });

    if (currentRoom === roomId && localStream) {
        return;
    }

    if (currentRoom && currentRoom !== roomId) {
        cleanupConnections();
    }

    try {
        if (!localStream) {
            localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            displayAudioElement(
                "local",
                localStream,
                true,
                myFirstname,
                myImage
            );
        }

        currentRoom = roomId;

        socket.emit("join-room", roomId);

        statusDiv.innerText = "Connected";
    } catch (e) {
        alert("Microphone error");
    }
};

function displayAudioElement(id, stream, isLocal, firstname, image = null) {
    let container = document.getElementById(`container-${id}`);

    if (!container) {
        const avatar = image && image !== "null" && image !== ""
            ? `<img src="${image}" class="w-full h-full object-cover rounded-full" />`
            : `<span class="text-black font-extrabold text-3xl">
                ${(firstname || 'U').charAt(0).toUpperCase()}
              </span>`;

        const html = `
            <div id="container-${id}" class="relative w-full h-full flex flex-col items-center justify-center">

                <div class="absolute inset-0 flex flex-col items-center justify-center gap-10">

                    <div class="flex flex-col items-center">
                        <div id="avatar-${id}"
                             class="relative w-32 h-32 rounded-full overflow-hidden border-[4px] border-[#A3FF12] shadow-[0_0_35px_rgba(163,255,18,0.45)] bg-black flex items-center justify-center transition-all duration-150">
                            ${avatar}
                        </div>

                        <div class="mt-3 text-white text-2xl font-bold tracking-wide">
                            ${isLocal ? 'Vous' : firstname}
                        </div>

                        <div id="status-${id}"
                             class="mt-2 px-4 py-1 rounded-full bg-[#A3FF12]/15 border border-[#A3FF12]/40 text-[#A3FF12] text-sm font-semibold">
                            Connecté
                        </div>
                    </div>

                    <div class="w-[220px] glass-light p-2 flex items-center gap-4 -translate-y-10">
                        <button id="mic-btn-${id}"
                                class="w-8 h-8 rounded-full bg-[#A3FF12] text-black text-xl font-bold flex items-center justify-center shadow-[0_0_20px_rgba(163,255,18,0.45)] transition-all">
                            ${isLocal ? '🎤' : '🔊'}
                        </button>

                        <input id="volume-${id}"
                               type="range"
                               min="0"
                               max="100"
                               value="100"
                               class="flex-1 accent-[#A3FF12]"
                               ${isLocal ? 'disabled' : ''}>

                        <div id="speaking-${id}"
                             class="w-3 h-3 rounded-full bg-gray-500 transition-all duration-150"></div>
                    </div>

                    <audio id="${id}" autoplay ${isLocal ? 'muted' : ''}></audio>
                </div>
            </div>
        `;

        document.getElementById("audios").innerHTML += html;

        container = document.getElementById(`container-${id}`);

        const audio = document.getElementById(id);
        const micBtn = document.getElementById(`mic-btn-${id}`);
        const volume = document.getElementById(`volume-${id}`);
        const status = document.getElementById(`status-${id}`);
        const speaking = document.getElementById(`speaking-${id}`);
        const avatarBox = document.getElementById(`avatar-${id}`);

        audio.srcObject = stream;

        if (isLocal) {
            micBtn.onclick = () => {
                const tracks = localStream.getAudioTracks();

                const enabled = !tracks[0].enabled;

                tracks[0].enabled = enabled;

                if (enabled) {
                    micBtn.className =
                        "w-12 h-12 rounded-full bg-[#A3FF12] text-black text-xl font-bold flex items-center justify-center shadow-[0_0_20px_rgba(163,255,18,0.45)]";

                    status.innerText = "Connecté";
                } else {
                    micBtn.className =
                        "w-12 h-12 rounded-full bg-red-500 text-white text-xl font-bold flex items-center justify-center";

                    status.innerText = "Micro coupé";
                }
            };
        }

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 256;

        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function detectVoice() {
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;

            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }

            const average = sum / bufferLength;

            if (average > 18) {
                speaking.className =
                    "w-3 h-3 rounded-full bg-[#A3FF12] shadow-[0_0_12px_rgba(163,255,18,0.9)]";

                avatarBox.classList.add("animate-pulse");

                avatarBox.style.transform = "scale(1.08)";

                avatarBox.style.boxShadow =
                    "0 0 45px rgba(163,255,18,0.95)";

                status.innerText = "Parle...";
            } else {
                speaking.className =
                    "w-3 h-3 rounded-full bg-gray-500";

                avatarBox.classList.remove("animate-pulse");

                avatarBox.style.transform = "scale(1)";

                avatarBox.style.boxShadow =
                    "0 0 35px rgba(163,255,18,0.45)";

                status.innerText = "Connecté";
            }

            requestAnimationFrame(detectVoice);
        }

        detectVoice();

        if (!isLocal) {
            volume.oninput = function () {
                audio.volume = this.value / 100;
            };
        }
    } else {
        const audio = document.getElementById(id);

        if (audio) {
            audio.srcObject = stream;
        }
    }
}

socket.on("room-users", (users) => {
    users.forEach(user => {
        const userId = user.userID;
        const userFirstname = user.firstname;
        const userImage = user.image;

        if (userId !== myId) {
            initiateCall(userId, userFirstname, userImage);
        }
    });
});

socket.on("user-joined", (userData) => {
    statusDiv.innerText = `${userData.firstname} joined`;
});

socket.on("offer", async (data) => {
    const { offer, from, firstname, image } = data;

    try {
        const peerConnection = createPeerConnection(
            from,
            firstname,
            image
        );

        await peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
        );

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        const answer = await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(answer);

        socket.emit("answer", {
            answer: peerConnection.localDescription,
            to: from,
            firstname: myFirstname,
            image: myImage
        });
    } catch (e) {
    }
});

socket.on("answer", async (data) => {
    const { answer, from } = data;

    const peerConnection = peerConnections[from];

    if (peerConnection) {
        await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
        );
    }
});

socket.on("ice-candidate", async (data) => {
    const { candidate, from } = data;

    const peerConnection = peerConnections[from];

    if (peerConnection) {
        try {
            await peerConnection.addIceCandidate(
                new RTCIceCandidate(candidate)
            );
        } catch (e) {
        }
    }
});

socket.on("user-left", (userData) => {
    const userID = userData.userID || userData;

    if (peerConnections[userID]) {
        peerConnections[userID].close();

        delete peerConnections[userID];
    }

    const audioContainer = document.getElementById(`container-${userID}`);

    if (audioContainer) {
        audioContainer.remove();
    }
});

function initiateCall(userID, firstname, image) {
    const peerConnection = createPeerConnection(
        userID,
        firstname,
        image
    );

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.createOffer()
        .then(offer => {
            return peerConnection.setLocalDescription(offer);
        })
        .then(() => {
            socket.emit("offer", {
                offer: peerConnection.localDescription,
                to: userID,
                firstname: myFirstname,
                image: myImage
            });
        });
}

function createPeerConnection(userID, firstname, image) {
    if (peerConnections[userID]) {
        peerConnections[userID].close();
    }

    const peerConnection = new RTCPeerConnection(config);

    peerConnections[userID] = peerConnection;

    peerConnection.remoteFirstname = firstname;
    peerConnection.remoteImage = image;

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("ice-candidate", {
                candidate: event.candidate,
                to: userID
            });
        }
    };

    peerConnection.ontrack = (event) => {
        displayAudioElement(
            userID,
            event.streams[0],
            false,
            firstname,
            image
        );
    };

    return peerConnection;
}

function cleanupConnections() {
    for (const userID in peerConnections) {
        peerConnections[userID].close();

        const audioContainer =
            document.getElementById(`container-${userID}`);

        if (audioContainer) {
            audioContainer.remove();
        }
    }

    peerConnections = {};
}

socket.on("connect", () => {
    if (myId) {
        socket.emit("register-user", {
            userID: myId,
            firstname: myFirstname,
            image: myImage
        });
    }
});

socket.on("disconnect", () => {
    cleanupConnections();

    currentRoom = null;
});