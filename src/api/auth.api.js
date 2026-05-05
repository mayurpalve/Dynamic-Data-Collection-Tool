import axios from "./axios";

export const loginApi = async (payload) => {
  const res = await axios.post("/auth/login", payload);
  return res.data.data;
};

export const forgotPasswordApi = async (payload) => {
  const res = await axios.post("/auth/forgot-password", payload);
  return res.data.data;
};

export const resetPasswordApi = async ({ email, otp, password }) => {
  const res = await axios.post("/auth/reset-password", {
    email,
    otp,
    password,
  });
  return res.data.data;
};
