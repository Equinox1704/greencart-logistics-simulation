import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import SimulationPage from "./pages/SimulationPage";
import DriversPage from "./pages/DriversPage";
import RoutesPage from "./pages/RoutesPage";
import OrdersPage from "./pages/OrdersPage";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}

function AppContent() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, []);

  function logout() {
    localStorage.removeItem("token");
    setLoggedIn(false);
    navigate("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="w-full px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-emerald-700">
            GreenCart Logistics
          </h1>
          {loggedIn && (
            <nav className="flex items-center gap-3">
              <Link className="text-sm hover:text-emerald-700" to="/dashboard">Dashboard</Link>
              <Link className="text-sm hover:text-emerald-700" to="/simulate">Simulation</Link>
              <Link className="text-sm hover:text-emerald-700" to="/drivers">Drivers</Link>
              <Link className="text-sm hover:text-emerald-700" to="/routes">Routes</Link>
              <Link className="text-sm hover:text-emerald-700" to="/orders">Orders</Link>
              <button
                onClick={logout}
                className="text-sm rounded-md border px-3 py-1.5 hover:bg-slate-50"
              >
                Logout
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-grow w-full px-4 md:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<LoginPage onLogin={() => setLoggedIn(true)} />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/simulate" element={<PrivateRoute><SimulationPage /></PrivateRoute>} />
          <Route path="/drivers" element={<PrivateRoute><DriversPage /></PrivateRoute>} />
          <Route path="/routes" element={<PrivateRoute><RoutesPage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
