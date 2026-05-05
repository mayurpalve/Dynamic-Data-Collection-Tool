import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAssignedSchemes } from "../../api/schemeAssignment.api";
import { getSchemeAnswers } from "../../api/schemeAnswer.api";
import { getErrorMessage, showError } from "../../utils/toast";

export default function UserAssignedSchemes() {
  const navigate = useNavigate();

  const [schemes, setSchemes] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const assigned = await getAssignedSchemes();
      const submissions = await getSchemeAnswers();

      setSchemes(assigned.items || []);
      setAnswers(submissions.items || []);
    } catch (err) {
      console.error(err);
      showError(getErrorMessage(err, "Failed to load assigned schemes"));
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionCount = (schemeId) =>
    answers.filter((answer) => answer.scheme?._id === schemeId).length;

  const summary = useMemo(
    () => ({
      totalSchemes: schemes.length,
      totalEntries: answers.length,
      sharedSchemes: schemes.filter(
        (item) => Array.isArray(item.editableFields) && item.editableFields.length > 0
      ).length,
    }),
    [answers.length, schemes]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-6 lg:py-10">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-950">Assigned Schemes</h1>
        <p className="mt-1 text-sm font-medium text-slate-700">
          Open a scheme, add entries, or continue shared contribution work assigned to you.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Assigned Schemes</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{summary.totalSchemes}</p>
        </div>
        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">My Entries</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{summary.totalEntries}</p>
        </div>
        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Shared Schemes</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{summary.sharedSchemes}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-300 bg-slate-100 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-950">Available Schemes</h2>
          <p className="mt-1 text-sm font-medium text-slate-700">
            Normal schemes allow full submission. Shared schemes let you update only assigned fields.
          </p>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-200 text-slate-900">
            <tr>
              <th className="p-4 text-left font-semibold">Scheme</th>
              <th className="p-4 text-left font-semibold">Access</th>
              <th className="p-4 text-left font-semibold">Entries</th>
              <th className="p-4 text-left font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="p-6 text-center font-medium text-slate-600">
                  Loading assigned schemes...
                </td>
              </tr>
            )}

            {!loading && schemes.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center font-medium text-slate-600">
                  No schemes assigned
                </td>
              </tr>
            )}

            {schemes.map((assignment) => {
              const submissionCount = getSubmissionCount(assignment.scheme._id);
              const hasFieldRestrictions =
                Array.isArray(assignment.editableFields) &&
                assignment.editableFields.length > 0;

              return (
                <tr key={assignment._id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-medium text-slate-950">
                      {assignment.scheme?.name}
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-700">
                      {hasFieldRestrictions
                        ? "Admin-created starter rows are required for this shared workflow."
                        : "You can fill and save full entries for this scheme."}
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        hasFieldRestrictions
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {hasFieldRestrictions ? "Shared Field Access" : "Full Form Access"}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="font-semibold text-slate-900">
                      {submissionCount}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          navigate("/user/scheme-answer", {
                            state: { schemeId: assignment.scheme._id },
                          })
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        {hasFieldRestrictions ? "Open Scheme" : "Add Entry"}
                      </button>

                      {submissionCount > 0 && (
                        <button
                          onClick={() =>
                            navigate(
                              `/user/submissions?schemeId=${assignment.scheme._id}`
                            )
                          }
                          className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
                        >
                          View Entries
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
