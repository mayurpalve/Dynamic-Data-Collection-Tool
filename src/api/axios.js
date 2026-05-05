import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= AUTH TOKEN ================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE ================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      return Promise.reject({
        ...error.response.data,
        response: error.response,
        status: error.response.status,
      });
    }

    if (error.request) {
      return Promise.reject({
        message: "Unable to reach the server. Please try again.",
        error,
      });
    }

    return Promise.reject({
      message: error.message || "Something went wrong",
      error,
    });
  }
);

export default api;
