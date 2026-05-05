import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Eye, Filter, PencilLine } from "lucide-react";

import { getSchemeAnswers } from "../../api/schemeAnswer.api";
import { getSchemeDefinitionByScheme } from "../../api/schemeDefinition.api";
import { getErrorMessage, showError } from "../../utils/toast";

const buildDisplayFields = (definitionFields = [], data = {}) => {
  const orderedFields = Array.isArray(definitionFields)
    ? definitionFields.map((field) => ({
        key: field.key,
        label: field.label || field.key,
      }))
    : [];
  const seenKeys = new Set(orderedFields.map((field) => field.key));

  Object.keys(data || {}).forEach((key) => {
    if (seenKeys.has(key)) {
      return;
    }

    orderedFields.push({
      key,
      label: key,
    });
  });

  return orderedFields;
};

const getPreviewFields = (answer, fields) =>
  fields
    .map((field) => ({
      label: field.label,
      value: answer.data?.[field.key],
    }))
    .filter((item) => item.value !== undefined && item.value !== null && item.value !== "")
    .slice(0, 2);

export default function UserSubmissions() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [answers, setAnswers] = useState([]);
  const [definitionsByScheme, setDefinitionsByScheme] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);

  const selectedSchemeId = searchParams.get("schemeId") || "";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getSchemeAnswers();
      const items = res?.items || [];
      setAnswers(items);

      const schemeIds = [
        ...new Set(items.map((answer) => answer.scheme?._id).filter(Boolean)),
      ];

      const definitionResults = await Promise.all(
        schemeIds.map(async (schemeId) => {
          try {
            const definition = await getSchemeDefinitionByScheme(schemeId);
            return [schemeId, definition];
          } catch {
            return [schemeId, null];
          }
        })
      );

      setDefinitionsByScheme(Object.fromEntries(definitionResults));
    } catch (err) {
      console.error(err);
      showError(getErrorMessage(err, "Failed to load submissions"));
    } finally {
      setLoading(false);
    }
  };

  const filteredAnswers = useMemo(() => {
    if (!selectedSchemeId) {
      return answers;
    }

    return answers.filter((answer) => answer.scheme?._id === selectedSchemeId);
  }, [answers, selectedSchemeId]);

  const schemeOptions = useMemo(() => {
    const seen = new Map();

    answers.forEach((answer) => {
      if (answer.scheme?._id && !seen.has(answer.scheme._id)) {
        seen.set(answer.scheme._id, answer.scheme.name || "Unknown Scheme");
      }
    });

    return Array.from(seen.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [answers]);

  const toggleExpanded = (answerId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [answerId]: !prev[answerId],
    }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-6 lg:py-10">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-950">My Submissions</h1>
        <p className="mt-1 text-sm font-medium text-slate-700">
          View your saved entries, open row details, and use the one-time edit option.
        </p>
      </header>

      <div className="mb-6 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Submission Records</h2>
            <p className="mt-1 text-sm font-medium text-slate-700">
              Filter by scheme and review each submission in a cleaner table view.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <select
                className="rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-950 shadow-sm"
                value={selectedSchemeId}
                onChange={(e) => {
                  const nextSchemeId = e.target.value;
                  if (nextSchemeId) {
                    setSearchParams({ schemeId: nextSchemeId });
                    return;
                  }

                  setSearchParams({});
                }}
              >
                <option value="">All Schemes</option>
                {schemeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setSearchParams({})}
              className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              Reset
            </button>

            <button
              onClick={() => navigate("/user/assigned-schemes")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Add New Entry
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-300 bg-white p-6 text-center font-medium text-slate-600 shadow-sm">
          Loading submissions...
        </div>
      )}

      {!loading && filteredAnswers.length === 0 && (
        <div className="rounded-2xl border border-slate-300 bg-white p-8 text-center font-medium text-slate-600 shadow-sm">
          No submissions found
        </div>
      )}

      {!loading && filteredAnswers.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-200 text-slate-900">
              <tr>
                <th className="p-4 text-left font-semibold">Scheme</th>
                <th className="p-4 text-left font-semibold">Submitted At</th>
                <th className="p-4 text-left font-semibold">Preview</th>
                <th className="p-4 text-left font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredAnswers.map((answer) => {
                const definition = definitionsByScheme[answer.scheme?._id];
                const fields = buildDisplayFields(definition?.fields, answer.data);
                const previewFields = getPreviewFields(answer, fields);
                const isExpanded = !!expandedRows[answer._id];
                const filledFieldCount = fields.filter((field) => {
                  const value = answer.data?.[field.key];
                  return value !== undefined && value !== null && String(value).trim() !== "";
                }).length;

                return (
                  <Fragment key={answer._id}>
                    <tr className="border-t border-slate-200 align-top hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-medium text-slate-950">
                          {answer.scheme?.name || "Unknown Scheme"}
                        </div>
                        <button
                          onClick={() => toggleExpanded(answer._id)}
                          className="mt-2 inline-flex items-center gap-2 font-semibold text-slate-900 hover:text-blue-900 hover:underline"
                        >
                          <Eye size={15} />
                          {isExpanded ? "Hide Details" : "View Details"}
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </td>

                      <td className="whitespace-nowrap p-4 font-medium text-slate-700">
                        {new Date(answer.createdAt).toLocaleString()}
                      </td>

                      <td className="p-4">
                        {previewFields.length > 0 ? (
                          <div className="space-y-2">
                            {previewFields.map((item) => (
                              <div key={`${answer._id}-${item.label}`} className="text-slate-800">
                                <span className="font-medium">{item.label}:</span>{" "}
                                <span>{String(item.value)}</span>
                              </div>
                            ))}
                            <div className="text-xs font-medium text-slate-600">
                              Showing {previewFields.length} of {filledFieldCount} filled fields
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium text-slate-500">No preview data</span>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {!answer.hasEdited ? (
                          <button
                            onClick={() =>
                              navigate(`/user/submissions/edit/${answer._id}`)
                            }
                            className="inline-flex items-center gap-2 font-semibold text-slate-900 hover:text-blue-900 hover:underline"
                          >
                            <PencilLine size={15} />
                            Edit Once
                          </button>
                        ) : (
                          <span className="text-sm font-medium text-slate-500">Edit used</span>
                        )}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-100">
                        <td colSpan="4" className="p-4 border-t">
                          <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
                            <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
                              <h3 className="font-semibold text-slate-950">
                                Submission Details
                              </h3>
                              <p className="mt-1 text-sm font-medium text-slate-700">
                                Full entry data entered for this submission
                              </p>
                            </div>

                            <div className="border-b border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                              {filledFieldCount} of {fields.length} fields have values in this entry.
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3">
                              {fields.map((field, index) => (
                                <div
                                  key={`${answer._id}-${field.key}`}
                                  className={`border-b border-slate-200 px-4 py-3 ${
                                    index % 3 !== 2 ? "lg:border-r" : ""
                                  }`}
                                >
                                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                    {field.label}
                                  </div>
                                  <div className="mt-1 break-words whitespace-pre-wrap text-sm text-slate-950">
                                    {answer.data?.[field.key]
                                      ? String(answer.data[field.key])
                                      : "-"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
