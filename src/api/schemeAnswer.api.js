import api from "./axios";

/* ================= USER SUBMIT ================= */
export const submitSchemeAnswer = async (payload) => {
  const res = await api.post("/scheme-answers", payload);
  return res.data.data.item;
};

/* ================= LIST (ROLE BASED) ================= */
export const getSchemeAnswers = async (params = {}) => {
  const res = await api.get("/scheme-answers", { params });

  return {
    items: res.data.data.items || [],
    total: res.data.data.total || 0,
  };
};

/* USER EDIT SUBMISSION */
export const updateSchemeAnswer = async (id, data) => {
  const res = await api.put(`/scheme-answers/${id}`, data);
  return res.data.data.item;
};

/* ================= IMPORT EXCEL ================= */
export const importSchemeAnswers = async (payload) => {
  const res = await api.post("/scheme-answers/import", payload);
  return res.data.data.summary;
};

export const importCollaborativeWorkbook = async (payload) => {
  const res = await api.post("/scheme-answers/workbook/import", payload);
  return res.data.data.summary;
};

export const getCollaborativeSchemeRows = async (schemeId) => {
  const res = await api.get(`/scheme-answers/collaborative/${schemeId}`);
  return res.data.data;
};

export const updateCollaborativeSchemeRow = async (id, data) => {
  const res = await api.patch(`/scheme-answers/collaborative/${id}`, { data });
  return res.data.data.item;
};

/* ================= EXPORT EXCEL ================= */
export const exportSchemeAnswers = async (schemeId) => {
  const res = await api.get(`/scheme-answers/export`, {
    params: { schemeId },
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "scheme-data.xlsx";
  link.click();

  window.URL.revokeObjectURL(url);
};

export const exportCollaborativeWorkbook = async (schemeId) => {
  const res = await api.get("/scheme-answers/workbook/export", {
    params: { schemeId },
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "scheme-workbook.xlsx";
  link.click();

  window.URL.revokeObjectURL(url);
};
