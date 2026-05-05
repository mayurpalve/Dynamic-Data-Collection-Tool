import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { getDashboardStats } from "../api/dashboard.api";
import { getErrorMessage, showError } from "../utils/toast";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  const [stats, setStats] = useState({
    totalSchemes: 0,
    departments: 0,
    totalSubmissions: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
        showError(getErrorMessage(error, "Failed to load dashboard stats"));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated]);

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="System overview and statistics"
      />

      {loading ? (
        <div className="mt-6 font-medium text-slate-700">
          Loading dashboard...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <Card
            title="Total Schemes"
            value={stats.totalSchemes}
          />

          <Card
            title="Total Submissions"
            value={stats.totalSubmissions}
          />

          <Card
            title="Departments"
            value={stats.departments}
          />
        </div>
      )}
    </div>
  );
}
