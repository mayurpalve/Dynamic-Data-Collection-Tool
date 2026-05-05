import { useEffect, useState } from "react";
import { createScheme, deleteScheme, getSchemes, updateScheme } from "../api/scheme.api";
import { useAuth } from "../auth/AuthContext";
import { getErrorMessage, showError, showSuccess } from "../utils/toast";

const EMPTY_FORM = {
  name: "",
  description: "",
  status: "DRAFT",
  opensAt: "",
  closesAt: "",
};

const toDateTimeInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

export default function Schemes() {
  const { token } = useAuth();
  const isAuthenticated = !!token;

  const [schemes, setSchemes] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingSchemeId, setEditingSchemeId] = useState("");
  const [loading, setLoading] = useState(false);

  const loadSchemes = async () => {
    try {
      const data = await getSchemes();
      setSchemes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load schemes", err);
      setSchemes([]);
      showError(getErrorMessage(err, "Failed to load schemes"));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadSchemes();
  }, [isAuthenticated]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingSchemeId("");
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;

    setLoading(true);
    try {
      if (editingSchemeId) {
        await updateScheme(editingSchemeId, form);
        showSuccess("Scheme updated successfully");
      } else {
        await createScheme(form);
        showSuccess("Scheme created successfully");
      }

      resetForm();
      await loadSchemes();
    } catch (err) {
      showError(getErrorMessage(err, "Failed to save scheme"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (scheme) => {
    setEditingSchemeId(scheme._id);
    setForm({
      name: scheme.name || "",
      description: scheme.description || "",
      status: scheme.status || "DRAFT",
      opensAt: toDateTimeInputValue(scheme.opensAt),
      closesAt: toDateTimeInputValue(scheme.closesAt),
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this scheme?")) return;

    try {
      await deleteScheme(id);
      setSchemes((prev) => prev.filter((scheme) => scheme._id !== id));
      if (editingSchemeId === id) {
        resetForm();
      }
      showSuccess("Scheme deleted successfully");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to delete scheme"));
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Schemes</h1>

      <div className="mb-6 space-y-3 rounded bg-white p-4 shadow sm:p-6">
        <input
          className="border px-3 py-2 rounded w-full"
          placeholder="Scheme name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />

        <textarea
          className="border px-3 py-2 rounded w-full"
          placeholder="Scheme description"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            className="border px-3 py-2 rounded"
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value="DRAFT">DRAFT</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          <input
            type="datetime-local"
            className="border px-3 py-2 rounded"
            value={form.opensAt}
            onChange={(e) => setForm((prev) => ({ ...prev, opensAt: e.target.value }))}
          />

          <input
            type="datetime-local"
            className="border px-3 py-2 rounded"
            value={form.closesAt}
            onChange={(e) => setForm((prev) => ({ ...prev, closesAt: e.target.value }))}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editingSchemeId
              ? loading
                ? "Updating..."
                : "Update Scheme"
              : loading
              ? "Creating..."
              : "Create Scheme"}
          </button>

          {editingSchemeId && (
            <button
              onClick={resetForm}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded bg-white shadow">
        <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Window</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {schemes.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No schemes created yet
                </td>
              </tr>
            )}

            {schemes.map((scheme) => (
              <tr key={scheme._id} className="border-t">
                <td className="p-3">{scheme.name}</td>
                <td className="p-3">{scheme.description || "-"}</td>
                <td className="p-3">{scheme.status}</td>
                <td className="p-3 text-sm text-gray-600">
                  <div>Open: {scheme.opensAt ? new Date(scheme.opensAt).toLocaleString() : "Immediate"}</div>
                  <div>Close: {scheme.closesAt ? new Date(scheme.closesAt).toLocaleString() : "No close date"}</div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      onClick={() => handleEdit(scheme)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(scheme._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
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
