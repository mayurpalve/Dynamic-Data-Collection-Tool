import { useState } from "react";
import { generateAISummary } from "../api/ai.api";
import { getErrorMessage, showError } from "../utils/toast";

export default function AISummary() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return showError("Select file");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await generateAISummary(formData);
      setSummary(res);
    } catch (err) {
      showError(getErrorMessage(err, "Failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">AI Summary</h1>

      <div className="bg-white p-6 rounded shadow mb-6">
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={handleUpload}
          className="ml-4 bg-purple-600 text-white px-4 py-2 rounded"
        >
          Generate Summary
        </button>
      </div>

      {loading && <p>Generating...</p>}

      {summary && (
        <div className="bg-white p-6 rounded shadow whitespace-pre-line">
          {summary}
        </div>
      )}
    </div>
  );
}
