import api from "./axios";

export const generateAISummary = async (formData) => {
  const res = await api.post("/scheme-answers/ai-summary", formData);
  return res.data.data.summary;
};
