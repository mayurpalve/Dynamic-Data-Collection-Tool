import { useEffect, useState } from "react";
import {
  getDepartments,
  createDepartment,
  deleteDepartment,
} from "../api/department.api";
import { useAuth } from "../auth/AuthContext";
import { getErrorMessage, showError, showSuccess } from "../utils/toast";

export default function Departments() {
  const { token } = useAuth();
  const isAuthenticated = !!token;

  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      showError(getErrorMessage(err, "Failed to load departments"));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadDepartments();
  }, [isAuthenticated]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createDepartment(name);
      setName("");
      await loadDepartments();
      showSuccess("Department added successfully");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to add department"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this department?")) return;
    try {
      await deleteDepartment(id);
      await loadDepartments();
      showSuccess("Department deleted successfully");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to delete department"));
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Departments</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Department name"
          className="w-full rounded border px-3 py-2 sm:max-w-xs"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-slate-200 text-slate-900">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="p-3">{d.name}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(d._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {departments.length === 0 && (
              <tr>
                <td colSpan="2" className="p-4 text-center font-medium text-slate-600">
                  No departments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
