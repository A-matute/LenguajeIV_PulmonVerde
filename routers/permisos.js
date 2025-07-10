const express = require('express');
const router = express.Router();
const db = require('../config/db-connection');

// GET todos los permisos
router.get('/permisos', (req, res) => {
    const columnas = 'cod_permiso, nombre_permiso, descripcion, fecha_creacion';
    const tabla = 'permisos';
    db.query('CALL PA_SELECT(?, ?)', [tabla, columnas], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        }
        res.status(200).json(results[0]);
    });
});

// GET permiso por id
router.get('/permisos/:id', (req, res) => {
    const id = req.params.id;
    const columnas = 'cod_permiso, nombre_permiso, descripcion, fecha_creacion';
    db.query('CALL PA_SELECT_WHERE(?, ?, ?, ?, ?)', ['permisos', columnas, 'cod_permiso', '=', id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        }
        if (results[0].length === 0) {
            return res.status(404).json({ error: true, mensaje: 'Permiso no encontrado' });
        }
        res.status(200).json(results[0][0]);
    });
});

// POST insertar permiso
router.post('/permisos', (req, res) => {
    const { cod_permiso, nombre_permiso, descripcion, fecha_creacion } = req.body;
    const datos = `${cod_permiso}, '${nombre_permiso}', '${descripcion}', '${fecha_creacion}'`;
    db.query('CALL PA_INSERT(?, ?, ?)', ['permisos', 'cod_permiso, nombre_permiso, descripcion, fecha_creacion', datos], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        }
        res.status(201).json({ mensaje: 'Permiso insertado correctamente' });
    });
});

// PUT actualizar permiso
router.put('/permisos', (req, res) => {
    const { dato_actualizar, nuevo_dato, condicion, v_condicion } = req.body;
    let nuevoDato = typeof nuevo_dato === 'number' ? `${nuevo_dato}` : `'${nuevo_dato}'`;
    let valorCondicion = typeof v_condicion === 'number' ? `${v_condicion}` : `'${v_condicion}'`;
    db.query('CALL PA_UPDATE(?, ?, ?, ?, ?)', ['permisos', dato_actualizar, nuevoDato, condicion, `= ${valorCondicion}`], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        }
        res.status(200).json({ mensaje: 'Permiso actualizado correctamente' });
    });
});

module.exports = router;
