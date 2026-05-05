import api from "./axios";

export const getAssignedSchemes = async () => {
  const res = await api.get("/scheme-assignments/my");
  return res.data.data;
};

export const assignScheme = async ({
  schemeId,
  targetUserId,
  editableFields = [],
}) => {
  const res = await api.post("/scheme-assignments", {
    schemeId,
    targetUserId,
    editableFields,
  });

  return res.data.data.item;
};

export const getSchemeAssignmentsByScheme = async (schemeId) => {
  const res = await api.get(`/scheme-assignments/scheme/${schemeId}`);
  return res.data.data;
};

export const updateSchemeAssignment = async ({
  assignmentId,
  editableFields = [],
}) => {
  const res = await api.put(`/scheme-assignments/${assignmentId}`, {
    editableFields,
  });
  return res.data.data.item;
};

export const revokeSchemeAssignment = async (assignmentId) => {
  const res = await api.delete(`/scheme-assignments/${assignmentId}`);
  return res.data.data.item;
};
