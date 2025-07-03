// Importamos Express
const express = require('express');
// Creamos un router independiente de Express
const router = express.Router();
// Importamos la conexión a la base de datos (desde models/personas-model.js)
const db = require('../config/db-connection');

// =======================================
// GET - OBTENER TODOS LOS PARQUES
// =======================================
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
            res.status(200).json(results[0]);
        }
    });
});

// =======================================
// POST - INSERTAR NUEVO PARQUE
// =======================================
router.post('/parques', (req, res) => {
    const {
        cod_parque,
        nombre_parque,
        ubicacion_parque,
        fecha_inauguracion,
        estado
    } = req.body;

    const tabla = 'parques';
    const columnas = 'cod_parque, nombre_parque, ubicacion_parque, fecha_inauguracion, estado';
    const datos = `${cod_parque}, '${nombre_parque}', '${ubicacion_parque}', '${fecha_inauguracion}', ${estado}`;

    db.query('CALL PA_INSERT(?, ?, ?)', [tabla, columnas, datos], (err, results) => {
        if (err) {
            console.error('Error en el procedimiento almacenado INSERT:', err.sqlMessage || err.message || err);
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

// =======================================
// PUT - ACTUALIZAR UN PARQUE
// =======================================
router.put('/parques', (req, res) => {
    const {
        dato_actualizar,
        nuevo_dato,
        condicion,
        v_condicion
    } = req.body || {};

    if (
        !dato_actualizar ||
        nuevo_dato === undefined ||
        !condicion ||
        v_condicion === undefined
    ) {
        return res.status(400).json({
            error: true,
            message: 'Faltan campos obligatorios en el JSON enviado.'
        });
    }

    const tabla = 'parques';

    // Armamos el nuevo dato
    let nuevoDato;
    if (typeof nuevo_dato === 'number') {
        nuevoDato = `${nuevo_dato}`;
    } else {
        nuevoDato = `'${nuevo_dato}'`;
    }

    // Armamos el valor de la condición
    let valorCondicion;
    if (typeof v_condicion === 'number') {
        valorCondicion = `${v_condicion}`;
    } else {
        valorCondicion = `'${v_condicion}'`;
    }

    db.query(
        'CALL PA_UPDATE(?, ?, ?, ?, ?)',
        [tabla, dato_actualizar, nuevoDato, condicion, `= ${valorCondicion}`],
        (err, results) => {
            if (err) {
                console.error('❌ Error en el procedimiento almacenado UPDATE:', err.sqlMessage || err.message || err);
                res.status(500).json({
                    error: true,
                    respuesta: err.sqlMessage || err.message
                });
            } else {
                res.status(200).json({
                    respuesta: 'Parque actualizado correctamente.'
                });
            }
        }
    );
});


// Exportamos el router para que pueda ser utilizado en index.js
module.exports = router;