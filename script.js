let API_KEY = "";

const input = document.getElementById("user-input");
const chat = document.getElementById("chat-box");
const sendBtn = document.querySelector(".input-area button");

function getTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function scrollBottom() {
    chat.scrollTop = chat.scrollHeight;
}

function addUserMessage(text) {

    chat.innerHTML += `
        <div class="user">
            ${text}
            <div class="time">${getTime()}</div>
        </div>
    `;

    scrollBottom();
}

function addBotMessage(text) {

    if (window.marked) {
        text = marked.parse(text);
    }

    chat.innerHTML += `
        <div class="bot">
            ${text}
            <div class="time">${getTime()}</div>
        </div>
    `;

    scrollBottom();
}

async function sendMessage() {
if (API_KEY === "") {
    alert("Please enter your Gemini API Key first.");
    return;
}
    const text = input.value.trim();

    if (!text) return;

    addUserMessage(text);

    input.value = "";

    sendBtn.disabled = true;

    const loading = document.createElement("div");

    loading.className = "bot";

    loading.id = "loading";

    loading.innerHTML = `
        🪐 Pluto is thinking...
        <div class="time">${getTime()}</div>
    `;

    chat.appendChild(loading);

    scrollBottom();

    try {

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: text
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        loading.remove();

        if (data.error) {

            addBotMessage("❌ " + data.error.message);

            sendBtn.disabled = false;

            return;
        }

        const reply =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No response received.";

        addBotMessage(reply);

    }
    catch (err) {

        loading.remove();

        addBotMessage("⚠️ Connection failed.");

        console.error(err);

    }

    sendBtn.disabled = false;
}

input.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        sendMessage();

    }

});
document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("apiModal");
    const startBtn = document.getElementById("startBtn");

    if (!modal || !startBtn) {
        console.error("API Modal elements not found.");
        return;
    }

    startBtn.addEventListener("click", async () => {

        const key = document.getElementById("apiInput").value.trim();

        if (!key) {
            alert("Please enter your Gemini API Key.");
            return;
        }

        startBtn.innerText = "Checking...";
        startBtn.disabled = true;

        try {

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: "Hello"
                                    }
                                ]
                            }
                        ]
                    })
                }
            );

            const data = await response.json();

            if (data.error) {
                alert("❌ Invalid API Key");
                startBtn.innerText = "Start Chatting";
                startBtn.disabled = false;
                return;
            }

            API_KEY = key;

            modal.style.display = "none";

        } catch (err) {

            console.error(err);

            alert("Unable to verify API Key.");

            startBtn.innerText = "Start Chatting";
            startBtn.disabled = false;
        }

    });

});