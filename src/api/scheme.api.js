import api from "./axios";

export const getSchemes = async () => {
  const res = await api.get("/schemes");
  return res.data.data.items;
};

export const createScheme = async (payload) => {
  const res = await api.post("/schemes", payload);
  return res.data.data.item;
};

export const updateScheme = async (id, payload) => {
  const res = await api.put(`/schemes/${id}`, payload);
  return res.data.data.item;
};

export const deleteScheme = async (id) => {
  const res = await api.delete(`/schemes/${id}`);
  return res.data;
};
