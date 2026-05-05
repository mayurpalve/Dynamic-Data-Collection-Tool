import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar({ isOpen = false, onClose }) {
  const navigate = useNavigate();
  const { logout, role } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navClass = ({ isActive }) =>
    `block rounded-md px-4 py-2 text-sm transition ${
      isActive
        ? "bg-blue-600 text-white font-medium"
        : "text-white/90 hover:bg-white/10"
    }`;

  const handleNavigate = () => {
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-[280px] max-w-[85vw] flex-col bg-[#0b2036] text-white shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-5 py-4 sm:px-6 sm:py-5">
          <div className="mb-3 flex items-start justify-between gap-3 lg:mb-0">
            <h1 className="text-base font-semibold sm:text-lg">
              {role === "SUPER_ADMIN" && "Super Admin Panel"}
              {role === "ADMIN" && "Admin Panel"}
              {role === "USER" && "User Panel"}
            </h1>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/15 p-1 text-white lg:hidden"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-white/70">Maharashtra Government</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavLink to="/dashboard" className={navClass} onClick={handleNavigate}>
            Dashboard
          </NavLink>

          {role === "SUPER_ADMIN" && (
            <>
              <div className="mb-2 mt-4 border-t border-white/10" />
              <p className="mb-1 px-4 text-xs font-semibold text-white/60">
                Super Admin
              </p>

              <NavLink to="/role-management" className={navClass} onClick={handleNavigate}>
                Role Management
              </NavLink>

              <NavLink to="/user-management" className={navClass} onClick={handleNavigate}>
                User Management
              </NavLink>

              <div className="mb-2 mt-4 border-t border-white/10" />
              <p className="mb-1 px-4 text-xs font-semibold text-white/60">
                Scheme Management
              </p>

              <NavLink to="/departments" className={navClass} onClick={handleNavigate}>
                Departments
              </NavLink>

              <NavLink to="/schemes" className={navClass} onClick={handleNavigate}>
                Schemes
              </NavLink>

              <NavLink to="/scheme-definition" className={navClass} onClick={handleNavigate}>
                Scheme Definition
              </NavLink>

              <NavLink to="/scheme-answers-admin" className={navClass} onClick={handleNavigate}>
                All Submissions
              </NavLink>
            </>
          )}

          {role === "ADMIN" && (
            <>
              <div className="mb-2 mt-4 border-t border-white/10" />
              <p className="mb-1 px-4 text-xs font-semibold text-white/60">
                Admin Controls
              </p>

              <NavLink to="/user-management" className={navClass} onClick={handleNavigate}>
                Users
              </NavLink>

              <NavLink to="/scheme-answer" className={navClass} onClick={handleNavigate}>
                Fill Scheme
              </NavLink>

              <NavLink to="/scheme-answers-admin" className={navClass} onClick={handleNavigate}>
                User Submissions
              </NavLink>
            </>
          )}

          {role === "USER" && (
            <>
              <div className="mb-2 mt-4 border-t border-white/10" />
              <p className="mb-1 px-4 text-xs font-semibold text-white/60">
                User Menu
              </p>

              <NavLink to="/user/dashboard" className={navClass} onClick={handleNavigate}>
                Dashboard
              </NavLink>

              <NavLink to="/user/assigned-schemes" className={navClass} onClick={handleNavigate}>
                Assigned Schemes
              </NavLink>

              <NavLink to="/user/submissions" className={navClass} onClick={handleNavigate}>
                My Submissions
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex justify-center border-t border-white/10 px-4 py-4">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full rounded-md bg-red-500 px-6 py-2 text-sm font-medium hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800">
              Confirm Logout
            </h2>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="rounded bg-gray-200 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="rounded bg-red-600 px-4 py-2 text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
