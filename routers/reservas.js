const express = require('express');
const router = express.Router();
const db = require('../config/db-connection');

router.get('/reservas', (req, res) => {
    const columnas = 'cod_reserva, fecha_reserva, cod_detalle_reserva, cod_usuario';
    db.query('CALL PA_SELECT(?, ?)', ['reservas', columnas], (err, results) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        res.status(200).json(results[0]);
    });
});

router.get('/reservas/:id', (req, res) => {
    const id = req.params.id;
    const columnas = 'cod_reserva, fecha_reserva, cod_detalle_reserva, cod_usuario';
    db.query('CALL PA_SELECT_WHERE(?, ?, ?, ?, ?)', ['reservas', columnas, 'cod_reserva', '=', id], (err, results) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        if (results[0].length === 0) return res.status(404).json({ error: true, mensaje: 'Reserva no encontrada' });
        res.status(200).json(results[0][0]);
    });
});

router.post('/reservas', (req, res) => {
    const { cod_reserva, fecha_reserva, cod_detalle_reserva, cod_usuario } = req.body;
    const datos = `${cod_reserva}, '${fecha_reserva}', ${cod_detalle_reserva}, ${cod_usuario}`;
    db.query('CALL PA_INSERT(?, ?, ?)', ['reservas', 'cod_reserva, fecha_reserva, cod_detalle_reserva, cod_usuario', datos], (err) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        res.status(201).json({ mensaje: 'Reserva insertada correctamente' });
    });
});

router.put('/reservas', (req, res) => {
    const { dato_actualizar, nuevo_dato, condicion, v_condicion } = req.body;
    let nuevoDato = typeof nuevo_dato === 'number' ? `${nuevo_dato}` : `'${nuevo_dato}'`;
    let valorCondicion = typeof v_condicion === 'number' ? `${v_condicion}` : `'${v_condicion}'`;
    db.query('CALL PA_UPDATE(?, ?, ?, ?, ?)', ['reservas', dato_actualizar, nuevoDato, condicion, `= ${valorCondicion}`], (err) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        res.status(200).json({ mensaje: 'Reserva actualizada correctamente' });
    });
});

module.exports = router;
