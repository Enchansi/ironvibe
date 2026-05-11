import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("iv_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function formatApiError(err) {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || "Something went wrong";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg || JSON.stringify(d)).join(" ");
  return String(detail);
}

export const LIFT_LABELS = {
  bench: "Bench Press",
  squat: "Back Squat",
  deadlift: "Deadlift",
  ohp: "Overhead Press",
  row: "Barbell Row",
  pullup: "Pull-Up (Weighted)",
};

export const LIFT_KEYS = ["bench", "squat", "deadlift", "ohp", "row", "pullup"];
