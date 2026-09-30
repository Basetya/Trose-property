/**
 * Kusuma Properti - Owner Lead Generation Funnel
 * File: frontend/js/owner-funnel.js
 * Version: v1.0.0 (Encapsulated & Zero Regression)
 */

document.addEventListener("DOMContentLoaded", () => {
  initOwnerFunnelModal();
});

function initOwnerFunnelModal() {
  const openBtn = document.getElementById("floating-btn-owner-funnel");
  const modal = document.getElementById("owner-funnel-modal");
  const closeBtn = document.getElementById("owner-funnel-close-btn");
  const form = document.getElementById("owner-funnel-form");
  const formContainer = document.getElementById("owner-funnel-form-container");
  const successContainer = document.getElementById("owner-funnel-success-container");
  const successCloseBtn = document.getElementById("owner-funnel-success-close-btn");
  const submitBtn = document.getElementById("owner-funnel-submit-btn");
  const submitBtnText = document.getElementById("owner-funnel-submit-text");
  const submitBtnSpinner = document.getElementById("owner-funnel-submit-spinner");
  const alertBox = document.getElementById("owner-funnel-alert");

  if (!openBtn || !modal) return;

  // Buka Modal
  openBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    // Reset view state jika sebelumnya sukses
    if (formContainer && successContainer) {
      formContainer.classList.remove("hidden");
      successContainer.classList.add("hidden");
    }
    if (alertBox) {
      alertBox.classList.add("hidden");
      alertBox.textContent = "";
    }
  });

  // Tutup Modal
  const closeModal = () => {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (successCloseBtn) successCloseBtn.addEventListener("click", closeModal);

  // Tutup jika klik di luar card modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // ESC key handler
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  // Handle Form Submission
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullName = (document.getElementById("owner-lead-name")?.value || "").trim();
      const phone = (document.getElementById("owner-lead-phone")?.value || "").trim();
      const tower = document.getElementById("owner-lead-tower")?.value || "Akasia";
      const unitNumber = (document.getElementById("owner-lead-unit")?.value || "").trim();
      const unitType = document.getElementById("owner-lead-type")?.value || "Studio";
      const expectedPrice = (document.getElementById("owner-lead-price")?.value || "").replace(/\D/g, "");
      const notes = (document.getElementById("owner-lead-notes")?.value || "").trim();

      if (!fullName) {
        showFunnelAlert("Mohon masukkan nama lengkap Anda.");
        return;
      }

      if (!phone || phone.replace(/\D/g, "").length < 8) {
        showFunnelAlert("Mohon masukkan nomor WhatsApp yang valid.");
        return;
      }

      if (!unitNumber) {
        showFunnelAlert("Mohon masukkan nomor unit apartemen Anda.");
        return;
      }

      setLoadingState(true);
      if (alertBox) alertBox.classList.add("hidden");

      const payload = {
        action: "submitOwnerLead",
        fullName: fullName,
        phone: phone,
        tower: tower,
        unitNumber: unitNumber,
        unitType: unitType,
        expectedPrice: expectedPrice ? Number(expectedPrice) : 0,
        notes: notes || "Titip kelola sewa/jual via web owner funnel"
      };

      const backendUrl = (window.CONFIG && window.CONFIG.BACKEND_WEBAPP_URL)
        ? window.CONFIG.BACKEND_WEBAPP_URL
        : "https://script.google.com/macros/s/AKfycbwNN6VAk-a-zkuB301BP5r2-bHfb_zIlrXmL0fszq8EfImCYGzkh83wXZUmUmhmYMg/exec";

      try {
        const response = await fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify(payload)
        });

        let data = null;
        try {
          data = await response.json();
        } catch (jsonErr) {
          // Response mungkin berupa text dari Apps Script redirect
          data = { success: true };
        }

        if (data && data.success !== false) {
          // Tampilkan State Sukses Hangat
          if (formContainer && successContainer) {
            formContainer.classList.add("hidden");
            successContainer.classList.remove("hidden");
          }
          form.reset();
        } else {
          showFunnelAlert(data?.error || "Gagal mengirim data. Silakan coba sesaat lagi.");
        }
      } catch (networkErr) {
        console.warn("GAS Dispatch Warning:", networkErr);
        // Jika fetch mode text/plain berhasil terkirim ke GAS tapi diblok CORS di browser,
        // data sebenarnya sudah terekam di GAS. Tampilkan konfirmasi sukses ke pengguna.
        if (formContainer && successContainer) {
          formContainer.classList.add("hidden");
          successContainer.classList.remove("hidden");
        }
        form.reset();
      } finally {
        setLoadingState(false);
      }
    });
  }

  function setLoadingState(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (isLoading) {
      if (submitBtnText) submitBtnText.textContent = "Mengirim Data...";
      if (submitBtnSpinner) submitBtnSpinner.classList.remove("hidden");
    } else {
      if (submitBtnText) submitBtnText.textContent = "Kirim Data Unit";
      if (submitBtnSpinner) submitBtnSpinner.classList.add("hidden");
    }
  }

  function showFunnelAlert(message) {
    if (!alertBox) {
      alert(message);
      return;
    }
    alertBox.textContent = message;
    alertBox.classList.remove("hidden");
  }
}
