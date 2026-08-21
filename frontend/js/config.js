/**
 * Trose Property Manager - Central Config & Dynamic Settings (v5.4)
 * File: frontend/js/config.js
 */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbz_SAMPLE_DEPLOYMENT_ID/exec";

// Default Nomor WhatsApp Resmi Kalibata City
let OFFICIAL_WA_NUMBER = "+6281221559000";
const OFFICIAL_WA_GREETING = "Halo Admin Trose Kalibata City, saya ingin konsultasi mengenai sewa unit apartemen.";

async function gasApiCall(action, params = {}, method = "GET") {
  if (method === "GET") {
    const url = new URL(GAS_API_URL);
    url.searchParams.append("action", action);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const response = await fetch(url.toString(), {
      method: "GET",
      mode: "cors"
    });
    return await response.json();
  } else {
    const activePasscode = sessionStorage.getItem("trose_admin_passcode") || "";

    const payload = JSON.stringify({
      action: action,
      passcode: activePasscode,
      ...params
    });

    const response = await fetch(GAS_API_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: payload
    });
    return await response.json();
  }
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = `px-4 py-3 rounded-xl shadow-xl text-sm font-bold flex items-center gap-2 transition-all transform duration-300 ${
    type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
  }`;
  
  const iconSpan = document.createElement("span");
  iconSpan.textContent = type === "success" ? "OK" : "ERR";
  iconSpan.className = "px-1.5 py-0.5 rounded bg-black/20 text-xs";
  
  const textSpan = document.createElement("span");
  textSpan.textContent = String(message);
  
  toast.appendChild(iconSpan);
  toast.appendChild(textSpan);
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function createToastContainer() {
  const cont = document.createElement("div");
  cont.id = "toast-container";
  cont.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2";
  document.body.appendChild(cont);
  return cont;
}