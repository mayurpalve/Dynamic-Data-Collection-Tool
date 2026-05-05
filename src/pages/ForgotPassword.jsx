import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordApi } from "../api/auth.api";
import { getErrorMessage, showError, showSuccess } from "../utils/toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await forgotPasswordApi({ email });
      setSubmitted(true);
      setDevOtp(data?.otp || "");
      showSuccess(data?.message || "Password reset OTP generated");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to request password reset OTP"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col font-sans overflow-x-hidden bg-[#f0f0f0]">
      <header className="w-full bg-white border-b border-gray-300 min-h-[80px] sm:h-[110px] flex items-center px-4 sm:px-10 shadow-sm z-10 py-2 sm:py-0">
        <div className="flex-shrink-0">
          <img
            src="/maha-logo.png"
            className="h-[60px] sm:h-[90px] w-auto object-contain"
            alt="Maha Logo"
          />
        </div>

        <div className="flex-1 text-center px-2">
          <h1 className="font-sans font-bold text-sm xs:text-base sm:text-2xl md:text-3xl uppercase tracking-wide leading-tight text-gray-900">
            Government of Maharashtra
          </h1>
          <p className="text-[10px] sm:text-sm md:text-base font-medium text-gray-600">
            Other Backward Bahujan Welfare Department
          </p>
        </div>

        <div className="w-[60px] sm:w-[90px] hidden xs:block"></div>
      </header>

      <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-8">
        <div className="bg-white p-6 sm:p-10 rounded-lg shadow-xl border border-gray-200 w-full max-w-[95%] sm:max-w-md md:max-w-lg transition-all">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="text-center border-b pb-4 sm:pb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 uppercase tracking-tight">
                  Forgot Password
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 italic">
                  Enter your account email to generate a one-time password.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] sm:text-[12px] font-bold uppercase text-gray-700 tracking-widest opacity-80">
                  Registered Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 sm:px-5 sm:py-3 border border-gray-300 rounded text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="example@gov.in"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f14336] hover:bg-[#d32f2f] text-white py-2.5 sm:py-3.5 rounded font-bold uppercase text-sm sm:text-base tracking-widest shadow-lg transition-transform active:scale-95 disabled:opacity-60"
              >
                {loading ? "Generating..." : "Send OTP"}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-bold text-[#2b59c3] hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4 sm:space-y-6 py-4 sm:py-6">
              <div className="text-green-600 bg-green-50 p-4 sm:p-6 rounded-lg border border-green-200">
                <p className="text-base sm:text-lg font-semibold">
                  OTP Ready
                </p>
                <p className="text-[11px] sm:text-sm mt-2 leading-relaxed">
                  If the account exists, a password reset OTP has been generated.
                </p>
                {devOtp && (
                  <div className="mt-4 rounded-lg border border-dashed border-green-300 bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Development OTP
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-[0.35em] text-gray-900">
                      {devOtp}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate("/reset-password", { state: { email } })}
                className="inline-block bg-[#2b59c3] text-white px-6 py-2 sm:px-8 sm:py-3 rounded font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-blue-800 transition-colors"
              >
                Continue to Reset
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full bg-white border-t border-gray-300 py-4 sm:py-5 px-4 sm:px-10">
        <div className="flex flex-col items-center justify-center text-gray-600">
          <p className="text-[10px] sm:text-sm font-bold text-center tracking-tight">
            Designed and Developed By :- VIIT IT B
          </p>
        </div>
      </footer>
    </div>
  );
}
