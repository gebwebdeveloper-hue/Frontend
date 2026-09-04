const DEV_API = "http://localhost:5000/api";
const PROD_API = "https://lekhok.onrender.com/api";

export const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? PROD_API : DEV_API);
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? "https://lekhok.onrender.com" : "http://localhost:5000");

// Production site URL (customizable via VITE_SITE_URL in production environment)
const PROD_SITE_URL = "https://www.lekhoktripura.in";
export const SITE_URL =
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== "undefined" &&
   window.location.hostname !== "localhost" &&
   window.location.hostname !== "127.0.0.1"
    ? window.location.origin
    : PROD_SITE_URL);
