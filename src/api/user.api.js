import api from "./axios";

/* CREATE USER */
export const createUser = async (payload) => {
  const res = await api.post("/users", payload);
  return res.data.data.item;
};

/* GET USERS */
export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data.data.items;
};

/* UPDATE STATUS */
export const updateUserStatus = async (id, isActive) => {
  const res = await api.patch(`/users/${id}/status`, { isActive });
  return res.data.data.item;
};

/* DELETE USER */
export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data.data.item;
};
