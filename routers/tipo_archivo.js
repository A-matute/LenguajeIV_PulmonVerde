// Importamos Express
const express = require('express');

// Creamos un router independiente de Express
const routertipo_archivo = express.Router();

// Importamos la conexión a la base de datos 
const db = require('../config/db-connection');

// Definimos una ruta GET para obtener todos los registros de os archivos.
routertipo_archivo.get('/tipo_archivo', (req, res) => {
    // Definimos las columnas que queremos traer de la tabla.
    // Estas columnas se usarán en el SELECT dinámico del procedimiento almacenado.
    const columnas = 'cod_tipo_archivo, nombre';

    // Definimos el nombre de la tabla.
    const tabla = 'tipo_archivo';

    // Llamamos al procedimiento almacenado PA_SELECT en MySQL.
    // IMPORTANTE: El orden de los parámetros es:
    //   1. nombre de la tabla
    //   2. lista de columnas
    //
    // Si los envías al revés, MySQL tratará las columnas como nombre de tabla y fallará.
    db.query('CALL PA_SELECT(?, ?)', [tabla, columnas], (err, results) => {
        if (err) {
            // Si ocurre un error en el SP, lo mostramos en consola
            // y respondemos con un error 500 (error del servidor).
            console.error('Ocurrió un error en el procedimiento almacenado:', err.sqlMessage || err.message || err);
            res.status(500).json({
                error: true,
                respuesta: err.sqlMessage || err.message
            });
        } else {
            // Si no hay error, devolvemos los resultados en formato JSON.
            // results[0] contiene las filas devueltas por el SELECT dinámico.
            res.status(200).json(results[0]);
        }
    });
});


// Ruta POST para insertar un nuevo tipo_archivo.
routertipo_archivo.post('/tipo_archivo', (req, res) => {
    // Extraer los campos del body
    const {
        cod_tipo_archivo,
        nombre
    } = req.body;

    const tabla = 'tipo_archivo';

    // Armamos la lista de columnas
    const columnas = 'cod_tipo_archivo, nombre';

    // Armamos los valores, con cod_tipo_archivo sin comillas (porque es número)
    const datos = `${cod_tipo_archivo}, '${nombre}'`;

    // Llamamos al procedimiento almacenado
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


// Definimos la ruta PUT para actualizar registro en la tabla tipo_archivo.
routertipo_archivo.put('/tipo_archivo', (req, res) => {

    // Extraemos datos del body JSON que nos envía el cliente (Postman, frontend, etc.)
    // Usamos destructuring para sacar directamente las variables del objeto JSON.
    const {
        dato_actualizar,
        nuevo_dato,
        condicion,
        v_condicion
    } = req.body || {};

    // Validamos que no falte ninguno de los datos necesarios.
    // Si alguno está vacío o undefined, devolvemos un error 400 (Bad Request).
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
    const tabla = 'tipo_archivo';

    // Armamos el valor que queremos asignar en el UPDATE.
    // Si es número, lo dejamos sin comillas (ej: 25)
    // Si es texto, lo encerramos entre comillas simples (ej: 'Alex')
    let nuevoDato;
    if (typeof nuevo_dato === 'number') {
        nuevoDato = `${nuevo_dato}`;
    } else {
        nuevoDato = `'${nuevo_dato}'`;
    }

    // Armamos el valor para la condición del WHERE.
    // Igual que arriba: números sin comillas, texto con comillas.
    let valorCondicion;
    if (typeof v_condicion === 'number') {
        valorCondicion = `${v_condicion}`;
    } else {
        valorCondicion = `'${v_condicion}'`;
    }

    // Llamamos al procedimiento almacenado PA_UPDATE en MySQL.
    // Le enviamos los parámetros necesarios:
    // - tabla: nombre de la tabla (e.g. 'personas')
    // - dato_actualizar: columna que queremos modificar (e.g. 'nombre')
    // - nuevoDato: nuevo valor (e.g. 'Alex')
    // - condicion: campo por el cual filtrar (e.g. 'cod_persona')
    // - '= valorCondicion': condición de igualdad (e.g. '= 110')
    db.query(
        'CALL PA_UPDATE(?, ?, ?, ?, ?)',
        [tabla, dato_actualizar, nuevoDato, condicion, `= ${valorCondicion}`],
        (err, results) => {
            if (err) {
                // Si ocurre un error en la ejecución del procedimiento almacenado,
                // lo mostramos en consola y devolvemos un error 500 al cliente.
                console.error('❌ Error en el procedimiento almacenado UPDATE:', err.sqlMessage || err.message || err);
                res.status(500).json({
                    error: true,
                    respuesta: err.sqlMessage || err.message
                });
            } else {
                // Si todo salió bien, devolvemos un mensaje de éxito.
                res.status(200).json({
                    respuesta: 'Registro actualizado correctamente.'
                });
            }
        }
    );
});


// Exportamos el router para que pueda ser utilizado en index.js
module.exports = routertipo_archivo;