import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, unique: true, index: true, required: true },
    valueRs: { type: Number, required: true },
    routeId: { type: Number, required: true, index: true },
    deliveryTime: { type: String, required: true } // "HH:MM"
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);
export default Order;
