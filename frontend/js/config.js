/**
 * Kusuma Properti Manager - Central Configuration & CORS-Proof API Dispatcher
 * Version: v16.2.0
 * File: frontend/js/config.js
 */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwNN6VAk-a-zkuB301BP5r2-bHfb_zIlrXmL0fszq8EfImCYGzkh83wXZUmUmhmYMg/exec";

let OFFICIAL_WA_NUMBER = "+6281221559000";
const OFFICIAL_WA_GREETING = "Halo Admin Kusuma Properti Kalibata City, saya ingin konsultasi sewa unit.";

async function gasApiCall(action, payload = {}, method = "POST") {
  if (action === "aiChatbot") {
    const params = new URLSearchParams({
      action: "aiChatbot",
      message: payload.message || "",
      senderPhone: payload.senderPhone || "Public_Web_Lead"
    });
    const fullUrl = `${GAS_API_URL}?${params.toString()}`;
    const response = await fetch(fullUrl, { method: "GET", redirect: "follow" });
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }

  const isGet = method.toUpperCase() === "GET";
  let url = GAS_API_URL;

  const requestOptions = {
    method: method.toUpperCase(),
    redirect: "follow"
  };

  if (isGet) {
    const params = new URLSearchParams({ action, ...payload });
    url += (url.includes("?") ? "&" : "?") + params.toString();
  } else {
    requestOptions.headers = {
      "Content-Type": "text/plain;charset=utf-8"
    };
    requestOptions.body = JSON.stringify({ action, ...payload });
  }

  const response = await fetch(url, requestOptions);
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}