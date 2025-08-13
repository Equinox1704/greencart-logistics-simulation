import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "../components/Card.jsx";
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

export default function Dashboard() {
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    api
      .get("/simulate/history")
      .then((res) => {
        if (res.data.length > 0) {
          setLatest(res.data[res.data.length - 1]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  if (!latest?.kpis) {
    return (
      <Card title="Dashboard">
        <p>No simulation data found. Go to Simulation and run one.</p>
      </Card>
    );
  }

  const onTimeLateData = [
    { name: "On Time", value: latest.kpis.onTime },
    { name: "Late", value: latest.kpis.late },
  ];

  const fuelData = [
    { name: "Base Fuel", value: latest.kpis.fuelCostBreakdown.baseFuel },
    {
      name: "Traffic Surcharge",
      value: latest.kpis.fuelCostBreakdown.highTrafficSurcharge,
    },
  ];

  const COLORS = ["#10B981", "#EF4444"];

  return (
    <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-6">
      {/* Top KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
        <Card title="Total Profit" className="w-full">
          <p className="text-2xl font-semibold">₹{latest.kpis.totalProfit}</p>
        </Card>

        <Card title="Efficiency" className="w-full">
          <p className="text-2xl font-semibold">{latest.kpis.efficiency}%</p>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-emerald-600"
              style={{ width: `${latest.kpis.efficiency}%` }}
            />
          </div>
        </Card>

        <Card title="On-Time" className="w-full">
          <p className="text-2xl font-semibold text-emerald-600">
            {latest.kpis.onTime}
          </p>
        </Card>

        <Card title="Late" className="w-full">
          <p className="text-2xl font-semibold text-rose-600">
            {latest.kpis.late}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <Card title="On-Time vs Late" className="w-full">
          <div className="w-full" style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={onTimeLateData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  label
                >
                  {onTimeLateData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Fuel Cost Breakdown" className="w-full">
          <div className="w-full" style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={fuelData}
                margin={{ top: 16, right: 24, left: 8, bottom: 8 }}
              >
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
