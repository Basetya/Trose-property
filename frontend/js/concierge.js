/**
 * Kusuma Properti Manager - Kusuma AI Concierge Public Portal Logic (v9.0)
 * File: frontend/js/concierge.js
 */

async function handleUserSendMessage() {
  const input = document.getElementById("user-chat-input");
  const identifierInput = document.getElementById("user-identifier");
  const message = input.value.trim();
  const identifier = identifierInput.value.trim();

  if (!message) return;

  appendChatMessage(message, "user");
  input.value = "";

  const btn = document.getElementById("btn-send-chat");
  btn.disabled = true;
  btn.innerText = "...";

  const typingBubble = appendTypingIndicator();

  try {
    const res = await gasApiCall("aiChatbot", { message: message, senderPhone: identifier }, "POST");
    typingBubble.remove();

    if (res && res.reply) {
      appendChatMessage(res.reply, "ai");
    } else {
      appendChatMessage("Maaf, Kusuma AI sedang memproses banyak pesan. Silakan hubungi kantor pengelola.", "ai");
    }
  } catch (err) {
    typingBubble.remove();
    appendChatMessage("Koneksi ke asisten terputus sejenak. Pastikan Web App API aktif.", "ai");
  } finally {
    btn.disabled = false;
    btn.innerText = "Kirim â†’";
  }
}

function sendQuickPrompt(promptText) {
  document.getElementById("user-chat-input").value = promptText;
  handleUserSendMessage();
}

function appendChatMessage(text, sender) {
  const container = document.getElementById("chat-messages");
  const wrapper = document.createElement("div");
  wrapper.className = sender === "user" ? "flex justify-end" : "flex items-start gap-3";

  if (sender === "user") {
    wrapper.innerHTML = `
      <div class="bg-rose-600 text-white p-3.5 rounded-2xl rounded-tr-none max-w-md text-sm leading-relaxed shadow-md">
        ${escapeHtml(text)}
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow">K</div>
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none max-w-lg text-sm leading-relaxed text-slate-200 shadow-md whitespace-pre-line">
        ${escapeHtml(text)}
      </div>
    `;
  }

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
  const container = document.getElementById("chat-messages");
  const wrapper = document.createElement("div");
  wrapper.id = "typing-indicator";
  wrapper.className = "flex items-start gap-3";
  wrapper.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-sm text-white shrink-0">K</div>
    <div class="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none text-xs text-slate-400 animate-pulse">
      Kusuma AI sedang mengetik...
    </div>
  `;
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
  return wrapper;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("user-chat-input");
  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleUserSendMessage();
    });
  }
});