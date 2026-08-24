/**
 * Kusuma Properti Manager - Central Configuration
 * Version: v14.1.0
 * File: frontend/js/config.js
 */

// Production Google Apps Script Web App Deployment Endpoint
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzX9pZnyEmHZsxrehzLSSIdjQ-QIHt5Gt6kdJSgct-QnXpx73WQJhkjlNE0CQ5sSys/exec";

// Official Contact Defaults
let OFFICIAL_WA_NUMBER = "+6281221559000";
const OFFICIAL_WA_GREETING = "Halo Admin Kusuma Properti Kalibata City, saya ingin konsultasi sewa unit.";

// Universal API Dispatcher Helper
async function gasApiCall(action, payload = {}, method = "POST") {
  const isGet = method.toUpperCase() === "GET";
  let url = GAS_API_URL;

  const options = {
    method: method.toUpperCase(),
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    }
  };

  if (isGet) {
    const params = new URLSearchParams({ action, ...payload });
    url += (url.includes("?") ? "&" : "?") + params.toString();
  } else {
    options.body = JSON.stringify({ action, ...payload });
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[GAS API CALL FAILED] Action: ${action}`, error);
    throw error;
  }
}