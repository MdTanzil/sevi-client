import axios from "axios";
import { getAuth } from "firebase/auth";
import app from "../config/firrebase.config";

// One shared instance for the whole app (previously every useAxios()
// call created a fresh one).
const instance = axios.create({
  // Production API by default. For local development, set VITE_API_URL
  // (see .env.example), e.g. http://localhost:5000/api/v1
  baseURL:
    import.meta.env.VITE_API_URL || "https://sevi-server.vercel.app/api/v1",

  withCredentials: true,
});

// The server JWT cookie expires after 10h while the Firebase session
// lives on, so a signed-in user would start seeing 401s on every data
// page ("Could not load the books") until they signed out and back in.
// This interceptor silently re-mints the JWT from the still-valid
// Firebase session and retries the failed request once.
//
// Only one refresh runs at a time: concurrent 401s (e.g. the dashboard
// firing several queries at once) share the same in-flight refresh
// instead of each minting their own token.
let refreshPromise = null;

const refreshToken = () => {
  if (!refreshPromise) {
    const email = getAuth(app).currentUser?.email;
    if (!email) return Promise.reject(new Error("No signed-in user"));
    refreshPromise = instance.post("/jwt", { email }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";
    // One retry only, only for an expired session (401), and never for
    // the token endpoint itself (it must not trigger its own refresh).
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !url.includes("/jwt")
    ) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return instance(originalRequest);
      } catch {
        // Refresh failed (signed out, or the server is unreachable):
        // fall through and let the original 401 reach the caller, which
        // shows its usual error state.
      }
    }
    return Promise.reject(error);
  }
);

const useAxios = () => instance;

export default useAxios;
