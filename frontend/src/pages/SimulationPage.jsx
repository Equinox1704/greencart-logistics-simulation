import { useState } from "react";
import api from "../services/api";
import Card from "../components/Card";
import { inr, pct } from "../utils/format"; 

export default function SimulationPage() {
  const [driversAvailable, setDriversAvailable] = useState(5);
  const [startTime, setStartTime] = useState("09:00");
  const [maxHoursPerDriver, setMaxHoursPerDriver] = useState(8);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runSimulation(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/simulate", {
        driversAvailable,
        startTime,
        maxHoursPerDriver,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Simulation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Simulation form */}
      <Card title="Run Simulation">
        <form
          onSubmit={runSimulation}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div>
            <label className="text-sm text-slate-600">Drivers Available</label>
            <input
              className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
              type="number"
              value={driversAvailable}
              onChange={(e) => setDriversAvailable(+e.target.value)}
              min={1}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Start Time</label>
            <input
              className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Max Hours/Driver</label>
            <input
              className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
              type="number"
              value={maxHoursPerDriver}
              onChange={(e) => setMaxHoursPerDriver(+e.target.value)}
              min={1}
              step="0.5"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <button
              className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? "Running..." : "Run Simulation"}
            </button>
          </div>
        </form>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </Card>

      {/* Results here*/}
      {result && result.kpis && (
        <Card title="Latest KPIs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Total Profit</p>
              <p className="text-xl font-semibold">{inr(result.kpis.totalProfit)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Efficiency</p>
              <p className="text-xl font-semibold">{pct(result.kpis.efficiency)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">On‑time</p>
              <p className="text-xl font-semibold text-emerald-600">{result.kpis.onTime}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Late</p>
              <p className="text-xl font-semibold text-rose-600">{result.kpis.late}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
