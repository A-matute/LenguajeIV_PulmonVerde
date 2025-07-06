const express = require('express');
const router = express.Router();
const db = require('../config/db-connection');

router.get('/roles', (req, res) => {
    const columnas = 'cod_rol, nombre_rol, descripcion_rol, fecha_creacion, estado';
    db.query('CALL PA_SELECT(?, ?)', ['roles', columnas], (err, results) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        res.status(200).json(results[0]);
    });
});

router.get('/roles/:id', (req, res) => {
    const id = req.params.id;
    const columnas = 'cod_rol, nombre_rol, descripcion_rol, fecha_creacion, estado';
    db.query('CALL PA_SELECT_WHERE(?, ?, ?, ?, ?)', ['roles', columnas, 'cod_rol', '=', id], (err, results) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        if (results[0].length === 0) return res.status(404).json({ error: true, mensaje: 'Rol no encontrado' });
        res.status(200).json(results[0][0]);
    });
});

router.post('/roles', (req, res) => {
    const { cod_rol, nombre_rol, descripcion_rol, fecha_creacion, estado } = req.body;
    const datos = `${cod_rol}, '${nombre_rol}', '${descripcion_rol}', '${fecha_creacion}', ${estado}`;
    db.query('CALL PA_INSERT(?, ?, ?)', ['roles', 'cod_rol, nombre_rol, descripcion_rol, fecha_creacion, estado', datos], (err) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        res.status(201).json({ mensaje: 'Rol insertado correctamente' });
    });
});

router.put('/roles', (req, res) => {
    const { dato_actualizar, nuevo_dato, condicion, v_condicion } = req.body;
    let nuevoDato = typeof nuevo_dato === 'number' ? `${nuevo_dato}` : `'${nuevo_dato}'`;
    let valorCondicion = typeof v_condicion === 'number' ? `${v_condicion}` : `'${v_condicion}'`;
    db.query('CALL PA_UPDATE(?, ?, ?, ?, ?)', ['roles', dato_actualizar, nuevoDato, condicion, `= ${valorCondicion}`], (err) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        res.status(200).json({ mensaje: 'Rol actualizado correctamente' });
    });
});

module.exports = router;
