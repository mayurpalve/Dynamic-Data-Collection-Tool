import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Pencil } from "lucide-react";

import { getSchemeAnswers } from "../../api/schemeAnswer.api";
import { getAssignedSchemes } from "../../api/schemeAssignment.api";
import { getErrorMessage, showError } from "../../utils/toast";

export default function UserDashboard() {
  const [stats, setStats] = useState({
    assigned: 0,
    submitted: 0,
    editable: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const assignedRes = await getAssignedSchemes();
      const submissionsRes = await getSchemeAnswers();

      const assignedItems = assignedRes?.items || [];
      const submissionItems = submissionsRes?.items || [];

      const editable = submissionItems.filter(a => !a.hasEdited);

      setStats({
        assigned: assignedItems.length,
        submitted: submissionItems.length,
        editable: editable.length
      });

    } catch (err) {
      console.error("Dashboard load failed:", err);
      showError(getErrorMessage(err, "Failed to load dashboard"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">

      {/* PAGE HEADER */}
      <h1 className="text-2xl font-semibold mb-6">
        User Dashboard
      </h1>

      {/* LOADING */}
      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          {/* ================= STATS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-sm text-gray-500">Assigned Schemes</h3>
              <p className="text-3xl font-bold text-blue-700">
                {stats.assigned}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-sm text-gray-500">Submissions</h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.submitted}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-sm text-gray-500">Editable Left</h3>
              <p className="text-3xl font-bold text-orange-500">
                {stats.editable}
              </p>
            </div>

          </div>

        
         
        </>
      )}
    </div>
  );
}
