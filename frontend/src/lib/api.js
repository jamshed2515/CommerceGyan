/**
 * Centralized API base URL configuration.
 * 
 * Uses NEXT_PUBLIC_API_URL environment variable in production (Vercel),
 * falls back to localhost:5000 for local development.
 */
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default API;
