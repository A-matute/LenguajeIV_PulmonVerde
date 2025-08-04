// Importamos Express
const express = require('express');
// Creamos un router independiente de Express
const router = express.Router();
// Importamos la conexión a la base de datos
const db = require('../config/db-connection');

// =======================================
// GET - OBTENER TODOS LOS PARQUES
// =======================================
// ANA R. CABRERA - Esta ruta usa el PA_SELECT para obtener todos los parques
router.get('/parques', (req, res) => {
    const columnas = 'cod_parque, nombre_parque, ubicacion_parque, fecha_inauguracion, estado';
    const tabla = 'parques';

    db.query('CALL PA_SELECT(?, ?)', [tabla, columnas], (err, results) => {
        if (err) {
            console.error('Ocurrió un error en el procedimiento almacenado:', err.sqlMessage || err.message || err);
            res.status(500).json({
                error: true,
                respuesta: err.sqlMessage || err.message
            });
        } else {
            // El resultado del PA es un array de arrays, tomamos el primero
            res.status(200).json(results[0]);
        }
    });
});

// =======================================
// GET - OBTENER UN PARQUE ESPECÍFICO
// =======================================
// ANA R. CABRERA - Esta ruta obtiene un solo parque usando un SELECT directo
router.get('/parques/:cod_parque', (req, res) => {
    const { cod_parque } = req.params;
    const tabla = 'parques';

    // Construimos la consulta SQL de forma segura
    const sql = `SELECT * FROM ${tabla} WHERE cod_parque = ?`;

    db.query(sql, [cod_parque], (err, results) => {
        if (err) {
            console.error('Error al obtener un parque específico:', err.sqlMessage || err.message || err);
            res.status(500).json({
                error: true,
                respuesta: err.sqlMessage || err.message
            });
        } else {
            // La API de la base de datos devuelve un array, que podría estar vacío
            res.status(200).json(results);
        }
    });
});

// =======================================
// POST - INSERTAR NUEVO PARQUE
// =======================================
// ANA R. CABRERA - Se ha modificado para generar el cod_parque manualmente,
// ya que la columna no está configurada como AUTO_INCREMENT.
router.post('/parques', (req, res) => {
    const {
        nombre_parque,
        ubicacion_parque,
        fecha_inauguracion,
        estado
    } = req.body;

    if (!nombre_parque || !ubicacion_parque) {
        return res.status(400).json({ error: true, respuesta: 'Faltan campos obligatorios: nombre_parque y ubicacion_parque.' });
    }

    // Primero, obtenemos el último código de parque para generar el siguiente
    db.query('SELECT MAX(cod_parque) as max_cod FROM parques', (err, result) => {
        if (err) {
            console.error('Error al obtener el código máximo del parque:', err.sqlMessage || err.message || err);
            return res.status(500).json({
                error: true,
                respuesta: err.sqlMessage || err.message
            });
        }

        // Generamos el nuevo código de parque
        let nuevo_cod = 1; // Valor inicial si la tabla está vacía
        if (result[0].max_cod) {
            nuevo_cod = result[0].max_cod + 1;
        }

        const tabla = 'parques';
        const columnas = 'cod_parque, nombre_parque, ubicacion_parque, fecha_inauguracion, estado';
        
        // Creamos la lista de valores con el nuevo código
        const valores = `${nuevo_cod}, "${nombre_parque}", "${ubicacion_parque}", "${fecha_inauguracion}", "${estado}"`;

        // Llamamos al procedimiento almacenado PA_INSERT con los datos completos
        db.query('CALL PA_INSERT(?, ?, ?)', [tabla, columnas, valores], (err, results) => {
            if (err) {
                console.error('Error al insertar el parque:', err.sqlMessage || err.message || err);
                res.status(500).json({
                    error: true,
                    respuesta: err.sqlMessage || err.message
                });
            } else {
                res.status(201).json({
                    respuesta: 'Parque insertado correctamente en la base de datos.'
                });
            }
        });
    });
});

// =======================================
// PUT - ACTUALIZAR UN PARQUE
// =======================================
// ANA R. CABRERA - Se ha modificado para usar una consulta SQL directa,
// ya que el procedimiento almacenado PA_UPDATE no coincidía con los requisitos de la aplicación.
router.put('/parques/:cod_parque', (req, res) => {
    const { cod_parque } = req.params;
    const {
        nombre_parque,
        ubicacion_parque,
        fecha_inauguracion,
        estado
    } = req.body;

    if (!nombre_parque || !ubicacion_parque) {
        return res.status(400).json({
            error: true,
            respuesta: 'Faltan campos obligatorios para la actualización: nombre_parque y ubicacion_parque.'
        });
    }

    // Usamos una consulta UPDATE segura con placeholders para actualizar múltiples campos
    const sql = `UPDATE parques SET nombre_parque = ?, ubicacion_parque = ?, fecha_inauguracion = ?, estado = ? WHERE cod_parque = ?`;
    const values = [nombre_parque, ubicacion_parque, fecha_inauguracion, estado, cod_parque];
    
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error al actualizar el parque:', err.sqlMessage || err.message || err);
            res.status(500).json({
                error: true,
                respuesta: err.sqlMessage || err.message
            });
        } else {
            res.status(200).json({
                respuesta: 'Parque actualizado correctamente.'
            });
        }
    });
});


// Exportamos el router para que pueda ser utilizado en index.js
module.exports = router;

