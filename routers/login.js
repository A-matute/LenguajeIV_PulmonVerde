// Importamos Express
const express = require('express');

// Creamos un router independiente de Express
const router = express.Router();

// Importamos la conexión a la base de datos (desde config/db-connection.js)
const db = require('../config/db-connection');



// Ruta POST /login
router.post('/login', (req, res) => {
    const { nombre_usuario, contrasena } = req.body;

    if (!nombre_usuario || !contrasena) {
        return res.status(400).json({ error: true, mensaje: 'Faltan datos' });
    }

    const sql = `
        SELECT * FROM usuarios 
        WHERE nombre_usuario = ? 
        AND contrasena = ? 
        AND estado_usuario = 'activo'
        LIMIT 1
    `;

    db.query(sql, [nombre_usuario, contrasena], (err, results) => {
        if (err) {
            return res.status(500).json({ error: true, mensaje: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: true, mensaje: 'Credenciales incorrectas o usuario inactivo' });
        }

        const usuario = results[0];
        res.status(200).json({
            mensaje: 'Login exitoso',
            usuario: {
                cod_usuario: usuario.cod_usuario,
                nombre_usuario: usuario.nombre_usuario,
                cod_permiso: usuario.cod_permiso
            }
        });
    });
});



// Exportamos el router para que pueda ser utilizado en index.js
module.exports = router;