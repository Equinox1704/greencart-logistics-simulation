import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';
import { connect, disconnect } from 'mongoose';
import { deleteMany, insertMany } from '../models/Route';
import { deleteMany as _deleteMany, insertMany as _insertMany } from '../models/Order';
import { deleteMany as __deleteMany, insertMany as __insertMany } from '../models/Driver';
import { deleteMany as ___deleteMany, create } from '../models/User';
import { hash } from 'bcryptjs';
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
await connect(MONGODB_URI);

// Routes
const routesCsv = readFileSync(join(__dirname,'../data/routes.csv'));
const routes = parse(routesCsv, { columns: true, skip_empty_lines: true });
await deleteMany({});
await insertMany(routes.map(r => ({
routeId: Number(r.route_id),
distanceKm: Number(r.distance_km),
trafficLevel: r.traffic_level,
baseTimeMin: Number(r.base_time_min)
})));

// Orders
const ordersCsv = readFileSync(join(__dirname,'../data/orders.csv'));
const orders = parse(ordersCsv, { columns: true, skip_empty_lines: true });
await _deleteMany({});
await _insertMany(orders.map(o => ({
orderId: Number(o.order_id),
valueRs: Number(o.value_rs),
routeId: Number(o.route_id),
deliveryTime: o.delivery_time
})));

// Drivers
const driversJson = JSON.parse(readFileSync(join(__dirname,'../data/drivers.json')));
await __deleteMany({});
await __insertMany(driversJson);

// Manager user
const email = 'admin@greencart.local';
const passwordHash = await hash('Admin@123', 10);
await ___deleteMany({}); // optional
await create({ email, passwordHash, role: 'manager' });

console.log('Seed complete.');
await disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });