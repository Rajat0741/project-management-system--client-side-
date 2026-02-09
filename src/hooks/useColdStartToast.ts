import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { serverHealthQueryOptions } from "./useServerHealth";

const COLD_START_DELAY = 7000; // Show toast after 7 seconds
const TOAST_ID = "cold-start";

export function useColdStartToast() {
  const { isLoading, isSuccess, isError } = useQuery(serverHealthQueryOptions());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (isLoading && !toastShownRef.current) {
      timerRef.current = setTimeout(() => {
        toastShownRef.current = true;
        toast.loading("Server is waking up…", {
          id: TOAST_ID,
          description: "Hosted on a free server — this may take a moment.",
          duration: Infinity,
        });
      }, COLD_START_DELAY);
    }

    if (!isLoading && (isSuccess || isError)) {
      // Server responded — clear the timer and dismiss any toast
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (toastShownRef.current) {
        toast.dismiss(TOAST_ID);
        toastShownRef.current = false;
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isLoading, isSuccess, isError]);
}
