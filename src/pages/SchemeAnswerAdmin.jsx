import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Eye, Search } from "lucide-react";
import { getSchemeAnswers } from "../api/schemeAnswer.api";
import { getSchemes } from "../api/scheme.api";
import { getAllSchemeDefinitions } from "../api/schemeDefinition.api";
import { getErrorMessage, showError } from "../utils/toast";

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

export default function SchemeAnswerAdmin() {
  const [answers, setAnswers] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [schemeId, setSchemeId] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = async (params = {}) => {
    setLoading(true);
    try {
      const [schemesRes, answersRes, definitionsRes] = await Promise.all([
        getSchemes(),
        getSchemeAnswers(params),
        getAllSchemeDefinitions(),
      ]);

      setSchemes(schemesRes || []);
      setAnswers(answersRes?.items || []);
      setDefinitions(definitionsRes || []);
    } catch (err) {
      console.error(err);
      showError(getErrorMessage(err, "Failed to load scheme submissions"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const definitionMap = useMemo(
    () =>
      Object.fromEntries(
        definitions
          .filter((definition) => definition.scheme?._id)
          .map((definition) => [definition.scheme._id, definition])
      ),
    [definitions]
  );

  const filteredAnswers = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return answers.filter((answer) => {
      if (schemeId && answer.scheme?._id !== schemeId) {
        return false;
      }

      if (sourceFilter && (answer.source || "ONLINE") !== sourceFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const userName = answer.filledBy?.name?.toLowerCase() || "";
      const userEmail = answer.filledBy?.email?.toLowerCase() || "";
      const schemeName = answer.scheme?.name?.toLowerCase() || "";
      const fieldValues = Object.values(answer.data || {})
        .map((value) => String(value).toLowerCase())
        .join(" ");

      return [userName, userEmail, schemeName, fieldValues].some((value) =>
        value.includes(normalizedSearch)
      );
    });
  }, [answers, schemeId, sourceFilter, searchText]);

  const toggleExpanded = (answerId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [answerId]: !prev[answerId],
    }));
  };

  const exportToExcel = async () => {
    if (!filteredAnswers.length) {
      showError("No data to export");
      return;
    }

    const XLSX = await import("xlsx");
    const fieldKeys = Array.from(
      new Set(filteredAnswers.flatMap((answer) => Object.keys(answer.data || {})))
    );

    const rows = filteredAnswers.map((answer) => {
      const row = {};

      fieldKeys.forEach((fieldKey) => {
        row[fieldKey] = answer.data?.[fieldKey] ?? "";
      });

      row["scheme name"] = answer.scheme?.name || "";
      row["user name"] = answer.filledBy?.name || "Public";
      row["email"] = answer.filledBy?.email || "";
      row["source"] = answer.source || "";
      row["created at"] = new Date(answer.createdAt).toLocaleString();
      row["edited at"] = answer.editedAt
        ? new Date(answer.editedAt).toLocaleString()
        : "";

      return row;
    });

    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Scheme Answers");
    XLSX.writeFile(book, "scheme-answers.xlsx");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-6 lg:py-10">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-950">Scheme Submissions</h1>
        <p className="mt-1 text-sm font-medium text-slate-700">
          Review visible submissions with richer details, source information, and full field-level inspection.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Visible Submissions</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{filteredAnswers.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Schemes</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{schemes.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Current Filter</p>
          <p className="mt-2 text-base font-semibold text-slate-950">
            {schemeId
              ? schemes.find((scheme) => scheme._id === schemeId)?.name || "Selected Scheme"
              : "All Schemes"}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Filter and Export</h2>
            <p className="mt-1 text-sm font-medium text-slate-700">
              Narrow records by scheme, source, or keyword and export only what is currently visible.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                className="rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-slate-950 shadow-sm"
                placeholder="Search user, scheme, or field value"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <select
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950 shadow-sm"
              value={schemeId}
              onChange={(e) => setSchemeId(e.target.value)}
            >
              <option value="">All Schemes</option>
              {schemes.map((scheme) => (
                <option key={scheme._id} value={scheme._id}>
                  {scheme.name}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950 shadow-sm"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="">All Sources</option>
              <option value="ONLINE">ONLINE</option>
              <option value="EXCEL">EXCEL</option>
              <option value="PUBLIC">PUBLIC</option>
            </select>

            <button
              onClick={exportToExcel}
              className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
            >
              Export Excel
            </button>

            <button
              onClick={() => {
                setSchemeId("");
                setSourceFilter("");
                setSearchText("");
              }}
              className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 font-medium text-slate-900 hover:bg-slate-100"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-200 text-slate-900">
            <tr>
              <th className="p-4 text-left font-semibold">Details</th>
              <th className="p-4 text-left font-semibold">Scheme</th>
              <th className="p-4 text-left font-semibold">Filled By</th>
              <th className="p-4 text-left font-semibold">Source</th>
              <th className="p-4 text-left font-semibold">Preview</th>
              <th className="p-4 text-left font-semibold">Submitted At</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="p-6 text-center font-medium text-slate-600">
                  Loading submissions...
                </td>
              </tr>
            )}

            {!loading && filteredAnswers.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center font-medium text-slate-600">
                  No submissions found
                </td>
              </tr>
            )}

            {filteredAnswers.map((answer) => {
              const definition = definitionMap[answer.scheme?._id];
              const fields = buildDisplayFields(definition?.fields, answer.data);
              const previewFields = fields
                .map((field) => ({
                  label: field.label,
                  value: answer.data?.[field.key],
                }))
                .filter((item) => item.value !== undefined && item.value !== null && item.value !== "")
                .slice(0, 2);
              const isExpanded = !!expandedRows[answer._id];
              const filledFieldCount = fields.filter((field) => {
                const value = answer.data?.[field.key];
                return value !== undefined && value !== null && String(value).trim() !== "";
              }).length;

              return (
                <Fragment key={answer._id}>
                  <tr className="border-t border-slate-200 align-top hover:bg-slate-50">
                    <td className="p-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleExpanded(answer._id)}
                        className="inline-flex items-center gap-2 font-semibold text-slate-900 hover:text-blue-900 hover:underline"
                      >
                        <Eye size={15} />
                        {isExpanded ? "Hide" : "View"}
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </td>
                    <td className="p-4 font-medium text-slate-950">
                      {answer.scheme?.name}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-950">
                        {answer.filledBy?.name || "Public"}
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-600">
                        {answer.filledBy?.email || ""}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-900">
                        {answer.source || "ONLINE"}
                      </span>
                    </td>
                    <td className="p-4">
                      {previewFields.length ? (
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
                    <td className="p-4 whitespace-nowrap font-medium text-slate-700">
                      {new Date(answer.createdAt).toLocaleString()}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-slate-100">
                      <td colSpan="6" className="border-t border-slate-200 p-4">
                        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
                          <div className="border-b border-slate-300 bg-slate-100 px-5 py-4">
                            <h3 className="font-semibold text-slate-950">
                              Submission Details
                            </h3>
                            <p className="mt-1 text-sm font-medium text-slate-700">
                              Full entry data plus audit metadata for this submission.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-4 border-b border-slate-300 bg-white p-5 md:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-xl border border-slate-300 bg-slate-100 p-4">
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Submission ID
                              </div>
                              <div className="mt-2 break-all text-sm text-slate-950">
                                {answer._id}
                              </div>
                            </div>
                            <div className="rounded-xl border border-slate-300 bg-slate-100 p-4">
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Filled By
                              </div>
                              <div className="mt-2 text-sm text-slate-950">
                                {answer.filledBy?.name || "Public"}
                              </div>
                              <div className="mt-1 text-xs font-medium text-slate-600">
                                {answer.filledBy?.email || "No email"}
                              </div>
                            </div>
                            <div className="rounded-xl border border-slate-300 bg-slate-100 p-4">
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Filled Fields
                              </div>
                              <div className="mt-2 text-sm text-slate-950">
                                {filledFieldCount} of {fields.length}
                              </div>
                            </div>
                            <div className="rounded-xl border border-slate-300 bg-slate-100 p-4">
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Timeline
                              </div>
                              <div className="mt-2 text-sm text-slate-950">
                                Submitted: {new Date(answer.createdAt).toLocaleString()}
                              </div>
                              <div className="mt-1 text-xs font-medium text-slate-600">
                                {answer.editedAt
                                  ? `Edited: ${new Date(answer.editedAt).toLocaleString()}`
                                  : "Edited: Not edited"}
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 lg:grid-cols-3">
                            {fields.map((field, index) => (
                              <div
                                key={`${answer._id}-${field.key}`}
                                className={`border-b border-slate-200 px-5 py-4 ${
                                  index % 3 !== 2 ? "lg:border-r" : ""
                                }`}
                              >
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                  {field.label}
                                </div>
                                <div className="mt-2 break-words whitespace-pre-wrap text-sm text-slate-950">
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
    </div>
  );
}
