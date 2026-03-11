import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/memory", label: "Memory" },
  { to: "/routing", label: "Routing" },
  { to: "/routing/test", label: "Route Test" },
  { to: "/settings", label: "Settings" }
];

export function Layout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-1">
        <h1 className="text-lg font-bold mb-4 px-2">Cortex</h1>
        <nav className="flex flex-col gap-0.5">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-sm ${isActive ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"}`
              }>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
