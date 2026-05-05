import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import RequireAuth from "../auth/RequireAuth";
import DashboardLayout from "../layout/DashboardLayout";

import Dashboard from "../pages/Dashboard";
import Departments from "../pages/Departments";
import Schemes from "../pages/Schemes";
import Divisions from "../pages/Divisions";
import SchemeDefinition from "../pages/SchemeDefinition";
import SchemeAnswer from "../pages/SchemeAnswer";
import RoleManagement from "../pages/RoleManagement";
import UserManagement from "../pages/UserManagement";
import SchemeAnswerAdmin from "../pages/SchemeAnswerAdmin";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

import UserDashboard from "../pages/user/UserDashboard";
import UserAssignedSchemes from "../pages/user/UserAssignedSchemes";
import UserSubmissions from "../pages/user/UserSubmissions";
import UserEditSubmission from "../pages/user/UserEditSubmission";
import UserRegister from "../pages/user/UserRegister";
import UserSchemeAnswer from "../pages/user/UserSchemeAnswer";

import PublicSchemeForm from "../pages/PublicSchemeForm";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/public/scheme/:publicLinkId" element={<PublicSchemeForm />} />

      <Route element={<RequireAuth allowedRoles={["SUPER_ADMIN", "ADMIN"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/divisions" element={<Divisions />} />
          <Route path="/scheme-definition" element={<SchemeDefinition />} />
          <Route path="/scheme-answer" element={<SchemeAnswer />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/scheme-answers-admin" element={<SchemeAnswerAdmin />} />

          <Route element={<RequireAuth allowedRoles={["SUPER_ADMIN"]} />}>
            <Route path="/role-management" element={<RoleManagement />} />
          </Route>
        </Route>
      </Route>

      <Route element={<RequireAuth allowedRoles={["USER"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/assigned-schemes" element={<UserAssignedSchemes />} />
          <Route path="/user/submissions" element={<UserSubmissions />} />
          <Route path="/user/submissions/edit/:id" element={<UserEditSubmission />} />
          <Route path="/user/scheme-answer" element={<UserSchemeAnswer />} />
          <Route path="/user/register" element={<UserRegister />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
