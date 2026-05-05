import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { FileDown, FileUp, Lock, Plus, Save, Send } from "lucide-react";

import {
  getSchemeDefinitionByScheme,
  exportSchemeTemplate,
} from "../../api/schemeDefinition.api";
import { getAssignedSchemes } from "../../api/schemeAssignment.api";
import {
  exportCollaborativeWorkbook,
  getCollaborativeSchemeRows,
  getSchemeAnswers,
  importCollaborativeWorkbook,
  submitSchemeAnswer,
  updateCollaborativeSchemeRow,
} from "../../api/schemeAnswer.api";
import { getErrorMessage, showError, showSuccess } from "../../utils/toast";

export default function UserSchemeAnswer() {
  const location = useLocation();
  const navigate = useNavigate();
  const schemeId = location.state?.schemeId;

  const [definition, setDefinition] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [entryRows, setEntryRows] = useState([{}]);
  const [tableRows, setTableRows] = useState([]);
  const [draftRows, setDraftRows] = useState({});
  const [savingRowId, setSavingRowId] = useState("");
  const [submittingRowIndex, setSubmittingRowIndex] = useState(-1);
  const [savingAllRows, setSavingAllRows] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schemeId) {
      navigate("/user/assigned-schemes");
      return;
    }

    void loadPage();
  }, [schemeId, navigate]);

  const editableFields = useMemo(
    () => new Set(assignment?.editableFields || []),
    [assignment]
  );
  const isFieldLevelMode = editableFields.size > 0;
  const editableFieldKeys = useMemo(
    () =>
      definition?.fields
        ?.filter((field) => editableFields.has(field.key))
        .map((field) => field.key) || [],
    [definition, editableFields]
  );

  const parseClipboardGrid = (text) =>
    text
      .replace(/\r\n/g, "\n")
      .split("\n")
      .filter((row) => row.length > 0)
      .map((row) => row.split("\t"));

  const loadPage = async () => {
    try {
      const [def, assignmentsData] = await Promise.all([
        getSchemeDefinitionByScheme(schemeId),
        getAssignedSchemes(),
      ]);

      setDefinition(def);

      const matchedAssignment = (assignmentsData?.items || []).find(
        (item) => item.scheme?._id === schemeId
      );
      setAssignment(matchedAssignment || null);

      if (matchedAssignment?.editableFields?.length) {
        const collaborativeData = await getCollaborativeSchemeRows(schemeId);
        const items = collaborativeData?.items || [];
        setTableRows(items);
        setDraftRows(
          Object.fromEntries(items.map((item) => [item._id, { ...item.data }]))
        );
      } else {
        const ownAnswers = await getSchemeAnswers({ schemeId });
        const items = ownAnswers?.items || [];
        setTableRows(items);
      }
    } catch (err) {
      showError(getErrorMessage(err, "Failed to load scheme form"));
    } finally {
      setLoading(false);
    }
  };

  const handleExportTemplate = () => {
    exportSchemeTemplate(definition._id);
  };

  const handleImport = async (e) => {
    const input = e.target;
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const metadataSheet = workbook.Sheets["__meta"];
      const rows = XLSX.utils.sheet_to_json(sheet);
      const metadataRows = metadataSheet
        ? XLSX.utils.sheet_to_json(metadataSheet)
        : [];

      if (!rows.length) {
        showError("Excel is empty");
        input.value = "";
        return;
      }

      try {
        const workbookRows = [];
        const seenNewRows = new Set();

        rows.forEach((row, index) => {
          const mappedRow = {};
          const metadataRow = metadataRows.find(
            (item) => Number(item.__rowNumber) === index + 1
          );
          const metadata = {};

          if (metadataRow?.__rowId) metadata.__rowId = metadataRow.__rowId;
          if (metadataRow?.__ownerUserId) {
            metadata.__ownerUserId = metadataRow.__ownerUserId;
          }

          definition.fields.forEach((field) => {
            const value = row[field.label];
            const normalizedValue =
              typeof value === "string" ? value.trim() : value;

            if (
              normalizedValue === undefined ||
              normalizedValue === null ||
              normalizedValue === ""
            ) {
              return;
            }

            mappedRow[field.key] = normalizedValue;
          });

          const hasValues = definition.fields.some((field) => {
            const value = mappedRow[field.key];
            return (
              value !== undefined &&
              value !== null &&
              String(value).trim() !== ""
            );
          });

          if (!hasValues) return;

          if (!metadata.__rowId) {
            const hash = JSON.stringify(mappedRow);
            if (seenNewRows.has(hash)) return;
            seenNewRows.add(hash);
          }

          workbookRows.push({
            ...metadata,
            ...mappedRow,
          });
        });

        if (!workbookRows.length) {
          showError("No valid rows found");
          input.value = "";
          return;
        }

        const summary = await importCollaborativeWorkbook({
          schemeId,
          rows: workbookRows,
        });

        await exportCollaborativeWorkbook(schemeId);
        if (isFieldLevelMode) {
          const collaborativeData = await getCollaborativeSchemeRows(schemeId);
          const items = collaborativeData?.items || [];
          setTableRows(items);
          setDraftRows(
            Object.fromEntries(items.map((item) => [item._id, { ...item.data }]))
          );
        }

        showSuccess(
          `Import complete. Added ${summary.inserted || 0} row(s), updated ${summary.updated || 0} row(s), skipped ${summary.skipped || 0} row(s). A refreshed shared workbook has been downloaded.`
        );
        if (!isFieldLevelMode) {
          navigate("/user/submissions");
        }
      } catch (err) {
        console.error(err);
        showError(getErrorMessage(err, "Import failed"));
      } finally {
        input.value = "";
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleEntryRowSubmit = async (rowIndex) => {
    const rowData = entryRows[rowIndex] || {};

    try {
      setSubmittingRowIndex(rowIndex);
      await submitSchemeAnswer({
        schemeId,
        data: rowData,
      });

      showSuccess("Submitted successfully");
      setEntryRows((prev) => {
        const next = prev.filter((_, index) => index !== rowIndex);
        return next.length ? next : [{}];
      });
      const ownAnswers = await getSchemeAnswers({ schemeId });
      setTableRows(ownAnswers?.items || []);
    } catch (err) {
      showError(getErrorMessage(err, "Submission failed"));
    } finally {
      setSubmittingRowIndex(-1);
    }
  };

  const handleEntryChange = (rowIndex, fieldKey, value) => {
    setEntryRows((prev) => {
      const next = [...prev];
      next[rowIndex] = {
        ...(next[rowIndex] || {}),
        [fieldKey]: value,
      };
      return next;
    });
  };

  const addEntryRow = () => {
    setEntryRows((prev) => [...prev, {}]);
  };

  const handleFullAccessPaste = (startRowIndex, startFieldIndex, event) => {
    const text = event.clipboardData.getData("text/plain");
    const grid = parseClipboardGrid(text);

    if (!grid.length) return;

    event.preventDefault();

    setEntryRows((prev) => {
      const next = [...prev];
      const requiredRows = startRowIndex + grid.length;

      while (next.length < requiredRows) {
        next.push({});
      }

      grid.forEach((rowValues, rowOffset) => {
        const targetRowIndex = startRowIndex + rowOffset;
        next[targetRowIndex] = { ...(next[targetRowIndex] || {}) };

        rowValues.forEach((value, columnOffset) => {
          const field = definition.fields[startFieldIndex + columnOffset];
          if (!field) return;
          next[targetRowIndex][field.key] = value;
        });
      });

      return next;
    });
  };

  const handleCollaborativePaste = (startRowIndex, startEditableIndex, event) => {
    const text = event.clipboardData.getData("text/plain");
    const grid = parseClipboardGrid(text);

    if (!grid.length) return;

    event.preventDefault();

    setDraftRows((prev) => {
      const next = { ...prev };

      grid.forEach((rowValues, rowOffset) => {
        const tableRow = tableRows[startRowIndex + rowOffset];
        if (!tableRow) return;

        const rowId = tableRow._id;
        next[rowId] = {
          ...(next[rowId] || tableRow.data || {}),
        };

        rowValues.forEach((value, columnOffset) => {
          const fieldKey = editableFieldKeys[startEditableIndex + columnOffset];
          if (!fieldKey) return;
          next[rowId][fieldKey] = value;
        });
      });

      return next;
    });
  };

  const handleRowChange = (rowId, fieldKey, value) => {
    setDraftRows((prev) => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || {}),
        [fieldKey]: value,
      },
    }));
  };

  const handleSaveRow = async (rowId) => {
    const draft = draftRows[rowId];
    const existingRow = tableRows.find((row) => row._id === rowId);

    if (!draft || !existingRow) return;

    const payload = {};

    for (const field of definition.fields) {
      if (!editableFields.has(field.key)) continue;

      const nextValue = draft[field.key];
      const previousValue = existingRow.data?.[field.key];

      if (String(nextValue ?? "").trim() === String(previousValue ?? "").trim()) {
        continue;
      }

      payload[field.key] = nextValue;
    }

    if (!Object.keys(payload).length) {
      showError("No editable changes found for this row");
      return;
    }

    try {
      setSavingRowId(rowId);
      const updatedRow = await updateCollaborativeSchemeRow(rowId, payload);

      setTableRows((prev) =>
        prev.map((item) =>
          item._id === rowId ? { ...item, data: updatedRow.data } : item
        )
      );
      setDraftRows((prev) => ({
        ...prev,
        [rowId]: { ...updatedRow.data },
      }));
      showSuccess("Row updated successfully");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to save row"));
    } finally {
      setSavingRowId("");
    }
  };

  const handleSaveAllEntryRows = async () => {
    const rowsToSave = entryRows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) =>
        definition.fields.some((field) => {
          const value = row[field.key];
          return value !== undefined && value !== null && String(value).trim() !== "";
        })
      );

    if (!rowsToSave.length) {
      showError("No filled rows available to save");
      return;
    }

    try {
      setSavingAllRows(true);

      for (const { row } of rowsToSave) {
        await submitSchemeAnswer({
          schemeId,
          data: row,
        });
      }

      showSuccess(`${rowsToSave.length} row(s) saved successfully`);
      setEntryRows([{}]);
      const ownAnswers = await getSchemeAnswers({ schemeId });
      setTableRows(ownAnswers?.items || []);
    } catch (err) {
      showError(getErrorMessage(err, "Failed to save all rows"));
    } finally {
      setSavingAllRows(false);
      setSubmittingRowIndex(-1);
    }
  };

  const handleSaveAllCollaborativeRows = async () => {
    const changedRows = tableRows
      .map((row) => {
        const payload = {};

        for (const field of definition.fields) {
          if (!editableFields.has(field.key)) continue;

          const nextValue = draftRows[row._id]?.[field.key];
          const previousValue = row.data?.[field.key];

          if (
            String(nextValue ?? "").trim() ===
            String(previousValue ?? "").trim()
          ) {
            continue;
          }

          payload[field.key] = nextValue;
        }

        return {
          rowId: row._id,
          payload,
        };
      })
      .filter((item) => Object.keys(item.payload).length > 0);

    if (!changedRows.length) {
      showError("No editable changes found");
      return;
    }

    try {
      setSavingAllRows(true);

      for (const item of changedRows) {
        const updatedRow = await updateCollaborativeSchemeRow(
          item.rowId,
          item.payload
        );

        setTableRows((prev) =>
          prev.map((row) =>
            row._id === item.rowId ? { ...row, data: updatedRow.data } : row
          )
        );
        setDraftRows((prev) => ({
          ...prev,
          [item.rowId]: { ...updatedRow.data },
        }));
      }

      showSuccess(`${changedRows.length} row(s) updated successfully`);
    } catch (err) {
      showError(getErrorMessage(err, "Failed to save all row updates"));
    } finally {
      setSavingAllRows(false);
    }
  };

  if (loading) return <div className="p-6 font-medium text-slate-700">Loading...</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-6 lg:py-10">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-950">
          {definition.scheme?.name}
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-700">
          {isFieldLevelMode
            ? "You can update only the highlighted fields in the admin-created rows below."
            : "Fill the form and submit a new entry for this scheme."}
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-3">
        {!isFieldLevelMode && (
          <button
            onClick={handleExportTemplate}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white"
          >
            <FileDown size={16} /> Export Template
          </button>
        )}

        <button
          onClick={() => exportCollaborativeWorkbook(schemeId)}
          className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-white"
        >
          <FileDown size={16} /> Export Shared Excel
        </button>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-white">
          <FileUp size={16} /> Import Excel
          <input
            type="file"
            accept=".xlsx, .xls"
            hidden
            onChange={handleImport}
          />
        </label>

        {isFieldLevelMode ? (
          <button
            onClick={handleSaveAllCollaborativeRows}
            disabled={savingAllRows}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={16} />
            {savingAllRows ? "Saving All..." : "Save All Rows"}
          </button>
        ) : (
          <button
            onClick={handleSaveAllEntryRows}
            disabled={savingAllRows}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={16} />
            {savingAllRows ? "Saving All..." : "Save All Rows"}
          </button>
        )}
      </div>

      {isFieldLevelMode ? (
        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-300 bg-slate-100 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Shared Rows
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-700">
              Locked columns are shown for reference. Only your assigned fields can be updated, and you can paste Excel data directly into the blue cells.
            </p>
          </div>

          {tableRows.length === 0 ? (
            <div className="p-6 text-sm font-medium text-slate-700">
              No starter rows are available yet. Ask your admin to add the initial rows first.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-slate-200 text-slate-900">
                  <tr>
                    {definition.fields.map((field) => (
                      <th key={field.key} className="p-4 text-left font-semibold">
                        {field.label}
                      </th>
                    ))}
                    <th className="p-4 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, rowIndex) => (
                    <tr key={row._id} className="border-t align-top">
                      {definition.fields.map((field) => {
                        const isEditable = editableFields.has(field.key);
                        const editableFieldIndex = editableFieldKeys.indexOf(field.key);
                        const value =
                          draftRows[row._id]?.[field.key] ??
                          row.data?.[field.key] ??
                          "";

                        return (
                          <td key={field.key} className="p-3">
                            {isEditable ? (
                              <input
                                className="w-full rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-slate-950"
                                value={value}
                                onChange={(e) =>
                                  handleRowChange(row._id, field.key, e.target.value)
                                }
                                onPaste={(e) =>
                                  handleCollaborativePaste(
                                    rowIndex,
                                    editableFieldIndex,
                                    e
                                  )
                                }
                              />
                            ) : (
                              <div className="flex min-h-[42px] items-start gap-2 rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-800">
                                <Lock size={14} className="mt-1 text-slate-500" />
                                <span className="break-words">
                                  {value ? String(value) : "-"}
                                </span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 whitespace-nowrap">
                        <button
                          onClick={() => handleSaveRow(row._id)}
                          disabled={savingRowId === row._id}
                          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60"
                        >
                          <Save size={15} />
                          {savingRowId === row._id ? "Saving..." : "Save Row"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-300 bg-slate-100 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Add and Manage Entries
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-700">
              Add new rows in the table below. You can also paste directly from Excel into the input grid.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-200 text-slate-900">
                <tr>
                  {definition.fields.map((field) => (
                    <th key={field.key} className="p-4 text-left font-semibold">
                      {field.label}
                    </th>
                  ))}
                  <th className="p-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {entryRows.map((entryRow, rowIndex) => (
                  <tr
                    key={`entry-row-${rowIndex}`}
                    className="border-t bg-blue-50/40 align-top"
                  >
                    {definition.fields.map((field, fieldIndex) => (
                      <td key={field.key} className="p-3">
                        <input
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950"
                          value={entryRow[field.key] || ""}
                          onChange={(e) =>
                            handleEntryChange(rowIndex, field.key, e.target.value)
                          }
                          onPaste={(e) =>
                            handleFullAccessPaste(rowIndex, fieldIndex, e)
                          }
                          placeholder={field.required ? "Required" : "Optional"}
                        />
                      </td>
                    ))}
                    <td className="p-3 whitespace-nowrap">
                      <button
                        onClick={() => handleEntryRowSubmit(rowIndex)}
                        disabled={submittingRowIndex === rowIndex}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60"
                      >
                        <Send size={15} />
                        {submittingRowIndex === rowIndex ? "Saving..." : "Save Row"}
                      </button>
                    </td>
                  </tr>
                ))}

                {tableRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={definition.fields.length + 1}
                      className="p-6 text-center font-medium text-slate-600"
                    >
                      No entries added yet
                    </td>
                  </tr>
                )}

                {tableRows.map((row) => (
                  <tr key={row._id} className="border-t border-slate-200 align-top hover:bg-slate-50">
                    {definition.fields.map((field) => (
                      <td key={field.key} className="p-3 text-slate-800">
                        <div className="min-h-[42px] break-words rounded-lg border border-slate-300 bg-slate-100 px-3 py-2">
                          {row.data?.[field.key] ? String(row.data[field.key]) : "-"}
                        </div>
                      </td>
                    ))}
                    <td className="p-3 whitespace-nowrap">
                      {!row.hasEdited ? (
                        <button
                          onClick={() =>
                            navigate(`/user/submissions/edit/${row._id}`)
                          }
                          className="text-blue-600 font-medium hover:underline"
                        >
                          Edit Once
                        </button>
                      ) : (
                        <span className="text-sm font-medium text-slate-500">Edit used</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-300 bg-slate-100 px-4 py-4 sm:px-6">
            <button
              onClick={addEntryRow}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-900 hover:bg-slate-50"
            >
              <Plus size={15} />
              Add Blank Row
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
