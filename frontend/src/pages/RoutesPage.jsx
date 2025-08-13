import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "../components/Card";
import Modal from "../components/Modal";

const emptyForm = {
  routeId: "",
  distanceKm: "",
  trafficLevel: "Low",
  baseTimeMin: "",
};

const TRAFFIC_LEVELS = ["Low", "Medium", "High"];

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function fetchRoutes() {
    setLoading(true);
    try {
      const res = await api.get("/routes");
      setRoutes(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRoutes();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(r) {
    setEditingId(r._id);
    setForm({
      routeId: r.routeId ?? "",
      distanceKm: r.distanceKm ?? "",
      trafficLevel: r.trafficLevel ?? "Low",
      baseTimeMin: r.baseTimeMin ?? "",
    });
    setError("");
    setModalOpen(true);
  }

  async function saveRoute(e) {
    e.preventDefault();
    setError("");

    const payload = {
      routeId: Number(form.routeId),
      distanceKm: Number(form.distanceKm),
      trafficLevel: form.trafficLevel,
      baseTimeMin: Number(form.baseTimeMin),
    };

    try {
      if (editingId) {
        await api.put(`/routes/${editingId}`, payload);
      } else {
        await api.post("/routes", payload);
      }
      setModalOpen(false);
      fetchRoutes();
    } catch (err) {
      const msg = err.response?.data?.error;
      if (Array.isArray(msg)) {
        setError(msg.map((m) => m.message || m).join(", "));
      } else if (typeof msg === "string") {
        setError(msg);
      } else {
        setError("Validation error");
      }
    }
  }

  async function deleteRoute(id) {
    if (!confirm("Delete this route?")) return;
    try {
      await api.delete(`/routes/${id}`);
      fetchRoutes();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Routes</h2>
        <button
          onClick={openCreate}
          className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Add Route
        </button>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <p>Loading...</p>
        ) : routes.length === 0 ? (
          <p className="text-slate-600">No routes yet. Click “Add Route”.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm text-slate-600">
                  <th className="border-b p-3">Route ID</th>
                  <th className="border-b p-3">Distance (km)</th>
                  <th className="border-b p-3">Traffic</th>
                  <th className="border-b p-3">Base Time (min)</th>
                  <th className="border-b p-3 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r._id} className="align-top">
                    <td className="border-b p-3">{r.routeId}</td>
                    <td className="border-b p-3">{r.distanceKm}</td>
                    <td className="border-b p-3">{r.trafficLevel}</td>
                    <td className="border-b p-3">{r.baseTimeMin}</td>
                    <td className="border-b p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="text-sm font-semibold rounded-md bg-[#04160E] px-4 py-1.5 text-white shadow-md hover:opacity-90 transition-opacity"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteRoute(r._id)}
                          className="text-sm font-semibold rounded-md bg-[#04160E] px-4 py-1.5 text-white shadow-md hover:opacity-90 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Modal
        open={modalOpen}
        title={editingId ? "Edit Route" : "Add Route"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={saveRoute} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Route ID</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                value={form.routeId}
                onChange={(e) => setForm({ ...form, routeId: e.target.value })}
                required
                disabled={!!editingId}
              />
            </div>

            <div>
              <label className="text-sm text-slate-600">Distance (km)</label>
              <input
                type="number"
                min={1}
                step="0.1"
                className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                value={form.distanceKm}
                onChange={(e) => setForm({ ...form, distanceKm: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-600">Traffic</label>
              <select
                className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                value={form.trafficLevel}
                onChange={(e) => setForm({ ...form, trafficLevel: e.target.value })}
                required
              >
                {TRAFFIC_LEVELS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-600">Base Time (min)</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                value={form.baseTimeMin}
                onChange={(e) => setForm({ ...form, baseTimeMin: e.target.value })}
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-sm font-semibold rounded-md bg-[#04160E] px-4 py-1.5 text-white shadow-md hover:opacity-90 transition-opacity"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
            >
              {editingId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
