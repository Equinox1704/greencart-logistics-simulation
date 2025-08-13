import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "../components/Card";
import { inr, pct } from "../utils/format";

export default function HistoryPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function fetchHistory() {
    setLoading(true);
    setError("");
    api.get("/simulate/history")
      .then((res) => {
        const arr = Array.isArray(res.data) ? res.data : [];
        arr.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
        setRuns(arr);
      })
      .catch(() => setError("Failed to load history"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ color: "#188C5B" }}>Simulation History</h2>
        <button
          onClick={fetchHistory}
          className="rounded-md bg-[#188C5B] px-3 py-1.5 text-white hover:opacity-90"
        >
          Refresh
        </button>
      </div>

      <Card>
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="text-rose-600">{error}</p>
        ) : runs.length === 0 ? (
          <div className="flex items-center justify-between">
            <p className="text-slate-600">No history found</p>
            <a href="/simulate" className="rounded-md bg-[#188C5B] px-3 py-2 text-white hover:opacity-90">
              Run Simulation
            </a>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm text-slate-600">
                  <th className="border-b p-3">Timestamp</th>
                  <th className="border-b p-3">Total Profit</th>
                  <th className="border-b p-3">Efficiency</th>
                  <th className="border-b p-3">On‑time</th>
                  <th className="border-b p-3">Late</th>
                  <th className="border-b p-3">Fuel (base)</th>
                  <th className="border-b p-3">Fuel (traffic)</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => {
                  const t = r.timestamp || r.createdAt;
                  const k = r.kpis || {};
                  const fuel = k.fuelCostBreakdown || {};
                  return (
                    <tr key={r._id || t}>
                      <td className="border-b p-3">{t ? new Date(t).toLocaleString() : "-"}</td>
                      <td className="border-b p-3">{inr(k.totalProfit)}</td>
                      <td className="border-b p-3">{pct(k.efficiency)}</td>
                      <td className="border-b p-3">{k.onTime ?? "-"}</td>
                      <td className="border-b p-3">{k.late ?? "-"}</td>
                      <td className="border-b p-3">{inr(fuel.baseFuel)}</td>
                      <td className="border-b p-3">{inr(fuel.highTrafficSurcharge)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
