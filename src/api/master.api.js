import api from "./axios";

/* DEPARTMENTS */
export const getDepartments = async () => {
  const res = await api.get("/masters/departments");
  return res.data.data.items;
};

/* DIVISIONS */
export const getDivisions = async () => {
  const res = await api.get("/masters/divisions");
  return res.data.data.items;
};

/* DISTRICTS */
export const getDistricts = async () => {
  const res = await api.get("/masters/districts");
  return res.data.data.items;
};

/* TALUKAS */
export const getTalukas = async () => {
  const res = await api.get("/masters/talukas");
  return res.data.data.items;
};

/* REGIONS */
export const getRegions = async () => {
  const res = await api.get("/masters/regions");
  return res.data.data.items;
};
