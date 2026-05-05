import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { createUser, getUsers } from "../api/user.api";
import { getSchemes } from "../api/scheme.api";
import {
  assignScheme,
  getSchemeAssignmentsByScheme,
  revokeSchemeAssignment,
  updateSchemeAssignment,
} from "../api/schemeAssignment.api";
import {
  getAllSchemeDefinitions,
  exportSchemeTemplate,
} from "../api/schemeDefinition.api";
import { getErrorMessage, showError, showSuccess } from "../utils/toast";

export default function UserManagement() {
  const { role: currentRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [schemeDefs, setSchemeDefs] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState("");
  const [selectedEditableFields, setSelectedEditableFields] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [editingAssignmentId, setEditingAssignmentId] = useState("");
  const [editingEditableFields, setEditingEditableFields] = useState([]);
  const [assignmentActionLoading, setAssignmentActionLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const availableRoles =
    currentRole === "SUPER_ADMIN"
      ? ["ADMIN"]
      : currentRole === "ADMIN"
        ? ["USER"]
        : [];

  const loadData = async () => {
    try {
      const [u, s, d] = await Promise.all([
        getUsers(),
        getSchemes(),
        getAllSchemeDefinitions(),
      ]);

      setUsers(u || []);
      setSchemes(s || []);
      setSchemeDefs(d || []);
    } catch (err) {
      showError(getErrorMessage(err, "Failed to load data"));
    }
  };

  const reloadAssignments = async () => {
    if (!selectedSchemeId) return;

    const data = await getSchemeAssignmentsByScheme(selectedSchemeId);
    setAssignedUsers(data.items || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedSchemeId) {
      setAssignedUsers([]);
      setEditingAssignmentId("");
      setEditingEditableFields([]);
      return;
    }

    (async () => {
      try {
        const data = await getSchemeAssignmentsByScheme(selectedSchemeId);
        setAssignedUsers(data.items || []);
      } catch (err) {
        showError(getErrorMessage(err, "Failed to load assignments"));
      }
    })();
  }, [selectedSchemeId]);

  useEffect(() => {
    setSelectedEditableFields([]);
    setEditingAssignmentId("");
    setEditingEditableFields([]);
  }, [selectedSchemeId]);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password || !form.role) {
      return showError("All fields are required");
    }

    try {
      await createUser(form);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "",
      });
      await loadData();
      showSuccess("User created successfully");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to create user"));
    }
  };

  const handleAssign = async () => {
    if (!selectedUserIds.length || !selectedSchemeId) {
      return showError("Select users and scheme");
    }

    try {
      for (const userId of selectedUserIds) {
        await assignScheme({
          schemeId: selectedSchemeId,
          targetUserId: userId,
          editableFields: selectedEditableFields,
        });
      }

      showSuccess("Scheme assigned successfully");
      setSelectedUserIds([]);
      await reloadAssignments();
    } catch (err) {
      showError(getErrorMessage(err, "Assignment failed"));
    }
  };

  const startEditingAssignment = (assignment) => {
    setEditingAssignmentId(assignment._id);
    setEditingEditableFields(assignment.editableFields || []);
  };

  const cancelEditingAssignment = () => {
    setEditingAssignmentId("");
    setEditingEditableFields([]);
  };

  const handleUpdateAssignment = async () => {
    if (!editingAssignmentId) return;

    try {
      setAssignmentActionLoading(true);
      await updateSchemeAssignment({
        assignmentId: editingAssignmentId,
        editableFields: editingEditableFields,
      });
      await reloadAssignments();
      cancelEditingAssignment();
      showSuccess("Assignment updated successfully");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to update assignment"));
    } finally {
      setAssignmentActionLoading(false);
    }
  };

  const handleRevokeAssignment = async (assignmentId) => {
    try {
      setAssignmentActionLoading(true);
      await revokeSchemeAssignment(assignmentId);
      await reloadAssignments();
      if (editingAssignmentId === assignmentId) {
        cancelEditingAssignment();
      }
      showSuccess("Assignment revoked successfully");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to revoke assignment"));
    } finally {
      setAssignmentActionLoading(false);
    }
  };

  const selectedDef = schemeDefs.find(
    (definition) => definition.scheme?._id === selectedSchemeId
  );
  const isSharedMode = selectedEditableFields.length > 0;

  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm font-medium text-slate-700">
          Create users and assign schemes with either full access or shared field-level access.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Create User</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="rounded-lg border border-slate-300 p-3 shadow-sm"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="rounded-lg border border-slate-300 p-3 shadow-sm"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            className="rounded-lg border border-slate-300 p-3 shadow-sm"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            className="rounded-lg border border-slate-300 p-3 shadow-sm"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="">Select Role</option>
            {availableRoles.map((roleName) => (
              <option key={roleName} value={roleName}>
                {roleName}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCreate}
          className="mt-5 rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-white hover:bg-slate-800"
        >
          Create User
        </button>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Assign Scheme</h2>
          <p className="text-sm font-medium text-slate-700">
            Choose the scheme, then decide whether users should fill the full form or only selected fields.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Select Users
            </label>
            <select
              multiple
              className="h-48 w-full rounded-lg border border-slate-300 p-3 text-slate-950 shadow-sm"
              value={selectedUserIds}
              onChange={(e) =>
                setSelectedUserIds(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
            >
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs font-medium text-slate-600">
              Hold `Ctrl` or `Cmd` to select multiple users.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Select Scheme
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 p-3 text-slate-950 shadow-sm"
              value={selectedSchemeId}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
            >
              <option value="">Select Scheme</option>
              {schemes.map((scheme) => (
                <option key={scheme._id} value={scheme._id}>
                  {scheme.name}
                </option>
              ))}
            </select>

            {selectedDef && (
              <div className="mt-4 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-950">
                  Assignment Modes
                </p>
                <p className="mt-1 text-sm text-slate-800">
                  `Full Form Access`: leave all fields unchecked. User can create complete entries normally.
                </p>
                <p className="mt-1 text-sm text-slate-800">
                  `Shared Field Access`: select fields below. Admin creates starter rows first, then user fills only those fields.
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedDef?.fields?.length > 0 && (
          <div className="mb-5 rounded-2xl border border-slate-300 bg-slate-100 p-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Editable Fields
                </p>
                <p className="mt-1 text-xs font-medium text-slate-700">
                  Leave all unchecked for normal access, or select fields for shared contribution mode.
                </p>
              </div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  isSharedMode
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {isSharedMode ? "Shared Field Access" : "Full Form Access"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedDef.fields.map((field) => (
                <label
                  key={field.key}
                  className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedEditableFields.includes(field.key)}
                    onChange={(e) =>
                      setSelectedEditableFields((prev) =>
                        e.target.checked
                          ? [...prev, field.key]
                          : prev.filter((key) => key !== field.key)
                      )
                    }
                  />
                  <span>{field.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAssign}
            className="rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-white hover:bg-slate-800"
          >
            Assign Scheme
          </button>

          {selectedDef && (
            <button
              onClick={() => exportSchemeTemplate(selectedDef._id)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-6 py-2.5 font-medium text-slate-900 hover:bg-slate-100"
            >
              Export Template
            </button>
          )}
        </div>
      </div>

      {assignedUsers.length > 0 && (
        <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-1 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Assigned Users</h2>
            <p className="text-sm font-medium text-slate-700">
              Review current access, update shared-field permissions, revoke assignments, and inspect the assignment trail.
            </p>
          </div>

          {editingAssignmentId && selectedDef?.fields?.length > 0 && (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Edit Assignment Access
                  </p>
                  <p className="text-xs text-amber-800 mt-1">
                    Leave all unchecked for full form access, or select fields to keep this user in shared field mode.
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                  {editingEditableFields.length ? "Shared Field Access" : "Full Form Access"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedDef.fields.map((field) => (
                  <label
                    key={`edit-${field.key}`}
                    className="flex items-center gap-3 rounded-lg border border-amber-100 bg-white px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={editingEditableFields.includes(field.key)}
                      onChange={(e) =>
                        setEditingEditableFields((prev) =>
                          e.target.checked
                            ? [...prev, field.key]
                            : prev.filter((key) => key !== field.key)
                        )
                      }
                    />
                    <span>{field.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleUpdateAssignment}
                  disabled={assignmentActionLoading}
                  className="bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-60"
                >
                  Save Assignment
                </button>
                <button
                  onClick={cancelEditingAssignment}
                  disabled={assignmentActionLoading}
                  className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-white disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-200 text-slate-900">
                <tr>
                  <th className="p-3 text-left font-semibold">User</th>
                  <th className="p-3 text-left font-semibold">Email</th>
                  <th className="p-3 text-left font-semibold">Access Type</th>
                  <th className="p-3 text-left font-semibold">Assigned By</th>
                  <th className="p-3 text-left font-semibold">Audit Trail</th>
                  <th className="p-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedUsers.map((assignment) => (
                  <tr key={assignment._id} className="border-t">
                    <td className="p-3 font-medium text-gray-900">
                      {assignment.assignedTo?.name}
                    </td>
                    <td className="p-3 text-slate-700">
                      {assignment.assignedTo?.email}
                    </td>
                    <td className="p-3">
                      {assignment.editableFields?.length ? (
                        <div className="space-y-1">
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Shared Field Access
                          </span>
                          <div className="text-xs font-medium text-slate-700">
                            {assignment.editableFields.join(", ")}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          Full Form Access
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700">
                      <div className="font-medium text-gray-900">
                        {assignment.assignedBy?.name || "-"}
                      </div>
                      <div className="mt-1 text-xs font-medium text-slate-600">
                        {assignment.assignedBy?.email || ""}
                      </div>
                    </td>
                    <td className="whitespace-nowrap p-3 text-xs font-medium text-slate-700">
                      <div>Assigned: {new Date(assignment.createdAt).toLocaleString()}</div>
                      <div className="mt-1">
                        Updated: {new Date(assignment.updatedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => startEditingAssignment(assignment)}
                          disabled={assignmentActionLoading}
                          className="border border-amber-300 text-amber-700 px-3 py-1.5 rounded-lg font-medium hover:bg-amber-50 disabled:opacity-60"
                        >
                          Edit Access
                        </button>
                        <button
                          onClick={() => handleRevokeAssignment(assignment._id)}
                          disabled={assignmentActionLoading}
                          className="border border-red-300 text-red-700 px-3 py-1.5 rounded-lg font-medium hover:bg-red-50 disabled:opacity-60"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
