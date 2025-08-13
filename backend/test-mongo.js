require('dotenv').config();
const { MongoClient } = require('mongodb');
(async () => {
try {
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
await client.db().command({ ping: 1 });
console.log('Connected and ping OK');
await client.close();
} catch (e) {
console.error('Connect error:', e);
}
})();