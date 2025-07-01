// Importamos Express
const express = require('express');

// Creamos un router independiente de Express
const router = express.Router();

// Importamos la conexión a la base de datos (desde models/personas-model.js)
const db = require('../models/db-connection');

