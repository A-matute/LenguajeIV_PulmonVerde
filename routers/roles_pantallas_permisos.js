const express = require('express');
const router = express.Router();
const db = require('../config/db-connection');

router.get('/roles_pantallas_permisos', (req, res) => {
    const columnas = 'cod_pantalla, cod_rol, cod_permiso';
    db.query('CALL PA_SELECT(?, ?)', ['roles_pantallas_permisos', columnas], (err, results) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        res.status(200).json(results[0]);
    });
});

router.post('/roles_pantallas_permisos', (req, res) => {
    const { cod_pantalla, cod_rol, cod_permiso } = req.body;
    const datos = `${cod_pantalla}, ${cod_rol}, ${cod_permiso}`;
    db.query('CALL PA_INSERT(?, ?, ?)', ['roles_pantallas_permisos', 'cod_pantalla, cod_rol, cod_permiso', datos], (err) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        res.status(201).json({ mensaje: 'Rol-Pantalla-Permiso insertado correctamente' });
    });
});

router.put('/roles_pantallas_permisos', (req, res) => {
    const { dato_actualizar, nuevo_dato, condicion, v_condicion } = req.body;
    let nuevoDato = typeof nuevo_dato === 'number' ? `${nuevo_dato}` : `'${nuevo_dato}'`;
    let valorCondicion = typeof v_condicion === 'number' ? `${v_condicion}` : `'${v_condicion}'`;
    db.query('CALL PA_UPDATE(?, ?, ?, ?, ?)', ['roles_pantallas_permisos', dato_actualizar, nuevoDato, condicion, `= ${valorCondicion}`], (err) => {
        if (err) return res.status(500).json({ error: true, mensaje: err.sqlMessage });
        res.status(200).json({ mensaje: 'Registro actualizado correctamente' });
    });
});

module.exports = router;
