import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import Card from "../components/Card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { inr, pct } from "../utils/format";

export default function Dashboard() {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLatest = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get("/simulate/history")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          // Newest first (createdAt desc) → pick index 0
          setLatest(res.data[0]);
        } else {
          setLatest(null);
        }
      })
      .catch(() => setError("Failed to load simulation history"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  if (loading)
    return (
      <Card title="Dashboard">
        <p>Loading…</p>
      </Card>
    );

  if (error)
    return (
      <Card title="Dashboard">
        <div className="flex items-center justify-between">
          <p className="text-rose-600">{error}</p>
          <button
            onClick={fetchLatest}
            className="rounded-md bg-[#188C5B] px-3 py-1.5 text-white hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </Card>
    );

  if (!latest?.kpis) {
    return (
      <Card title="Dashboard">
        <div className="flex items-center justify-between">
          <p className="text-slate-600">No simulation data found yet.</p>
          <a
            href="/simulate"
            className="rounded-md bg-[#188C5B] px-3 py-2 text-white hover:opacity-90"
          >
            Run Simulation
          </a>
        </div>
      </Card>
    );
  }

  const k = latest.kpis || {};
  const onTimeLateData = [
    { name: "On Time", value: k.onTime ?? 0 },
    { name: "Late", value: k.late ?? 0 },
  ];
  const fuel = k.fuelCostBreakdown || {};
  const fuelData = [
    { name: "Base Fuel", value: fuel.baseFuel ?? 0 },
    { name: "Traffic Surcharge", value: fuel.highTrafficSurcharge ?? 0 },
  ];
  const COLORS = ["#10B981", "#EF4444"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ color: "#188C5B" }}>
          Dashboard
        </h2>
        <button
          onClick={fetchLatest}
          className="rounded-md bg-[#188C5B] px-3 py-1.5 text-white hover:opacity-90"
        >
          Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card title="Total Profit">
          <p className="text-2xl font-semibold">{inr(k.totalProfit ?? 0)}</p>
        </Card>
        <Card title="Efficiency">
          <p className="text-2xl font-semibold">{pct(k.efficiency ?? 0)}</p>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-emerald-600"
              style={{ width: pct(k.efficiency ?? 0) }}
            />
          </div>
        </Card>
        <Card title="On‑time">
          <p className="text-2xl font-semibold text-emerald-600">
            {k.onTime ?? 0}
          </p>
        </Card>
        <Card title="Late">
          <p className="text-2xl font-semibold text-rose-600">{k.late ?? 0}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="On‑Time vs Late">
          <div className="w-full" style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={onTimeLateData} dataKey="value" outerRadius="70%" label>
                  {onTimeLateData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Fuel Cost Breakdown">
          <div className="w-full" style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelData} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#38BDF8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
