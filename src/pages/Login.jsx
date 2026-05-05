import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { loginApi } from "../api/auth.api";
import { getErrorMessage, showError } from "../utils/toast";

import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "USER") {
        navigate("/user/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginApi({ email, password });

      login(data);

      if (data.user.role === "USER") {
        navigate("/user/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      showError(getErrorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-200">
      <PublicHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="order-2 flex justify-center lg:order-1">
            <img
              src="/maharashtra-map.png"
              alt="Maharashtra Map"
              className="max-h-[260px] w-full max-w-[620px] object-contain brightness-110 contrast-110 sm:max-h-[360px] lg:max-h-none"
            />
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <div className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-5 py-6 shadow-xl sm:px-8">
              <h2 className="mb-6 text-center text-xl font-bold text-slate-950">
                Government Portal Login
              </h2>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded border border-slate-300 px-4 py-2 text-slate-950 shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full rounded border border-slate-300 px-4 py-2 pr-10 text-slate-950 shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 cursor-pointer text-sm font-medium text-slate-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </span>
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-900 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  disabled={loading}
                  className="w-full rounded bg-slate-900 py-2 font-semibold text-white hover:bg-slate-800"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <p className="text-center text-xs font-medium leading-relaxed text-slate-600">
                  Authorized access only. Unauthorized use is prohibited.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <img
        src="/foot-logo.png"
        alt="Footer Logo"
        className="pointer-events-none absolute bottom-12 right-3 hidden w-20 opacity-90 sm:block lg:w-28"
      />

      <PublicFooter />
    </div>
  );
}
