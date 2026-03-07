import { toast } from "sonner";

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        background: "#10b981",
        color: "#fff",
        border: "none",
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      style: {
        background: "#ef4444",
        color: "#fff",
        border: "none",
      },
    });
  },
  info: (message: string) => {
    toast(message, {
      style: {
        background: "#3b82f6",
        color: "#fff",
        border: "none",
      },
    });
  },
  warning: (message: string) => {
    toast.warning(message, {
      style: {
        background: "#f59e0b",
        color: "#fff",
        border: "none",
      },
    });
  },
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: "#6b7280",
        color: "#fff",
        border: "none",
      },
    });
  },
};
