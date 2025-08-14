import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 4000;
const API_BASE_URL = process.env.API_BASE_URL;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Server running on port ${API_BASE_URL}`);
  });
});
