import api from "./axios";

export const getDashboardStats = async () => {
  const [schemesRes, departmentsRes] = await Promise.all([
    api.get("/schemes"),
    api.get("/masters/departments"),
  ]);

  return {
    totalSchemes: schemesRes.data.data.items.length,
    departments: departmentsRes.data.data.items.length,
    totalSubmissions: 0,
  };
};
