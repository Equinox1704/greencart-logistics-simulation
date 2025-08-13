import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Card from "../components/Card";
import Modal from "../components/Modal";

const emptyForm = {
  orderId: "",
  valueRs: "",
  routeId: "",
  deliveryTime: "01:00", // HH:MM
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const routeOptions = useMemo(
    () => (routes || []).map((r) => ({ id: r._id, routeId: r.routeId })),
    [routes]
  );

  async function fetchData() {
    setLoading(true);
    try {
      const [ordersRes, routesRes] = await Promise.all([
        api.get("/orders"),
        api.get("/routes"),
      ]);
      setOrders(ordersRes.data || []);
      setRoutes(routesRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(o) {
    setEditingId(o._id);
    setForm({
      orderId: o.orderId ?? "",
      valueRs: o.valueRs ?? "",
      routeId: o.routeId ?? "",
      deliveryTime: o.deliveryTime ?? "01:00",
    });
    setError("");
    setModalOpen(true);
  }

  async function saveOrder(e) {
    e.preventDefault();
    setError("");

    const payload = {
      orderId: Number(form.orderId),
      valueRs: Number(form.valueRs),
      routeId: Number(form.routeId),
      deliveryTime: form.deliveryTime, // "HH:MM"
    };

    // Validate route exists locally
    const routeExists = routes.some((r) => Number(r.routeId) === payload.routeId);
    if (!routeExists) {
      setError("Selected Route ID does not exist.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/orders/${editingId}`, payload);
      } else {
        await api.post("/orders", payload);
      }
      setModalOpen(false);
      fetchData();
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

  async function deleteOrder(id) {
    if (!confirm("Delete this order?")) return;
    try {
      await api.delete(`/orders/${id}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Orders</h2>
        <button
          onClick={openCreate}
          className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Add Order
        </button>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-slate-600">No orders yet. Click “Add Order”.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm text-slate-600">
                  <th className="border-b p-3">Order ID</th>
                  <th className="border-b p-3">Value (₹)</th>
                  <th className="border-b p-3">Route ID</th>
                  <th className="border-b p-3">Delivery Time</th>
                  <th className="border-b p-3 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="align-top">
                    <td className="border-b p-3">{o.orderId}</td>
                    <td className="border-b p-3">{o.valueRs}</td>
                    <td className="border-b p-3">{o.routeId}</td>
                    <td className="border-b p-3">{o.deliveryTime}</td>
                    <td className="border-b p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(o)}
                          className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteOrder(o._id)}
                          className="rounded-md border px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 border-rose-200"
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
        title={editingId ? "Edit Order" : "Add Order"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={saveOrder} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Order ID</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                required
                disabled={!!editingId} // keep orderId immutable
              />
            </div>

            <div>
              <label className="text-sm text-slate-600">Value (₹)</label>
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                value={form.valueRs}
                onChange={(e) => setForm({ ...form, valueRs: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-600">Route ID</label>
              <select
                className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                value={form.routeId}
                onChange={(e) => setForm({ ...form, routeId: e.target.value })}
                required
              >
                <option value="" disabled>
                  Select route
                </option>
                {routeOptions.map((r) => (
                  <option key={r.id} value={r.routeId}>
                    {r.routeId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-600">Delivery Time</label>
              <input
                type="time"
                className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-600 focus:ring-emerald-600"
                value={form.deliveryTime}
                onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-md border px-4 py-2 hover:bg-slate-50"
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
