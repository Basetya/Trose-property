/**
 * Kusuma Properti - Landing Page & Chatbot Interactive Controller
 * File: js/landing.js
 * Version: v152.0.0 (Synced Kusuma AI & Fast JSONP Concierge)
 */

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const chatPopup = document.getElementById("chat-popup");
  const floatingBtnAi = document.getElementById("floating-btn-ai");
  const floatingBtnWa = document.getElementById("floating-btn-wa");
  const widgetBtnWa = document.getElementById("widget-btn-wa");
  const widgetBtnClose = document.getElementById("widget-btn-close");
  const widgetMessages = document.getElementById("widget-messages");
  const widgetInput = document.getElementById("widget-input");
  const btnWidgetSend = document.getElementById("btn-widget-send");

  // Quick Chips
  const chipStudio = document.getElementById("quick-prompt-studio");
  const chipParkir = document.getElementById("quick-prompt-parkir");
  const chip2br = document.getElementById("quick-prompt-2br");

  // Toggle Popup
  function openChat() {
    if (chatPopup) {
      chatPopup.classList.remove("hidden");
      if (widgetInput) widgetInput.focus();
    }
  }

  function closeChat() {
    if (chatPopup) {
      chatPopup.classList.add("hidden");
    }
  }

  if (floatingBtnAi) floatingBtnAi.addEventListener("click", openChat);
  if (widgetBtnClose) widgetBtnClose.addEventListener("click", closeChat);

  // WhatsApp Redirect Handler
  function openWhatsApp(customText) {
    const defaultText = customText || "Halo Kusuma Properti, saya ingin bertanya seputar unit sewa Kalibata City.";
    const waUrl = `https://wa.me/${CONFIG.OFFICIAL_WA_NUMBER}?text=${encodeURIComponent(defaultText)}`;
    window.open(waUrl, "_blank");
  }

  if (floatingBtnWa) floatingBtnWa.addEventListener("click", () => openWhatsApp());
  if (widgetBtnWa) widgetBtnWa.addEventListener("click", () => openWhatsApp());

  // Message Renderer
  function appendChatMessage(sender, text) {
    if (!widgetMessages) return;

    const msgContainer = document.createElement("div");
    if (sender === "user") {
      msgContainer.className = "flex items-start justify-end gap-2.5";
      msgContainer.innerHTML = `
        <div class="bg-[#8C5835] text-white p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed shadow-sm max-w-[85%]">
          ${escapeHtml(text)}
        </div>
      `;
    } else {
      msgContainer.className = "flex items-start gap-2.5";
      msgContainer.innerHTML = `
        <img src="img/kusuma-avatar.png" alt="Kusuma AI" class="w-7 h-7 rounded-full object-cover border border-white shrink-0 shadow-sm">
        <div class="bg-white border border-[#E8DFD3] p-3 rounded-2xl rounded-tl-none text-[#2C2C2A] text-xs leading-relaxed shadow-sm max-w-[85%]">
          ${formatMarkdownToHtml(text)}
        </div>
      `;
    }

    widgetMessages.appendChild(msgContainer);
    widgetMessages.scrollTop = widgetMessages.scrollHeight;
  }

  // Typing Indicator
  function showTypingIndicator() {
    if (!widgetMessages) return;
    const typingElem = document.createElement("div");
    typingElem.id = "chat-typing-indicator";
    typingElem.className = "flex items-start gap-2.5";
    typingElem.innerHTML = `
      <img src="img/kusuma-avatar.png" alt="Kusuma AI" class="w-7 h-7 rounded-full object-cover border border-white shrink-0 shadow-sm">
      <div class="bg-white border border-[#E8DFD3] p-3 rounded-2xl rounded-tl-none text-[#737370] text-xs shadow-sm flex items-center gap-1">
        <span class="w-1.5 h-1.5 bg-[#737370] rounded-full animate-bounce"></span>
        <span class="w-1.5 h-1.5 bg-[#737370] rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span class="w-1.5 h-1.5 bg-[#737370] rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
    `;
    widgetMessages.appendChild(typingElem);
    widgetMessages.scrollTop = widgetMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const typing = document.getElementById("chat-typing-indicator");
    if (typing) typing.remove();
  }

  // AI Backend Dispatcher (JSONP Zero-CORS)
  function sendChatQuery(messageText) {
    if (!messageText || messageText.trim() === "") return;

    appendChatMessage("user", messageText);
    if (widgetInput) widgetInput.value = "";
    if (btnWidgetSend) btnWidgetSend.disabled = true;
    showTypingIndicator();

    const cbName = "kusuma_ai_cb_" + Math.floor(Math.random() * 1000000);
    const targetEndpoint = `${CONFIG.BACKEND_WEBAPP_URL}?action=aiChatbot&message=${encodeURIComponent(messageText)}&callback=${cbName}`;

    window[cbName] = function (data) {
      removeTypingIndicator();
      if (btnWidgetSend) btnWidgetSend.disabled = false;
      delete window[cbName];
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }

      const botReply = (data && (data.reply || data.response || data.message))
        ? (data.reply || data.response || data.message)
        : CONFIG.FALLBACK_REPLY;

      appendChatMessage("bot", botReply);
    };

    const scriptTag = document.createElement("script");
    scriptTag.src = targetEndpoint;
    scriptTag.onerror = function () {
      removeTypingIndicator();
      if (btnWidgetSend) btnWidgetSend.disabled = false;
      appendChatMessage("bot", "Halo Kak! Pilihan unit sewa Kalibata City mulai dari Studio & 2BR siap huni. Silakan hubungi WhatsApp kami di 08135600058 untuk survei langsung ke Tower Flamboyan GF.");
    };

    document.body.appendChild(scriptTag);
  }

  // Event Listeners for Input & Submit
  if (btnWidgetSend) {
    btnWidgetSend.addEventListener("click", () => {
      if (widgetInput) sendChatQuery(widgetInput.value.trim());
    });
  }

  if (widgetInput) {
    widgetInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendChatQuery(widgetInput.value.trim());
      }
    });
  }

  // Quick Prompt Chips Binding
  if (chipStudio) {
    chipStudio.addEventListener("click", () => {
      openChat();
      sendChatQuery("Berapa tarif sewa Studio bulanan di Kalibata City?");
    });
  }

  if (chipParkir) {
    chipParkir.addEventListener("click", () => {
      openChat();
      sendChatQuery("Bagaimana aturan dan tarif parkir mobil / motor di Kalibata City?");
    });
  }

  if (chip2br) {
    chip2br.addEventListener("click", () => {
      openChat();
      sendChatQuery("Berapa harga sewa unit 2BR dan bisakah dijadwalkan survei hari ini?");
    });
  }

  // Helper Functions
  function escapeHtml(string) {
    return String(string)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatMarkdownToHtml(text) {
    let clean = escapeHtml(text);
    clean = clean.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    clean = clean.replace(/\*(.*?)\*/g, "<em>$1</em>");
    clean = clean.replace(/\n/g, "<br>");
    return clean;
  }
});