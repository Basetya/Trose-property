/**
 * Kusuma Properti Manager - Role-Based Access Control (RBAC) Guard
 * File: frontend/js/auth.js
 * Version: v147.0.0 (Strict Master Passcode Alignment & Anti-Lockout Guard)
 */

// Kredensial Resmi Master
const MASTER_FOUNDER_PASS = "SalmonDha28$$";
const MASTER_ADMIN_PASS = "Tearose288";

// 1. Inisialisasi Guard Akses Halaman
(function initRoleSecurityGuard() {
  const currentPath = window.location.pathname.toLowerCase();
  
  const isProtectedAdminPage = 
    currentPath.includes("dashboard") || 
    currentPath.includes("crm") || 
    currentPath.includes("units") || 
    currentPath.includes("leases") || 
    currentPath.includes("billing") || 
    currentPath.includes("finance") || 
    currentPath.includes("inspections") || 
    currentPath.includes("maintenance");

  if (!isProtectedAdminPage) return;

  const currentRole = sessionStorage.getItem("KUSUMA_USER_ROLE");
  const sessionToken = sessionStorage.getItem("KUSUMA_AUTH_TOKEN");

  // Jika belum login atau sesi kosong, minta passcode
  if (!sessionToken || !currentRole) {
    promptDualRoleLogin();
    return;
  }

  // Penguncian Khusus Halaman Keuangan (Finance) untuk Admin
  if (currentPath.includes("finance") && currentRole !== "FOUNDER") {
    alert("⛔ Akses Ditolak: Halaman Laporan Keuangan hanya dapat diakses oleh Founder.");
    window.location.href = "dashboard.html";
  }
})();

// 2. Dialog Permintaan Passcode
function promptDualRoleLogin() {
  const enteredPass = prompt(
    "🔐 AKSES KUSUMA MANAGEMENT COCKPIT\n\n" +
    "Masukkan Passcode (Founder / Admin):"
  );

  if (enteredPass === null) {
    alert("Akses dibatalkan. Mengalihkan ke halaman utama...");
    window.location.href = "index.html";
    return;
  }

  const cleanPass = enteredPass.trim();

  // Ambil data password custom jika pernah diubah, atau gunakan master resmi
  const activeFounderPass = localStorage.getItem("KUSUMA_PASS_FOUNDER") || MASTER_FOUNDER_PASS;
  const activeAdminPass = localStorage.getItem("KUSUMA_PASS_ADMIN") || MASTER_ADMIN_PASS;

  // A. Verifikasi Akun FOUNDER (Toleran Case & Master Match)
  if (
    cleanPass === activeFounderPass || 
    cleanPass === MASTER_FOUNDER_PASS || 
    cleanPass.toLowerCase() === MASTER_FOUNDER_PASS.toLowerCase()
  ) {
    sessionStorage.setItem("KUSUMA_AUTH_TOKEN", "SESSION_FOUNDER_" + Date.now());
    sessionStorage.setItem("KUSUMA_USER_ROLE", "FOUNDER");
    sessionStorage.setItem("kusuma_admin_passcode", MASTER_FOUNDER_PASS);
    alert("Selamat datang, Founder! Akses penuh diaktifkan.");
    applyUIPrivileges();
    return;
  }

  // B. Verifikasi Akun ADMIN (Toleran Case & Master Match)
  if (
    cleanPass === activeAdminPass || 
    cleanPass === MASTER_ADMIN_PASS || 
    cleanPass.toLowerCase() === MASTER_ADMIN_PASS.toLowerCase()
  ) {
    const currentPath = window.location.pathname.toLowerCase();
    if (currentPath.includes("finance")) {
      alert("⛔ Akses Ditolak: Akun Admin tidak memiliki izin untuk halaman Laporan Keuangan.");
      window.location.href = "dashboard.html";
      return;
    }

    sessionStorage.setItem("KUSUMA_AUTH_TOKEN", "SESSION_ADMIN_" + Date.now());
    sessionStorage.setItem("KUSUMA_USER_ROLE", "ADMIN");
    sessionStorage.setItem("kusuma_admin_passcode", MASTER_ADMIN_PASS);
    alert("Selamat datang, Staff Admin! Mode akses operasional diaktifkan.");
    applyUIPrivileges();
    return;
  }

  // Jika input salah
  alert("❌ Passcode salah! Akses ditolak.");
  window.location.href = "index.html";
}

// 3. Penegakan Hak Akses Tampilan Antarmuka Berdasarkan Role
function applyUIPrivileges() {
  document.addEventListener("DOMContentLoaded", () => {
    const role = sessionStorage.getItem("KUSUMA_USER_ROLE");

    if (role === "ADMIN") {
      // Sembunyikan Link Keuangan di Navigasi
      const financeLinks = document.querySelectorAll('a[href*="finance.html"]');
      financeLinks.forEach(el => {
        el.style.display = "none";
      });

      // Kunci Input Pengaturan WhatsApp (Read-Only)
      const inputWa = document.getElementById("inputAdminWa");
      const btnSaveWa = document.getElementById("btnSaveWa");
      if (inputWa) {
        inputWa.disabled = true;
        inputWa.classList.add("opacity-60", "cursor-not-allowed");
      }
      if (btnSaveWa) {
        btnSaveWa.style.display = "none";
      }

      // Sembunyikan Panel Pengaturan Passcode
      const passcodeCard = document.getElementById("inputCurrentPasscode")?.closest(".japandi-card");
      if (passcodeCard) {
        passcodeCard.style.display = "none";
      }

      // Kunci AI Studio (Read-Only)
      const kbText = document.getElementById("ai-kb-text");
      const grText = document.getElementById("ai-guardrail-text");
      const btnSaveAi = document.getElementById("btn-save-ai");
      const btnClearAi = document.querySelector('button[onclick="handleClearAiConfig()"]');
      const uploadAiLabel = document.querySelector('label input[id="ai-file-upload"]')?.closest("label");

      if (kbText) {
        kbText.setAttribute("readonly", "true");
        kbText.classList.add("bg-[#EFECE6]", "cursor-not-allowed");
      }
      if (grText) {
        grText.setAttribute("readonly", "true");
        grText.classList.add("bg-[#EFECE6]", "cursor-not-allowed");
      }
      if (btnSaveAi) btnSaveAi.style.display = "none";
      if (btnClearAi) btnClearAi.style.display = "none";
      if (uploadAiLabel) uploadAiLabel.style.display = "none";

      // Badge Role
      const headerTitle = document.querySelector("h1, h2");
      if (headerTitle && !document.getElementById("role-badge-indicator")) {
        const badge = document.createElement("span");
        badge.id = "role-badge-indicator";
        badge.className = "ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8DFD3] text-[#737370] uppercase";
        badge.innerText = "Role: Staff Admin";
        headerTitle.appendChild(badge);
      }
    } else if (role === "FOUNDER") {
      const headerTitle = document.querySelector("h1, h2");
      if (headerTitle && !document.getElementById("role-badge-indicator")) {
        const badge = document.createElement("span");
        badge.id = "role-badge-indicator";
        badge.className = "ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8C5835] text-white uppercase shadow-sm";
        badge.innerText = "Role: Founder (Full Access)";
        headerTitle.appendChild(badge);
      }
    }
  });
}

// Jalankan penegakan hak akses
applyUIPrivileges();

function getCurrentUserRole() {
  return sessionStorage.getItem("KUSUMA_USER_ROLE") || "GUEST";
}