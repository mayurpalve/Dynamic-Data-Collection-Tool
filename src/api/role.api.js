import api from "./axios";

export const createRole = async (payload) => {
  const res = await api.post("/roles", payload);
  return res.data.data.item;
};

export const getRoles = async () => {
  const res = await api.get("/roles");
  return res.data.data.items;
};

export const updateRole = async (id, payload) => {
  const res = await api.put(`/roles/${id}`, payload);
  return res.data.data.item;
};

export const deleteRole = async (id) => {
  const res = await api.delete(`/roles/${id}`);
  return res.data.data.item;
};
