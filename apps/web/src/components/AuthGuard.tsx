import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/lib/auth-client";

export function AuthGuard() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
