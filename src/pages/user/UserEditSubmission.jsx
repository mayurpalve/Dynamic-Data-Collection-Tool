import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send } from "lucide-react";

import { getSchemeAnswers, updateSchemeAnswer } from "../../api/schemeAnswer.api";
import { getErrorMessage, showError, showSuccess } from "../../utils/toast";

export default function UserEditSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmission();
  }, []);

  const loadSubmission = async () => {
    try {
      const res = await getSchemeAnswers();
      const found = res.items.find((answer) => answer._id === id);

      if (!found) {
        showError("Submission not found");
        return navigate("/user/submissions");
      }

      setSubmission(found);
      setFormData(found.data || {});
    } catch (err) {
      console.error(err);
      showError(getErrorMessage(err, "Failed to load submission"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    try {
      await updateSchemeAnswer(id, { data: formData });
      showSuccess("Updated successfully");
      navigate("/user/submissions");
    } catch (err) {
      console.error(err);
      showError(getErrorMessage(err, "Update failed"));
    }
  };

  if (loading) {
    return <div className="p-6">Loading submission...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f9]">
      <main className="flex-1">
        <div className="px-6 py-10 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Edit Submission</h1>
          <p className="text-gray-600 mb-6">
            Update your scheme application details
          </p>

          <div className="bg-white border rounded-2xl shadow-sm p-8">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} className="mb-4">
                <label className="block font-medium mb-1 capitalize">{key}</label>
                <input
                  className="border px-4 py-2 rounded-lg w-full"
                  value={value || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}

            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              <Send size={16} />
              Update Submission
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
