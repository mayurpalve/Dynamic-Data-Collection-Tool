import { useEffect, useState } from "react";

import { getSchemes } from "../api/scheme.api";
import {
  getSchemeDefinitionByScheme,
  saveSchemeDefinition,
  getAllSchemeDefinitions,
  deleteSchemeDefinition,
} from "../api/schemeDefinition.api";

import {
  getDepartments,
  getDivisions,
  getDistricts,
  getTalukas,
  getRegions,
} from "../api/master.api";

import { exportSchemeAnswers } from "../api/schemeAnswer.api";
import { useAuth } from "../auth/AuthContext";
import { getErrorMessage, showError, showSuccess } from "../utils/toast";

const FIELD_TYPES = ["TEXT", "NUMBER", "DATE", "AMOUNT"];

export default function SchemeDefinition() {
  const { isAuthenticated } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [schemeId, setSchemeId] = useState("");
  const [fields, setFields] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [regions, setRegions] = useState([]);
  const [department, setDepartment] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      try {
        const data = await getSchemes();
        setSchemes(Array.isArray(data) ? data : []);
      } catch (err) {
        showError(getErrorMessage(err, "Failed to load schemes"));
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    Promise.all([
      getDepartments(),
      getDivisions(),
      getDistricts(),
      getTalukas(),
      getRegions(),
    ])
      .then(([departments, divisions, districts, talukas, regions]) => {
        setDepartments(departments || []);
        setDivisions(divisions || []);
        setDistricts(districts || []);
        setTalukas(talukas || []);
        setRegions(regions || []);
      })
      .catch((err) => {
        showError(getErrorMessage(err, "Failed to load master data"));
      });
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      try {
        const data = await getAllSchemeDefinitions();
        setDefinitions(Array.isArray(data) ? data : []);
      } catch (err) {
        showError(getErrorMessage(err, "Failed to load scheme definitions"));
      }
    })();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !schemeId) {
      setFields([]);
      return;
    }

    (async () => {
      try {
        const data = await getSchemeDefinitionByScheme(schemeId);
        setFields(data?.fields || []);
        setDepartment(data?.department?._id || "");
        setDivision(data?.division?._id || "");
        setDistrict(data?.district?._id || "");
        setTaluka(data?.taluka?._id || "");
        setRegion(data?.region?._id || "");
      } catch (err) {
        showError(getErrorMessage(err, "Failed to load scheme definition"));
      }
    })();
  }, [isAuthenticated, schemeId]);

  const addField = () => {
    setFields((prev) => [
      ...prev,
      { key: "", label: "", type: "TEXT", required: false, unique: false },
    ]);
  };

  const updateField = (index, field, value) => {
    const copy = [...fields];
    copy[index][field] = value;
    setFields(copy);
  };

  const removeField = (index) => {
    if (!confirm("Remove this field?")) return;
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!schemeId) return showError("Select scheme first");

    try {
      await saveSchemeDefinition({
        schemeId,
        fields,
        assignedRoles: ["ADMIN", "USER"],
        department,
        division,
        district,
        taluka,
        region,
      });

      const updated = await getAllSchemeDefinitions();
      setDefinitions(Array.isArray(updated) ? updated : []);
      showSuccess("Scheme definition saved");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to save scheme definition"));
    }
  };

  const handleDeleteDefinition = async (id) => {
    if (!confirm("Delete this scheme definition?")) return;

    try {
      await deleteSchemeDefinition(id);
      setDefinitions((prev) => prev.filter((definition) => definition._id !== id));
      showSuccess("Scheme definition deleted");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to delete scheme definition"));
    }
  };

  const handleExportDefinition = async (definition) => {
    if (!definition?.scheme?._id) return;

    try {
      await exportSchemeAnswers(definition.scheme._id);
      showSuccess("Export started");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to export scheme answers"));
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Scheme Definition</h1>

      <select
        className="mb-4 w-full rounded border p-2 sm:max-w-md"
        value={schemeId}
        onChange={(e) => setSchemeId(e.target.value)}
        disabled={loading}
      >
        <option value="">Select Scheme</option>
        {schemes.map((scheme) => (
          <option key={scheme._id} value={scheme._id}>
            {scheme.name}
          </option>
        ))}
      </select>

      {fields.map((field, index) => (
        <div key={index} className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-5 xl:items-center">
          <input
            className="border p-2 rounded"
            placeholder="Key"
            value={field.key}
            onChange={(e) => updateField(index, "key", e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Label"
            value={field.label}
            onChange={(e) => updateField(index, "label", e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={field.type}
            onChange={(e) => updateField(index, "type", e.target.value)}
          >
            {FIELD_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <div className="flex flex-col gap-1 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(index, "required", e.target.checked)}
              />
              Required
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.unique || false}
                onChange={(e) => updateField(index, "unique", e.target.checked)}
              />
              Unique
            </label>
          </div>

          <div className="flex items-center xl:justify-end">
            <button
              onClick={() => removeField(index)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border p-2"
        >
          <option value="">Department</option>
          {departments.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          className="border p-2"
        >
          <option value="">Division</option>
          {divisions.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="border p-2"
        >
          <option value="">District</option>
          {districts.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={taluka}
          onChange={(e) => setTaluka(e.target.value)}
          className="border p-2"
        >
          <option value="">Taluka</option>
          {talukas.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="border p-2"
        >
          <option value="">Region</option>
          {regions.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={addField}
          className="rounded bg-gray-700 px-4 py-2 text-white"
        >
          Add Field
        </button>

        <button
          onClick={save}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Save Definition
        </button>
      </div>

      <hr className="my-10" />
      <h2 className="text-xl font-semibold mb-4">Saved Scheme Definitions</h2>

      <div className="overflow-hidden rounded bg-white shadow">
        <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Scheme</th>
              <th className="p-3 text-left">Scope</th>
              <th className="p-3 text-left">Fields</th>
              <th className="p-3 text-left">Public Link</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {definitions.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No scheme definitions found
                </td>
              </tr>
            )}

            {definitions.map((definition) => (
              <tr key={definition._id} className="border-t align-top">
                <td className="p-3 font-medium">{definition.scheme?.name}</td>

                <td className="p-3 text-sm">
                  {definition.department?.name && (
                    <div>Dept: {definition.department.name}</div>
                  )}
                  {definition.division?.name && (
                    <div>Div: {definition.division.name}</div>
                  )}
                  {definition.district?.name && (
                    <div>Dist: {definition.district.name}</div>
                  )}
                  {definition.taluka?.name && (
                    <div>Taluka: {definition.taluka.name}</div>
                  )}
                  {definition.region?.name && (
                    <div>Region: {definition.region.name}</div>
                  )}
                </td>

                <td className="p-3 text-sm">
                  {definition.fields.map((field, index) => (
                    <div key={index}>- {field.label} ({field.type})</div>
                  ))}
                </td>

                <td className="p-3 text-sm">
                  {definition.isPublic && definition.publicLinkId ? (
                    <div className="flex flex-col gap-1">
                      <a
                        href={`${window.location.origin}/public/scheme/${definition.publicLinkId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline text-xs"
                      >
                        Open Form
                      </a>

                      <button
                        className="text-gray-600 text-xs border px-2 py-1 rounded w-fit"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/public/scheme/${definition.publicLinkId}`
                          );
                          showSuccess("Public link copied");
                        }}
                      >
                        Copy Link
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Not Public</span>
                  )}
                </td>

                <td className="p-3 text-right">
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      onClick={() => handleExportDefinition(definition)}
                      className="text-green-600 hover:underline"
                    >
                      Export
                    </button>

                    <button
                      onClick={() => handleDeleteDefinition(definition._id)}
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
