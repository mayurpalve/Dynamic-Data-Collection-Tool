import { useEffect, useState } from "react";
import {
  getDivisions,
  createDivision,
  deleteDivision,
} from "../api/division.api";
import { useAuth } from "../auth/AuthContext";
import { getErrorMessage, showError, showSuccess } from "../utils/toast";

export default function Divisions() {
  const { token } = useAuth();
  const isAuthenticated = !!token;

  const [divisions, setDivisions] = useState([]);
  const [name, setName] = useState("");

  const loadDivisions = async () => {
    try {
      const data = await getDivisions();
      setDivisions(data);
    } catch (err) {
      showError(getErrorMessage(err, "Failed to load divisions"));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadDivisions();
  }, [isAuthenticated]);

  const addDivision = async () => {
    if (!name.trim()) return;
    try {
      await createDivision(name);
      setName("");
      await loadDivisions();
      showSuccess("Division added successfully");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to add division"));
    }
  };

  const removeDivision = async (id) => {
    if (!confirm("Delete this division?")) return;
    try {
      await deleteDivision(id);
      await loadDivisions();
      showSuccess("Division deleted successfully");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to delete division"));
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Divisions</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          className="w-full rounded border px-3 py-2 sm:max-w-xs"
          placeholder="Division name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={addDivision}
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
            {divisions.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="p-3">{d.name}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => removeDivision(d._id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {divisions.length === 0 && (
              <tr>
                <td colSpan="2" className="p-4 text-center font-medium text-slate-600">
                  No divisions found
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
