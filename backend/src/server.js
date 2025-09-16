const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);


app.listen(PORT, () => console.log(`Server started on port ${PORT}`));