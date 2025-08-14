import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { connect, disconnect } from 'mongoose';
import Route from '../models/Route.js';
import Order from '../models/Order.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { hash } from 'bcryptjs';
import 'dotenv/config';

// recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  await connect(MONGODB_URI);

  // ----------------------
  // Seed Routes
  // ----------------------
  const routesCsv = readFileSync(join(__dirname, '../data/routes.csv'));
  const routes = parse(routesCsv, { columns: true, skip_empty_lines: true });
  await Route.deleteMany({});
  await Route.insertMany(
    routes.map(r => ({
      routeId: Number(r.route_id),
      distanceKm: Number(r.distance_km),
      trafficLevel: r.traffic_level,
      baseTimeMin: Number(r.base_time_min),
    }))
  );

  // ----------------------
  // Seed Orders
  // ----------------------
  const ordersCsv = readFileSync(join(__dirname, '../data/orders.csv'));
  const orders = parse(ordersCsv, { columns: true, skip_empty_lines: true });
  await Order.deleteMany({});
  await Order.insertMany(
    orders.map(o => ({
      orderId: Number(o.order_id),
      valueRs: Number(o.value_rs),
      routeId: Number(o.route_id),
      deliveryTime: o.delivery_time,
    }))
  );

  // ----------------------
  // Seed Drivers
  // ----------------------
  const driversJson = JSON.parse(readFileSync(join(__dirname, '../data/drivers.json')));
  await Driver.deleteMany({});
  await Driver.insertMany(driversJson);

  // ----------------------
  // Seed Manager User
  // ----------------------
  const email = 'admin@greencart.local';
  const passwordHash = await hash('Admin@123', 10);
  await User.deleteMany({});
  await User.create({ email, passwordHash, role: 'manager' });

  console.log('✅ Seed complete.');
  await disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
