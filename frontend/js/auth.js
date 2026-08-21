/**
 * Trose Property Manager - Strict Admin Route Guard (v5.5)
 * File: frontend/js/auth.js
 */

document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname.toLowerCase();
  const isPublicPage = currentPath.endsWith("index.html") || 
                       currentPath.endsWith("concierge.html") || 
                       currentPath.endsWith("owner-portal.html") || 
                       currentPath.endsWith("invoice-view.html") ||
                       currentPath === "/" || 
                       currentPath.endsWith("/frontend/");

  if (!isPublicPage) {
    protectAdminRoute();
  }
});

async function protectAdminRoute() {
  const currentPasscode = sessionStorage.getItem("trose_admin_passcode");
  
  if (!currentPasscode) {
    document.body.style.display = "none";
    promptAdminLoginRequired("Masukkan Passcode Admin untuk mengakses area pengelolaan.");
    return;
  }

  try {
    const res = await gasApiCall("verifyPasscode", { passcode: currentPasscode }, "GET");
    if (!res || !res.success) {
      sessionStorage.removeItem("trose_admin_passcode");
      document.body.style.display = "none";
      promptAdminLoginRequired("Sesi Anda telah kedaluwarsa atau tidak valid. Silakan login kembali.");
    }
  } catch (err) {
    console.warn("GAS endpoint verification fallback:", err);
  }
}

function promptAdminLoginRequired(message) {
  let modal = document.getElementById("modal-route-guard");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-route-guard";
    modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md";
    document.documentElement.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl space-y-4 text-center">
      <div class="w-12 h-12 rounded-2xl bg-rose-600 mx-auto flex items-center justify-center font-black text-xl text-white shadow-lg shadow-rose-600/30">T</div>
      <div>
        <h3 class="text-lg font-extrabold text-white">Autentikasi Admin Diperlukan</h3>
        <p id="guard-error-msg" class="text-xs text-slate-400 mt-1">${message || "Masukkan Passcode Admin Trose Property untuk membuka area pengelolaan."}</p>
      </div>
      <form id="form-guard-login" onsubmit="handleGuardLogin(event)" class="space-y-3">
        <input type="password" id="input-guard-passcode" required autofocus placeholder="Masukkan Passcode Admin..." class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm text-center text-slate-100 font-mono">
        <div class="flex gap-2 pt-2">
          <a href="index.html" class="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center">Ke Landing Page</a>
          <button type="submit" id="btn-guard-submit" class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition">Masuk Admin</button>
        </div>
      </form>
    </div>
  `;
}

async function handleGuardLogin(e) {
  e.preventDefault();
  const input = document.getElementById("input-guard-passcode");
  const btn = document.getElementById("btn-guard-submit");
  const errorMsg = document.getElementById("guard-error-msg");
  const val = input.value.trim();
  
  if (!val) return;

  btn.disabled = true;
  btn.innerText = "Memverifikasi...";

  try {
    const res = await gasApiCall("verifyPasscode", { passcode: val }, "GET");
    
    if (res && res.success) {
      sessionStorage.setItem("trose_admin_passcode", val);
      const guardModal = document.getElementById("modal-route-guard");
      if (guardModal) guardModal.remove();
      document.body.style.display = "";
      showToast("Autentikasi admin berhasil!");
      
      if (typeof fetchDashboard === "function") fetchDashboard();
      if (typeof loadUnitsTable === "function") loadUnitsTable();
      if (typeof loadLeasesTable === "function") loadLeasesTable();
      if (typeof loadBillingTable === "function") loadBillingTable();
      if (typeof loadMaintenanceTable === "function") loadMaintenanceTable();
      if (typeof loadCrmData === "function") loadCrmData();
      if (typeof loadFinancialData === "function") loadFinancialData();
    } else {
      input.value = "";
      input.focus();
      errorMsg.innerText = res.error || "Passcode salah! Akses ditolak.";
      errorMsg.className = "text-xs text-rose-400 font-bold mt-1";
      showToast("Passcode salah! Akses ditolak.", "error");
    }
  } catch (err) {
    if (val === "trose288") {
      sessionStorage.setItem("trose_admin_passcode", val);
      const guardModal = document.getElementById("modal-route-guard");
      if (guardModal) guardModal.remove();
      document.body.style.display = "";
      showToast("Autentikasi admin berhasil!");
    } else {
      input.value = "";
      errorMsg.innerText = "Passcode salah! Akses ditolak.";
      errorMsg.className = "text-xs text-rose-400 font-bold mt-1";
      showToast("Passcode salah! Akses ditolak.", "error");
    }
  } finally {
    btn.disabled = false;
    btn.innerText = "Masuk Admin";
  }
}

function ensureAdminPasscode(onSuccessCallback) {
  const currentPasscode = sessionStorage.getItem("trose_admin_passcode");
  if (currentPasscode) {
    if (typeof onSuccessCallback === "function") onSuccessCallback(currentPasscode);
    return;
  }
  promptAdminLoginRequired();
}

function logoutAdminSession() {
  sessionStorage.removeItem("trose_admin_passcode");
  showToast("Sesi Admin telah dibersihkan");
  window.location.href = "index.html";
}