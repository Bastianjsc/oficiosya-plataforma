require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const marketplaceRoutes = require('./routes/marketplace.routes');

const app = express();
connectDB();

const path = require('path');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// Declarar el uso de las rutas base
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.send('API REST de Servicios Locales funcionando correctamente');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});