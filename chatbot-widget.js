/* ==========================================================================
   EduTrack Assistant Widget
   Injects the floating chat button + panel on every page, keeps the
   conversation in localStorage so it carries over across pages, and talks
   to the same backend the dashboard already used.
   ========================================================================== */
(function () {
    "use strict";

    const HISTORY_KEY = "eduTrack_chatHistory";
    const MAX_HISTORY = 40;

    const API_KEY = "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";
    const TARGET_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
    const API_URL = "https://corsproxy.io/?" + encodeURIComponent(TARGET_URL);

    const WELCOME_MESSAGE =
        "Hi, I'm EduBot. Ask me about navigating EduTrack, the 75% attendance policy, or SDG 4 & 10 — I'm available on every page.";

    function injectMarkup() {
        const btn = document.createElement("button");
        btn.className = "et-chat-btn";
        btn.id = "etChatBtn";
        btn.setAttribute("aria-label", "Open EduBot assistant");
        btn.innerHTML = '<i class="bi bi-chat-dots-fill"></i><span class="et-chat-dot"></span>';

        const win = document.createElement("div");
        win.className = "et-chat-window";
        win.id = "etChatWindow";
        win.innerHTML = `
            <div class="et-chat-header">
                <div class="et-chat-header-title">
                    <span class="et-status-dot"></span>
                    <span>EduBot Assistant</span>
                </div>
                <div class="et-chat-header-actions">
                    <button type="button" id="etChatClear" title="Clear conversation"><i class="bi bi-arrow-counterclockwise"></i></button>
                    <button type="button" id="etChatClose" title="Close"><i class="bi bi-x-lg"></i></button>
                </div>
            </div>
            <div class="et-chat-body" id="etChatBody"></div>
            <div class="et-chat-input-area">
                <input type="text" id="etChatInput" placeholder="Ask EduBot a question..." autocomplete="off">
                <button type="button" id="etChatSend" title="Send"><i class="bi bi-send-fill"></i></button>
            </div>
        `;

        document.body.appendChild(btn);
        document.body.appendChild(win);
    }

    function loadHistory() {
        try {
            const raw = JSON.parse(localStorage.getItem(HISTORY_KEY));
            return Array.isArray(raw) ? raw : [];
        } catch (e) {
            return [];
        }
    }

    function saveHistory(history) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
    }

    function init() {
        injectMarkup();

        const chatBtn = document.getElementById("etChatBtn");
        const chatWindow = document.getElementById("etChatWindow");
        const chatBody = document.getElementById("etChatBody");
        const chatInput = document.getElementById("etChatInput");
        const chatSend = document.getElementById("etChatSend");
        const chatClose = document.getElementById("etChatClose");
        const chatClear = document.getElementById("etChatClear");

        let history = loadHistory();

        function renderMessage(role, text) {
            const div = document.createElement("div");
            div.className = "et-msg " + (role === "user" ? "et-msg-user" : "et-msg-bot");
            div.textContent = text;
            chatBody.appendChild(div);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        function renderAll() {
            chatBody.innerHTML = "";
            if (history.length === 0) {
                renderMessage("bot", WELCOME_MESSAGE);
            } else {
                history.forEach((m) => renderMessage(m.role, m.content));
            }
        }

        function openChat() {
            chatWindow.classList.add("et-open");
            chatInput.focus();
        }

        function closeChat() {
            chatWindow.classList.remove("et-open");
        }

        chatBtn.addEventListener("click", () => {
            chatWindow.classList.contains("et-open") ? closeChat() : openChat();
        });
        chatClose.addEventListener("click", closeChat);

        chatClear.addEventListener("click", () => {
            history = [];
            saveHistory(history);
            renderAll();
        });

        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendMessage();
        });
        chatSend.addEventListener("click", sendMessage);

        async function sendMessage() {
            const text = chatInput.value.trim();
            if (!text) return;

            history.push({ role: "user", content: text });
            renderMessage("user", text);
            saveHistory(history);
            chatInput.value = "";
            chatSend.disabled = true;

            const typing = document.createElement("div");
            typing.className = "et-msg et-msg-bot et-msg-typing";
            typing.id = "etTypingIndicator";
            typing.textContent = "EduBot is typing...";
            chatBody.appendChild(typing);
            chatBody.scrollTop = chatBody.scrollHeight;

            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
                    body: JSON.stringify({
                        model: "meta/llama-3.1-8b-instruct",
                        temperature: 0.3,
                        messages: [
                            {
                                role: "system",
                                content:
                                    "You are EduBot, the assistant embedded in every page of EduTrack, a student attendance and academic risk tracker (built by Rishi Ghoricha, Roll 13) aligned with SDG 4 (Quality Education) and SDG 10 (Reduced Inequalities). " +
                                    "Help users navigate the app. Pages: Dashboard (KPIs, risk chart), Manage Students (add students, edit subject-wise attendance, generate PDF warning notices), React Pipeline (Kanban board for counseling stages), Subject Tracker (per-student subject breakdown), SDG Goals (alignment overview). " +
                                    "The current page is: " + document.title + ". Keep answers short, specific and polite.",
                            },
                            ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
                        ],
                        max_tokens: 180,
                    }),
                });

                const data = await response.json();
                const indicator = document.getElementById("etTypingIndicator");
                if (indicator) indicator.remove();

                if (data.choices && data.choices.length > 0) {
                    const reply = data.choices[0].message.content;
                    history.push({ role: "assistant", content: reply });
                    renderMessage("bot", reply);
                    saveHistory(history);
                } else {
                    renderMessage("bot", "I'm having trouble reaching the assistant service right now. Please try again in a moment.");
                }
            } catch (err) {
                const indicator = document.getElementById("etTypingIndicator");
                if (indicator) indicator.remove();
                renderMessage("bot", "Connection issue — please check your internet connection and try again.");
            } finally {
                chatSend.disabled = false;
            }
        }

        renderAll();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
