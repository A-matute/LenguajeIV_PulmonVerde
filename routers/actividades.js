// Importamos Express
const express = require('express');

// Creamos un router independiente de Express
const router = express.Router();

// Importamos la conexión a la base de datos (desde models/personas-model.js)
const db = require('../config/db-connection');


router.get('/actividades', (req, res) => {
    // Definimos las columnas que queremos traer de la tabla actividades
    const columnas = 'cod_actividad, nombre_actividad, cantidad_personas, estado, cod_espacio';

    // Definimos el nombre de la tabla
    const tabla = 'actividades';

    // Llamamos al procedimiento almacenado PA_SELECT en MySQL
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

router.post('/actividades', (req, res) => {
    // Extraer los campos del body de la petición
    const {
        cod_actividad,
        nombre_actividad,
        descripcion,
        cantidad_personas,
        estado,
        cod_espacio
    } = req.body;

    const tabla = 'actividades';

    // Definimos las columnas de la tabla actividades (incluyendo descripcion)
    const columnas = 'cod_actividad, nombre_actividad, descripcion, cantidad_personas, estado, cod_espacio';

    // Armamos los valores dinámicos para el INSERT
    // OJO:
    // - cod_actividad, cantidad_personas y cod_espacio son numéricos (sin comillas)
    // - los demás son strings (con comillas simples)
    const datos = `${cod_actividad}, '${nombre_actividad}', '${descripcion}', ${cantidad_personas}, '${estado}', ${cod_espacio}`;

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
                respuesta: 'Registro insertado correctamente en la base de datos.'
            });
        }
    });
});


router.put('/actividades', (req, res) => {

    // Extraemos datos del body JSON que nos envía el cliente (Postman, frontend, etc.)
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
    const tabla = 'actividades';

    // Armamos el nuevo valor a asignar.
    // Si es numérico, se queda sin comillas; si es texto, se encierran en comillas simples.
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
    // - tabla → 'actividades'
    // - dato_actualizar → columna a actualizar
    // - nuevoDato → nuevo valor
    // - condicion → columna de la condición (WHERE)
    // - '= valorCondicion' → condición completa, e.g. '= 5' o '= "Clase de Yoga"'
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
                    respuesta: 'Registro actualizado correctamente.'
                });
            }
        }
    );
});





// Exportamos el router para que pueda ser utilizado en index.js
module.exports = router;