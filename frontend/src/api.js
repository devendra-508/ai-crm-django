import axios from "axios";

const api = axios.create({
    baseURL: "https://ai-crm-django-production.up.railway.app/api",
});

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
            error.response?.status === 401 &&
            !originalRequest._retry
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

                // Get new access token
                const response = await axios.post(
                    "https://ai-crm-django-production.up.railway.app/api/auth/refresh/",
                    {
                        refresh: refreshToken,
                    }
                );

                const newAccessToken =
                    response.data.access;

                // Save new access token
                localStorage.setItem(
                    "access_token",
                    newAccessToken
                );

                // Update original request
                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                // Retry original request
                return api(originalRequest);

            } catch (refreshError) {

                console.error(
                    "Refresh token failed:",
                    refreshError
                );

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