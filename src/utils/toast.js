import toast from "react-hot-toast";

export const showSuccess = (msg) => toast.success(msg);

export const showError = (msg) => toast.error(msg);

export const showLoading = (msg) => toast.loading(msg);

export const showPromise = (promise, messages) =>
  toast.promise(promise, messages);

export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.data?.message) return error.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.data?.error) return error.data.error;
  if (error.error) return error.error;
  if (error.message) return error.message;
  return fallback;
};
