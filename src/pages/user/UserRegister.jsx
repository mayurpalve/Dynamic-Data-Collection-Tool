import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import { showError, showSuccess } from "../../utils/toast";

export default function UserRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    showSuccess("User registered successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f9]">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">
            User Registration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="fullName"
              placeholder="Full Name"
              className="w-full border px-4 py-2 rounded"
              value={form.fullName}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full border px-4 py-2 rounded"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full border px-4 py-2 rounded"
              value={form.password}
              onChange={handleChange}
              required
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              className="w-full border px-4 py-2 rounded"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-2 rounded font-semibold"
            >
              Register
            </button>
          </form>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
