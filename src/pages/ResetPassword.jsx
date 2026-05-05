import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../api/auth.api";
import { getErrorMessage, showError, showSuccess } from "../utils/toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showError("Email is required");
      return;
    }

    if (!otp.trim()) {
      showError("OTP is required");
      return;
    }

    if (!password.trim()) {
      showError("Password is required");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await resetPasswordApi({ email, otp, password });
      showSuccess("Password reset successful");
      navigate("/login");
    } catch (err) {
      showError(getErrorMessage(err, "Failed to reset password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Reset Password
        </h1>
        <p className="text-sm text-gray-500 text-center mt-2">
          Enter your email, OTP, and new password to complete the reset.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Registered email"
            className="w-full border px-4 py-3 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit OTP"
            className="w-full border px-4 py-3 rounded-lg tracking-[0.2em]"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
          />

          <input
            type="password"
            placeholder="New password"
            className="w-full border px-4 py-3 rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full border px-4 py-3 rounded-lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            disabled={loading}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link to="/login" className="text-sm text-blue-700 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
