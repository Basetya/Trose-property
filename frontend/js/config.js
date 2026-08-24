/**
 * Kusuma Properti Manager - Central Configuration & CORS-Proof API Dispatcher
 * Version: v14.2.0
 * File: frontend/js/config.js
 */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzX9pZnyEmHZsxrehzLSSIdjQ-QIHt5Gt6kdJSgct-QnXpx73WQJhkjlNE0CQ5sSys/exec";

let OFFICIAL_WA_NUMBER = "+6281221559000";
const OFFICIAL_WA_GREETING = "Halo Admin Kusuma Properti Kalibata City, saya ingin konsultasi sewa unit.";

// Universal API Dispatcher (Bebas Masalah CORS Google Apps Script)
async function gasApiCall(action, payload = {}, method = "POST") {
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

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[GAS API CALL ERROR] Action: ${action}`, error);
    throw error;
  }
}