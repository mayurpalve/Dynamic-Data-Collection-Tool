// src/pages/PublicSchemeForm.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import {
  getPublicSchemeDefinition,
  submitPublicSchemeAnswer
} from "../api/publicScheme.api";
import { getErrorMessage, showError, showSuccess } from "../utils/toast";

export default function PublicSchemeForm() {
  const { publicLinkId } = useParams();

  const [scheme, setScheme] = useState(null);
  const [fields, setFields] = useState([]);
  const [answers, setAnswers] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!publicLinkId) return;

    (async () => {
      try {
        const res = await getPublicSchemeDefinition(publicLinkId);
        if (!res?.scheme || !Array.isArray(res.fields)) {
          throw new Error();
        }
        setScheme(res.scheme);
        setFields(res.fields);
      } catch {
        setError("This application form is not available.");
      } finally {
        setLoading(false);
      }
    })();
  }, [publicLinkId]);

  const getInputType = (type) => {
    if (type === "DATE") return "date";
    if (type === "NUMBER" || type === "AMOUNT") return "number";
    return "text";
  };

  const isInvalid = (f) =>
    f.required &&
    touched[f.key] &&
    !String(answers[f.key] || "").trim();

  const isFormValid = fields.every(
    (f) => !f.required || String(answers[f.key] || "").trim()
  );

  const submit = async () => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    try {
      await submitPublicSchemeAnswer({
        schemeId: scheme._id,
        data: answers
      });
      showSuccess("Application submitted successfully.");
      setAnswers({});
      setTouched({});
    } catch (err) {
      showError(getErrorMessage(err, "Submission failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-200">
      <PublicHeader />

      <main className="flex flex-1 items-center justify-center bg-slate-200 px-4 py-6 sm:px-6">
        {!loading && !error && (
          <div className="w-full max-w-2xl border border-slate-400 bg-white shadow-lg">

            {/* TITLE */}
            <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
              <h1 className="text-lg font-semibold text-slate-950 sm:text-xl">
                {scheme?.name}
              </h1>
              <p className="text-sm font-medium text-slate-700">
                Government Application Form
              </p>
            </div>

            {/* DESCRIPTION */}
            {scheme?.description && (
              <div className="border-b border-slate-300 px-4 py-3">
                <p className="text-sm leading-relaxed text-slate-800">
                  {scheme.description}
                </p>
              </div>
            )}

            {/* FORM */}
            <div className="px-4 py-4 space-y-4">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-sm font-semibold text-slate-900">
                    {f.label}
                    {f.required && (
                      <span className="text-red-700 ml-1">*</span>
                    )}
                  </label>

                  <input
                    type={getInputType(f.type)}
                    value={answers[f.key] || ""}
                    onChange={(e) =>
                      setAnswers({ ...answers, [f.key]: e.target.value })
                    }
                    onBlur={() =>
                      setTouched({ ...touched, [f.key]: true })
                    }
                    className="
                      w-full border px-3 py-2 text-base
                      border-slate-400 text-slate-950
                      focus:outline-none focus:border-slate-900
                      hover:border-slate-700
                      transition-colors duration-150
                    "
                  />

                  {isInvalid(f) && (
                    <p className="text-xs text-red-700 mt-1">
                      Mandatory field
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* ACTION BAR */}
            <div className="flex border-t border-slate-300 bg-slate-100 px-4 py-3 sm:justify-end">
              <button
                onClick={submit}
                disabled={!isFormValid || submitting}
                className="
                  w-full bg-slate-900 px-6 py-2 text-base text-white sm:w-auto
                  hover:bg-slate-800
                  disabled:bg-slate-400
                  transition-colors duration-150
                "
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
