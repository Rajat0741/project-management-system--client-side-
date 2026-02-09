import { isAxiosError } from "axios";
import type { ErrorResponse } from "@/types";
import { toast } from "sonner";

// Centered error handler for API and local errors

export const axiosErrorHandler = (error: unknown) => {
  if (isAxiosError(error)) {
    // Do not show toast for 401 errors from the refresh-token endpoint.
    // The axios interceptor already handles this by showing "Session expired" and redirecting.
    if (error.response?.status === 401 && error.config?.url?.includes("/auth/refresh-token")) {
      return;
    }
    const serverError = error.response?.data as ErrorResponse | undefined;
    const errorMessage = serverError?.message || error.message || "Server connection failed";
    toast.error(errorMessage);
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("An unexpected error occurred");
  }
};
