const DEV_API = "http://localhost:5000/api";
const PROD_API = "https://lekhok.onrender.com/api";

export const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? PROD_API : DEV_API);
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? "https://lekhok.onrender.com" : "http://localhost:5000");
