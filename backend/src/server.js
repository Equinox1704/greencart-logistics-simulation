import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
