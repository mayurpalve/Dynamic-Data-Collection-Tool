import { useEffect, useState } from "react";
import { getSchemes } from "../api/scheme.api";
import { getSchemeDefinitionByScheme } from "../api/schemeDefinition.api";
import {
  submitSchemeAnswer,
  importCollaborativeWorkbook,
  exportCollaborativeWorkbook,
} from "../api/schemeAnswer.api";
import { getErrorMessage, showError, showSuccess } from "../utils/toast";

export default function SchemeAnswer() {
  const [schemes, setSchemes] = useState([]);
  const [schemeId, setSchemeId] = useState("");
  const [definition, setDefinition] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getSchemes();
      setSchemes(Array.isArray(res) ? res : []);
    })();
  }, []);

  useEffect(() => {
    if (!schemeId) {
      setDefinition(null);
      return;
    }

    (async () => {
      const def = await getSchemeDefinitionByScheme(schemeId);
      if (!def || !Array.isArray(def.fields)) {
        setDefinition(null);
        return;
      }

      setDefinition(def);
      setAnswers({});
    })();
  }, [schemeId]);

  const getInputType = (type) => {
    if (type === "DATE") return "date";
    if (type === "NUMBER" || type === "AMOUNT") return "number";
    return "text";
  };

  const handleChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const exportTemplate = async () => {
    if (!definition) return;

    const XLSX = await import("xlsx");
    const headerRow = {};

    definition.fields.forEach((field) => {
      headerRow[field.label] = "";
    });

    const sheet = XLSX.utils.json_to_sheet([headerRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Template");
    XLSX.writeFile(wb, "scheme-template.xlsx");
  };

  const handleImport = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file || !definition) return;

    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const metadataSheet = wb.Sheets["__meta"];
    const rows = XLSX.utils.sheet_to_json(sheet);
    const metadataRows = metadataSheet
      ? XLSX.utils.sheet_to_json(metadataSheet)
      : [];

    if (!rows.length) {
      showError("Excel is empty");
      input.value = "";
      return;
    }

    const labelMap = {};
    definition.fields.forEach((field) => {
      labelMap[field.label.trim().toLowerCase()] = field;
    });

    const workbookRows = [];
    const seenNewRows = new Set();

    for (const [index, row] of rows.entries()) {
      const record = {};
      const metadataRow = metadataRows.find(
        (item) => Number(item.__rowNumber) === index + 1
      );
      const metadata = {};

      if (metadataRow?.__rowId) metadata.__rowId = metadataRow.__rowId;
      if (metadataRow?.__ownerUserId) {
        metadata.__ownerUserId = metadataRow.__ownerUserId;
      }

      for (const [columnName, value] of Object.entries(row)) {
        const field = labelMap[columnName.trim().toLowerCase()];
        if (!field) continue;

        const normalizedValue =
          typeof value === "string" ? value.trim() : value;

        if (
          normalizedValue === undefined ||
          normalizedValue === null ||
          normalizedValue === ""
        ) {
          continue;
        }

        record[field.key] = normalizedValue;
      }

      if (!metadata.__rowId) {
        const hash = JSON.stringify(record);
        if (seenNewRows.has(hash)) continue;
        seenNewRows.add(hash);
      }

      workbookRows.push({
        ...metadata,
        ...record,
      });
    }

    if (!workbookRows.length) {
      showError("No valid rows found");
      input.value = "";
      return;
    }

    setLoading(true);
    try {
      const summary = await importCollaborativeWorkbook({
        schemeId,
        rows: workbookRows,
      });

      await exportCollaborativeWorkbook(schemeId);
      showSuccess(
        `Import complete. Added ${summary.inserted || 0} row(s), updated ${summary.updated || 0} row(s), skipped ${summary.skipped || 0} row(s). A refreshed shared workbook has been downloaded.`
      );
    } catch (err) {
      showError(getErrorMessage(err, "Import failed"));
    } finally {
      setLoading(false);
      input.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!schemeId || !definition) {
      showError("Select scheme first");
      return;
    }

    setLoading(true);
    try {
      await submitSchemeAnswer({
        schemeId,
        data: answers,
        source: "ONLINE",
      });

      showSuccess("Scheme submitted successfully");
      setSchemeId("");
      setDefinition(null);
      setAnswers({});
    } catch (err) {
      showError(getErrorMessage(err, "Submission failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Scheme Answer</h1>

      <select
        className="mb-6 w-full rounded border p-2 sm:max-w-md"
        value={schemeId}
        onChange={(e) => setSchemeId(e.target.value)}
      >
        <option value="">Select Scheme</option>
        {schemes.map((scheme) => (
          <option key={scheme._id} value={scheme._id}>
            {scheme.name}
          </option>
        ))}
      </select>

      {definition && (
        <div className="w-full max-w-4xl rounded bg-white p-4 shadow sm:p-6">
          {definition.fields.map((field) => (
            <div key={field.key} className="mb-4">
              <label className="block mb-1 font-medium">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>

              <input
                type={getInputType(field.type)}
                className="border p-2 rounded w-full"
                value={answers[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            </div>
          ))}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={exportTemplate}
              className="rounded bg-gray-600 px-4 py-2 text-white"
            >
              Export Template
            </button>

            <button
              onClick={() => exportCollaborativeWorkbook(schemeId)}
              className="rounded bg-slate-800 px-4 py-2 text-white"
            >
              Export Shared Excel
            </button>

            <label className="cursor-pointer rounded bg-gray-500 px-4 py-2 text-white">
              Import Excel
              <input
                type="file"
                accept=".xlsx"
                hidden
                onChange={handleImport}
              />
            </label>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded bg-blue-600 px-6 py-2 text-white"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
