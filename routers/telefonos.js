const express = require('express');
const router = express.Router();
const db = require('../config/db-connection');

router.get('/telefonos', (req, res) => {
    const columnas = 'cod_telefono, numero_telefono, fecha_registro, estado_telefono, cod_persona, cod_parque';
    db.query('CALL PA_SELECT(?, ?)', ['telefonos', columnas], (err, results) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        res.status(200).json(results[0]);
    });
});

router.get('/telefonos/:id', (req, res) => {
    const id = req.params.id;
    const columnas = 'cod_telefono, numero_telefono, fecha_registro, estado_telefono, cod_persona, cod_parque';
    db.query('CALL PA_SELECT_WHERE(?, ?, ?, ?, ?)', ['telefonos', columnas, 'cod_telefono', '=', id], (err, results) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        if (results[0].length === 0) return res.status(404).json({ error: true, mensaje: 'Teléfono no encontrado' });
        res.status(200).json(results[0][0]);
    });
});

router.post('/telefonos', (req, res) => {
    const { cod_telefono, numero_telefono, fecha_registro, estado_telefono, cod_persona, cod_parque } = req.body;
    const datos = `${cod_telefono}, '${numero_telefono}', '${fecha_registro}', ${estado_telefono}, ${cod_persona || 'NULL'}, ${cod_parque || 'NULL'}`;
    db.query('CALL PA_INSERT(?, ?, ?)', ['telefonos', 'cod_telefono, numero_telefono, fecha_registro, estado_telefono, cod_persona, cod_parque', datos], (err) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        res.status(201).json({ mensaje: 'Teléfono insertado correctamente' });
    });
});

router.put('/telefonos', (req, res) => {
    const { dato_actualizar, nuevo_dato, condicion, v_condicion } = req.body;
    let nuevoDato = typeof nuevo_dato === 'number' ? `${nuevo_dato}` : `'${nuevo_dato}'`;
    let valorCondicion = typeof v_condicion === 'number' ? `${v_condicion}` : `'${v_condicion}'`;
    db.query('CALL PA_UPDATE(?, ?, ?, ?, ?)', ['telefonos', dato_actualizar, nuevoDato, condicion, `= ${valorCondicion}`], (err) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        res.status(200).json({ mensaje: 'Teléfono actualizado correctamente' });
    });
});

module.exports = router;
