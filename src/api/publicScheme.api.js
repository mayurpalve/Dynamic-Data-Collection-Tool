import api from "./axios";

/* ================= PUBLIC FORM (BY PUBLIC LINK) ================= */
export const getPublicSchemeDefinition = async (publicLinkId) => {
  const res = await api.get(`/public/scheme/${publicLinkId}`);

  // backend returns definition directly in data
  return res.data.data;
};

/* ================= SUBMIT PUBLIC ANSWER ================= */
export const submitPublicSchemeAnswer = async (payload) => {
  const res = await api.post(
    "/public/scheme-answers/submit",
    payload
  );

  return res.data.data.item;
};
