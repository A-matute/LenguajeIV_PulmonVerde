// Importamos Express
const express = require('express');

// Creamos un router independiente de Express
const router = express.Router();

// Importamos la conexión a la base de datos (desde config/db-connection.js)
const db = require('../config/db-connection');



router.get('/backups', (req, res) => {
    // Definimos las columnas que queremos traer de la tabla backups
    const columnas = 'cod_backup, fecha_backup, ruta_archivo, tipo_backup, cod_usuario';

    // Definimos el nombre de la tabla
    const tabla = 'backups';

    // Llamamos al procedimiento almacenado PA_SELECT en MySQL
    db.query('CALL PA_SELECT(?, ?)', [tabla, columnas], (err, results) => {
        if (err) {
            console.error('Ocurrió un error en el procedimiento almacenado SELECT:', err.sqlMessage || err.message || err);
            res.status(500).json({
                error: true,
                respuesta: err.sqlMessage || err.message
            });
        } else {
            res.status(200).json(results[0]);
        }
    });
});


router.post('/backups', (req, res) => {
    // Extraer los campos del body de la petición
    const {
        cod_backup,
        fecha_backup,
        ruta_archivo,
        tipo_backup,
        cod_usuario
    } = req.body;

    const tabla = 'backups';

    // Definimos las columnas de la tabla backups
    const columnas = 'cod_backup, fecha_backup, ruta_archivo, tipo_backup, cod_usuario';

    // Armamos los valores dinámicos para el INSERT
    // OJO:
    // - cod_backup y cod_usuario son numéricos (sin comillas)
    // - los demás son strings o datetime (con comillas simples)
    const datos = `${cod_backup}, '${fecha_backup}', '${ruta_archivo}', '${tipo_backup}', ${cod_usuario}`;

    // Llamamos al procedimiento almacenado PA_INSERT
    db.query('CALL PA_INSERT(?, ?, ?)', [tabla, columnas, datos], (err, results) => {
        if (err) {
            console.error('Error en el procedimiento almacenado INSERT:', err.sqlMessage || err.message || err);
            res.status(500).json({
                error: true,
                respuesta: err.sqlMessage || err.message
            });
        } else {
            res.status(201).json({
                respuesta: 'Registro insertado correctamente en la tabla backups.'
            });
        }
    });
});


router.put('/backups', (req, res) => {

    // Extraemos datos del body JSON que nos envía el cliente
    const {
        dato_actualizar,
        nuevo_dato,
        condicion,
        v_condicion
    } = req.body || {};

    // Validamos que no falte ninguno de los datos necesarios.
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

    // Nombre de la tabla en la base de datos
    const tabla = 'backups';

    // Armamos el nuevo valor a asignar.
    // Si es numérico, se queda sin comillas; si es texto o datetime, se encierran en comillas simples.
    let nuevoDato;
    if (typeof nuevo_dato === 'number') {
        nuevoDato = `${nuevo_dato}`;
    } else {
        nuevoDato = `'${nuevo_dato}'`;
    }

    // Armamos el valor de la condición del WHERE.
    let valorCondicion;
    if (typeof v_condicion === 'number') {
        valorCondicion = `${v_condicion}`;
    } else {
        valorCondicion = `'${v_condicion}'`;
    }

    // Llamamos al procedimiento almacenado PA_UPDATE.
    // Parámetros:
    // - tabla → 'backups'
    // - dato_actualizar → columna a actualizar
    // - nuevoDato → nuevo valor
    // - condicion → columna de la condición (WHERE)
    // - '= valorCondicion' → condición completa
    db.query(
        'CALL PA_UPDATE(?, ?, ?, ?, ?)',
        [tabla, dato_actualizar, nuevoDato, condicion, `= ${valorCondicion}`],
        (err, results) => {
            if (err) {
                console.error('Error en el procedimiento almacenado UPDATE:', err.sqlMessage || err.message || err);
                res.status(500).json({
                    error: true,
                    respuesta: err.sqlMessage || err.message
                });
            } else {
                res.status(200).json({
                    respuesta: 'Registro actualizado correctamente en la tabla backups.'
                });
            }
        }
    );
});









// Exportamos el router para que pueda ser utilizado en index.js
module.exports = router;