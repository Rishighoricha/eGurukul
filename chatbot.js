const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('userInput');

// Tumhari asli NVIDIA API key
const API_KEY = "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"; 

const TARGET_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const API_URL = "https://corsproxy.io/?" + encodeURIComponent(TARGET_URL);

if (userInput) {
    userInput.addEventListener("keydown", function(e) {
        if (e.code === "Enter") sendMessage();
    });
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Add User Message to UI
    chatWindow.innerHTML += `
        <div class="text-end mb-2">
            <span class="bg-primary text-white p-2 rounded d-inline-block shadow-sm">${text}</span>
        </div>`;
    userInput.value = '';
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Show typing indicator
    const typingId = 'typing-' + Date.now();
    chatWindow.innerHTML += `
        <div id="${typingId}" class="text-start mb-2 w-75">
            <span class="bg-light border text-muted p-2 rounded d-inline-block shadow-sm">Thinking with Llama 3.1 (Fast)...</span>
        </div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                // 8B model use kiya hai taaki timeout na ho aur speed fast rahe
                model: "meta/llama-3.1-8b-instruct",
                temperature: 0.2,
                messages: [
                    {
                        role: "system",
                        content: "You are an AI assistant for a Smart Attendance & Academic Tracker built by Rishi Ghoricha (Roll No. 13) under SDG 4 (Quality Education) and SDG 10 (Reduced Inequalities). ONLY answer questions about student attendance, academic tracking, risk detection, and interventions."
                    },
                    { role: "user", content: text }
                ],
                max_tokens: 256
            })
        });

        const data = await response.json();
        
        // Remove typing indicator
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        if (data.choices && data.choices.length > 0) {
            const aiMessage = data.choices[0].message.content;
            chatWindow.innerHTML += `
                <div class="text-start mb-2 w-75">
                    <span class="bg-white border text-dark p-2 rounded d-inline-block shadow-sm">${aiMessage}</span>
                </div>`;
        } else {
            throw new Error(data.error?.message || "API error occurred");
        }

    } catch (error) {
        console.error("NVIDIA API Error:", error);
        
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        chatWindow.innerHTML += `
            <div class="text-start mb-2 w-75">
                <span class="bg-white border text-danger p-2 rounded d-inline-block shadow-sm">
                    <strong>Timeout/Error:</strong> Proxy connection slow hai. Ek baar page refresh karke dobara try karein.
                </span>
            </div>`;
    }

    chatWindow.scrollTop = chatWindow.scrollHeight;
}