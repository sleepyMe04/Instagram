const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ 
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ]
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('🔥 MongoDB Connected Successfully!'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('🔄 MongoDB reconnected'));

app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));   // ← ADD THIS
app.use('/api/users', require('./routes/users'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
