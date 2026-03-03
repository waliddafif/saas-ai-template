import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, LogOut } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";

const navItems = [
  { to: "/app", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/app/chat", label: "Assistant IA", icon: MessageSquare, end: false },
];

export function AppLayout() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen">
      <nav className="flex w-60 flex-col bg-gray-900 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">SaaS AI</h2>
        </div>

        <ul className="flex-1 space-y-1 px-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-700 p-4">
          {session?.user && (
            <p className="mb-2 truncate text-sm text-gray-400">
              {session.user.name}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="size-4" />
            Se déconnecter
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
