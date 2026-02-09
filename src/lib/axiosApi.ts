import type { ErrorResponse } from "@/types";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { router } from "@/router";
import { useUserStore } from "@/store/userData";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const clearUserData = useUserStore.getState().clearUserData;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      try {
        await apiClient.post("/auth/refresh-token");
        return apiClient(originalRequest);
      } catch (refreshError) {
        toast.error("Session expired, please login again.");
        router.navigate({ to: "/login" });
        clearUserData();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
