import { useEffect, useState } from "react";
import api from "../services/api";
import Card from "../components/Card";
import Modal from "../components/Modal";

const emptyForm = { name: "", currentShiftHours: 0, past7DayHours: Array(7).fill(0) };

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function fetchDrivers() {
    setLoading(true);
    try {
      const res = await api.get("/drivers");
      setDrivers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDrivers();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(d) {
    setEditingId(d._id);
    setForm({
      name: d.name || "",
      currentShiftHours: d.currentShiftHours || 0,
      past7DayHours: Array.isArray(d.past7DayHours) && d.past7DayHours.length === 7
        ? d.past7DayHours
        : Array(7).fill(0),
    });
    setError("");
    setModalOpen(true);
  }

  async function saveDriver(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/drivers/${editingId}`, form);
      } else {
        await api.post("/drivers", form);
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) {
      const msg = err.response?.data?.error;
      setError(typeof msg === "string" ? msg : "Validation error");
    }
  }

  async function deleteDriver(id) {
    if (!confirm("Delete this driver?")) return;
    try {
      await api.delete(`/drivers/${id}`);
      fetchDrivers();
    } catch (e) {
      console.error(e);
    }
  }

  function setPastHour(idx, val) {
    const arr = [...form.past7DayHours];
    arr[idx] = Number(val) || 0;
    setForm({ ...form, past7DayHours: arr });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Drivers</h2>
        <button
          onClick={openCreate}
          className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Add Driver
        </button>
      </div>

      {/* Drivers Table */}
      <Card>
        {loading ? (
          <p>Loading...</p>
        ) : drivers.length === 0 ? (
          <p className="text-slate-600">No drivers yet. Click “Add Driver”.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm text-slate-600">
                  <th className="border-b p-3">Name</th>
                  <th className="border-b p-3">Current Shift Hours</th>
                  <th className="border-b p-3">Past 7 Days (hrs)</th>
                  <th className="border-b p-3 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d._id} className="align-top">
                    <td className="border-b p-3">{d.name}</td>
                    <td className="border-b p-3">{d.currentShiftHours}</td>
                    <td className="border-b p-3">
                      {Array.isArray(d.past7DayHours) ? d.past7DayHours.join(", ") : "-"}
                    </td>
                    <td className="border-b p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(d)}
                          className="text-sm font-semibold rounded-md bg-[#04160E] px-4 py-1.5 text-white shadow-md hover:opacity-90 transition-opacity"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteDriver(d._id)}
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

      {/* Modal Form */}
      <Modal
        open={modalOpen}
        title={editingId ? "Edit Driver" : "Add Driver"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={saveDriver} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Name</label>
            <input
              className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Current Shift Hours</label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
              value={form.currentShiftHours}
              onChange={(e) =>
                setForm({ ...form, currentShiftHours: Number(e.target.value) || 0 })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Past 7 Day Hours</label>
            <div className="mt-1 grid grid-cols-7 gap-2">
              {form.past7DayHours.map((v, i) => (
                <input
                  key={i}
                  type="number"
                  min={0}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                  value={v}
                  onChange={(e) => setPastHour(i, e.target.value)}
                  required
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Enter exactly 7 values (hours for last 7 days).
            </p>
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
