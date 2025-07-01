// Importamos Express
const express = require('express');

// Creamos un router independiente de Express
const router = express.Router();

// Importamos la conexión a la base de datos (desde models/personas-model.js)
const db = require('../models/db-connection');

// Definimos una ruta GET para obtener todos los registros de las personas.
router.get('/personas', (req, res) => {
    // Definimos las columnas que queremos traer de la tabla
    // Estas son las columnas de la tabla personas
    const columnas = 'cod_persona, DNI, nombre, apellido, fecha_nacimiento, genero, nacionalidad';

    // Definimos el nombre de la tabla
    const tabla = 'personas';

     // Construimos un query SQL completo en forma de texto
    // Ejemplo:
    // SELECT cod_persona, DNI, nombre, apellido, fecha_nacimiento, genero, nacionalidad FROM personas
    const querySQL = `SELECT ${columnas} FROM ${tabla}`;

    // Llamamos al procedimiento almacenado SEL_PERSONAS en MySQL
    // Le pasamos un solo parámetro: el query SQL completo (querySQL)
    db.query('CALL SEL_PERSONAS(?)', [querySQL], (err, results) => {
        // Si hubo error al ejecutar el procedimiento
        if (err) {
            // Imprimimos el error en consola para depuración
            console.error('Ocurrio un error en el procedimiento almacenado:', err.sqlMessage || err.message || err);
             // Respondemos al cliente con un JSON que indica error
            res.status(500).json({
                error: true,
                respuesta: err.sqlMessage || err.message
            });
        } else {
             // Si no hubo error, devolvemos el resultado
            // results es un arreglo de arreglos porque CALL siempre devuelve arrays
            res.status(200).json(results[0]);
        }
    });
});


// Ruta POST para insertar una nueva persona.
router.post('/personas', (req, res) => {
    // Extraer cod_persona y los demás campos del body
    const {
        cod_persona,
        DNI,
        nombre,
        apellido,
        fecha_nacimiento,
        genero,
        nacionalidad
    } = req.body;

    const tabla = 'personas';

    // Armamos la lista de columnas
    const columnas = 'cod_persona, DNI, nombre, apellido, fecha_nacimiento, genero, nacionalidad';

    // Armamos los valores, con cod_persona sin comillas (porque es número)
    const datos = `${cod_persona}, '${DNI}', '${nombre}', '${apellido}', '${fecha_nacimiento}', '${genero}', '${nacionalidad}'`;

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


// Definimos la ruta PUT para actualizar registro en la tabla personas.
router.put('/personas', (req, res) => {

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
    const tabla = 'personas';

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
module.exports = router;
