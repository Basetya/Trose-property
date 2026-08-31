/**
 * Kusuma Properti Manager - Master Authentication Guard
 * File: frontend/js/auth.js
 * Version: v144.0.0 (Anti-Lockout Fail-Safe & Passcode Master Guard)
 */

const DEFAULT_ADMIN_PASSCODE = "tearose288";

// 1. Jalankan Pengecekan Otorisasi Saat Halaman Admin Dibuka
(function checkAdminAuthorization() {
  const currentPath = window.location.pathname.toLowerCase();
  
  // Jika sedang membuka halaman dashboard atau panel manajemen internal
  const isAdminPage = 
    currentPath.includes("dashboard") || 
    currentPath.includes("crm") || 
    currentPath.includes("units") || 
    currentPath.includes("leases") || 
    currentPath.includes("billing") || 
    currentPath.includes("finance") || 
    currentPath.includes("inspections") || 
    currentPath.includes("maintenance");

  if (!isAdminPage) return;

  const sessionToken = sessionStorage.getItem("kusuma_admin_passcode");

  // Jika belum login atau sesi kosong, minta passcode
  if (!sessionToken || sessionToken.trim() !== DEFAULT_ADMIN_PASSCODE) {
    promptAdminLogin();
  }
})();

// 2. Fungsi Dialog Permintaan Passcode
function promptAdminLogin() {
  const enteredPass = prompt("🔐 Akses Terbatas Kusuma Admin\n\nMasukkan Passcode Admin:");

  if (enteredPass === null) {
    // Jika klik Cancel, alihkan ke landing page
    alert("Akses dibatalkan. Mengalihkan ke Beranda...");
    window.location.href = "index.html";
    return;
  }

  const cleanPass = enteredPass.trim();

  // Verifikasi kata sandi default resmi
  if (cleanPass === DEFAULT_ADMIN_PASSCODE) {
    sessionStorage.setItem("kusuma_admin_passcode", DEFAULT_ADMIN_PASSCODE);
    sessionStorage.setItem("KUSUMA_AUTH_TOKEN", "AUTH_SESSION_VALID_" + Date.now());
    localStorage.setItem("KUSUMA_ADMIN_ROLE", "SUPER_ADMIN");
    // Akses diizinkan, halaman dashboard lanjut dimuat
  } else {
    alert("❌ Passcode salah! Akses ke Dashboard ditolak.");
    window.location.href = "index.html";
  }
}

// 3. Helper Verifikasi Eksternal untuk Fungsi API Backend
function getAdminPasscode() {
  return sessionStorage.getItem("kusuma_admin_passcode") || DEFAULT_ADMIN_PASSCODE;
}