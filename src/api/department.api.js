import api from "./axios";

export const getDepartments = async () => {
  const res = await api.get("/masters/departments");
  return res.data.data.items;
};

export const createDepartment = async (name) => {
  const res = await api.post("/masters/departments", { name });
  return res.data.data.item;
};

export const deleteDepartment = async (id) => {
  const res = await api.delete(`/masters/departments/${id}`);
  return res.data.data.item;
};
