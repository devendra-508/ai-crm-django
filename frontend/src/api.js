import axios from "axios";

export const PRODUCTION_API_BASE_URL =
    "https://ai-crm-django-production.up.railway.app/api";

export function getApiBaseUrl({ configuredBaseUrl, isDev }) {
    if (typeof configuredBaseUrl === "string" && configuredBaseUrl.trim()) {
        return configuredBaseUrl.trim().replace(/\/+$/, "");
    }

    return isDev ? "/api" : PRODUCTION_API_BASE_URL;
}

const api = axios.create({
    baseURL: getApiBaseUrl({
        configuredBaseUrl: import.meta.env?.VITE_API_BASE_URL,
        isDev: import.meta.env?.DEV,
    }),
});

let refreshPromise = null;

// =========================
// REQUEST INTERCEPTOR
// =========================

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


// =========================
// RESPONSE INTERCEPTOR
// =========================

api.interceptors.response.use(
    (response) => {
        return response;
    },

    async (error) => {

        const originalRequest = error.config;

        // Only handle 401 once
        if (
            originalRequest &&
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh/")
        ) {

            originalRequest._retry = true;

            const refreshToken =
                localStorage.getItem("refresh_token");

            // No refresh token available
            if (!refreshToken) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user");

                window.location.href = "/";

                return Promise.reject(error);
            }

            try {
                if (!refreshPromise) {
                    refreshPromise = axios
                        .post(
                            api.getUri({ url: "/auth/refresh/" }),
                            { refresh: refreshToken }
                        )
                        .then((response) => {
                            const newAccessToken = response.data?.access;

                            if (!newAccessToken) {
                                throw new Error("Refresh response did not include an access token.");
                            }

                            localStorage.setItem("access_token", newAccessToken);

                            if (response.data.refresh) {
                                localStorage.setItem("refresh_token", response.data.refresh);
                            }

                            return newAccessToken;
                        })
                        .finally(() => {
                            refreshPromise = null;
                        });
                }

                const newAccessToken = await refreshPromise;

                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Avoid logging Axios config, which can contain authorization data.
                console.error("Session refresh failed.");

                // Refresh token expired/invalid
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user");

                window.location.href = "/";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
