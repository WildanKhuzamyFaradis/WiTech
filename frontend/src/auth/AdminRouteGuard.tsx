import { Navigate, Outlet, useLocation } from "react-router";
import { isAdminAuthenticated } from "./adminAuth";

export default function AdminRouteGuard() {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}