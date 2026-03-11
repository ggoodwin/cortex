import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { MemorySearch } from "./pages/MemorySearch";
import { MemoryEditor } from "./pages/MemoryEditor";
import { RoutingConfig } from "./pages/RoutingConfig";
import { RoutingTest } from "./pages/RoutingTest";
import { Login } from "./pages/Login";
import { Settings } from "./pages/Settings";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const auth = useAuth();

  if (auth.loading) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500">Loading...</div>;
  }

  if (auth.authEnabled && !auth.username) {
    return <Login onLogin={auth.login} onSetup={auth.setup} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="memory" element={<MemorySearch />} />
          <Route path="memory/:id" element={<MemoryEditor />} />
          <Route path="routing" element={<RoutingConfig />} />
          <Route path="routing/test" element={<RoutingTest />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
