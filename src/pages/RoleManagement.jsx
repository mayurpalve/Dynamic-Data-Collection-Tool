import { useEffect, useState } from "react";
import { createRole, getRoles, deleteRole, updateRole } from "../api/role.api";
import { getErrorMessage, showError, showSuccess } from "../utils/toast";

const PERMISSIONS = [
  "USER_MANAGE",
  "MASTER_MANAGE",
  "SCHEME_CREATE",
  "SCHEME_EDIT",
  "SCHEME_VIEW",
  "SCHEME_ASSIGN",
  "SCHEME_ANSWER",
  "EXCEL_IMPORT",
  "EXCEL_EXPORT",
];

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editPermissions, setEditPermissions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getRoles();
        setRoles(data || []);
      } catch (err) {
        showError(getErrorMessage(err, "Failed to load roles"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const togglePermission = (perm) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleCreateRole = async () => {
    if (!roleName) return showError("Role name required");

    try {
      await createRole({ name: roleName, permissions });
      setRoleName("");
      setPermissions([]);
      setRoles(await getRoles());
      showSuccess("Role created successfully");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to create role"));
    }
  };

  const startEdit = (role) => {
    setEditingRoleId(role._id);
    setEditPermissions(role.permissions);
  };

  const toggleEditPermission = (perm) => {
    setEditPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const saveEdit = async (roleId) => {
    try {
      await updateRole(roleId, { permissions: editPermissions });
      setEditingRoleId(null);
      setEditPermissions([]);
      setRoles(await getRoles());
      showSuccess("Role updated successfully");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to update role"));
    }
  };

  const cancelEdit = () => {
    setEditingRoleId(null);
    setEditPermissions([]);
  };

  const handleDeleteRole = async (id) => {
    if (!confirm("Delete this role?")) return;

    try {
      await deleteRole(id);
      setRoles((prev) => prev.filter((role) => role._id !== id));
      showSuccess("Role deleted successfully");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to delete role"));
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Role Management</h1>

      <div className="mb-10 rounded bg-white p-4 shadow sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">Create Role</h2>

        <input
          className="border p-2 rounded w-full mb-4"
          placeholder="User"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value.toUpperCase())}
        />

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {PERMISSIONS.map((perm) => (
            <label key={perm} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={permissions.includes(perm)}
                onChange={() => togglePermission(perm)}
              />
              {perm}
            </label>
          ))}
        </div>

        <button
          onClick={handleCreateRole}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Create Role
        </button>
      </div>

      <div className="overflow-hidden rounded bg-white shadow">
        <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Permissions</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="3" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && roles.length === 0 && (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  No roles found
                </td>
              </tr>
            )}

            {roles.map((role) => (
              <tr key={role._id} className="border-t align-top">
                <td className="p-3 font-medium">{role.name}</td>

                <td className="p-3 text-sm">
                  {editingRoleId === role._id ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {PERMISSIONS.map((perm) => (
                        <label key={perm} className="flex gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={editPermissions.includes(perm)}
                            onChange={() => toggleEditPermission(perm)}
                          />
                          {perm}
                        </label>
                      ))}
                    </div>
                  ) : (
                    role.permissions.map((permission, index) => (
                      <div key={index}>- {permission}</div>
                    ))
                  )}
                </td>

                <td className="p-3 text-right">
                  {editingRoleId === role._id ? (
                    <div className="flex flex-wrap justify-end gap-3">
                      <button
                        onClick={() => saveEdit(role._id)}
                        className="text-green-600 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap justify-end gap-3">
                      <button
                        onClick={() => startEdit(role)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
