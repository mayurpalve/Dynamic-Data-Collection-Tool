import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

import Sidebar from "./Sidebar";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";

export default function DashboardLayout() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-200">
      <PublicHeader />

      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="border-b border-slate-300 bg-white px-4 py-3 shadow-sm lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900"
            >
              <Menu size={18} />
              Menu
            </button>
          </div>

          <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
