import api from "./axios";

/* GET ALL */
export const getAllSchemeDefinitions = async () => {
  const res = await api.get("/scheme-definitions");
  return res.data.data.items;
};

/* GET BY SCHEME ID */
export const getSchemeDefinitionByScheme = async (schemeId) => {
  if (!schemeId) return null;
  const res = await api.get(`/scheme-definitions/by-scheme/${schemeId}`);
  return res.data.data.item;
};

/* SAVE */
export const saveSchemeDefinition = async (payload) => {
  const res = await api.post("/scheme-definitions", payload);
  return res.data.data.item;
};

/* DELETE */
export const deleteSchemeDefinition = async (id) => {
  const res = await api.delete(`/scheme-definitions/${id}`);
  return res.data.data.item;
};

/* ASSIGN */
export const assignSchemeToUser = async ({ userId, schemeDefinitionId }) => {
  const res = await api.post("/scheme-definitions/assign-user", {
    userId,
    schemeDefinitionId,
  });
  return res.data.data.item;
};

/* EXPORT */
export const exportSchemeTemplate = async (id) => {
  const res = await api.get(`/scheme-definitions/${id}/export-template`, {
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "scheme-template.xlsx";
  link.click();
  window.URL.revokeObjectURL(url);
};

/* PUBLIC LINK (SPECIAL CASE) */
export const getSchemeDefinitionByPublicLink = async (publicLinkId) => {
  const res = await api.get(`/public/scheme/${publicLinkId}`);
  return res.data.data; // backend sends definition directly
};
