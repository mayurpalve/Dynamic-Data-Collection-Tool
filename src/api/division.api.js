import api from "./axios";

export const getDivisions = async () => {
  const res = await api.get("/masters/divisions");
  return res.data.data;
};

export const createDivision = async (name) => {
  const res = await api.post("/masters/divisions", { name });
  return res.data.data;
};

export const deleteDivision = async (id) => {
  await api.delete(`/masters/divisions/${id}`);
};
