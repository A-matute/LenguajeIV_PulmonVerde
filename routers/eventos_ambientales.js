// Importamos Express
const express = require('express');
// Importamos Moment.js
const moment = require('moment'); 

// Creamos un router independiente de Express
const router = express.Router();

// Importamos la conexión a la base de datos (desde config/db-connection.js)
const db = require('../config/db-connection');

// Definimos una ruta GET para obtener todos los registros de los eventos ambientales.
router.get('/eventos_ambientales', (req, res) => {
    // Llamamos al nuevo procedimiento almacenado que ya hace los JOINs.
    // No necesita parámetros.
    db.query('CALL PA_ObtenerEventosDetallados()', (err, results) => {
        if (err) {
            // Si ocurre un error, lo mostramos y respondemos con error 500.
            console.error('❌ Error al ejecutar el procedimiento almacenado:', err.sqlMessage || err.message || err);
            res.status(500).json({
                error: true,
                respuesta: err.sqlMessage || err.message
            });
        } else {
            // Si no hay error, devolvemos los resultados.
            // results[0] contiene las filas devueltas por el SELECT del SP.
            res.status(200).json(results[0]);
        }
    });
});


// Ruta POST para insertar un nuevo evento_ambiental.
router.post('/eventos_ambientales', (req, res) => {
    // Extraer cod_evento y los demás campos del body
    const {
        cod_evento,
        fecha_hora_evento,
        Descripcion,
        cod_tipo_evento,
        cod_parque,
        cod_especie
    } = req.body;

    // Agregar console.log para depuración y verificar los datos que llegan
    console.log('Datos recibidos para INSERT (Node.js):', req.body); 

    // Formateamos fecha_hora_evento: 'YYYY-MM-DDTHH:mm' a 'YYYY-MM-DD HH:mm:00' para MySQL
    const formattedFechaHora = moment(fecha_hora_evento).format('YYYY-MM-DD HH:mm:00');
    
    // Si cod_especie es null o cadena vacía (del frontend), usamos 0.
    // Aseguramos que sea un número para la inserción directa.
    const finalCodEspecie = (cod_especie === null || cod_especie === '') ? 0 : parseInt(cod_especie);

    // *** INICIO DE LA SOLUCIÓN: INSERTAMOS DIRECTAMENTE SIN PA_INSERT ***
    // Construimos la consulta INSERT directamente con placeholders (?).
    // El driver de MySQL (mysql2) se encargará de escapar y formatear los valores correctamente.
    const sql = `
        INSERT INTO eventos_ambientales (
            cod_evento, 
            fecha_hora_evento, 
            Descripcion, 
            cod_tipo_evento, 
            cod_parque, 
            cod_especie
        ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    // Pasamos los valores como un array al método query del driver MySQL.
    // Los valores se mapearán a los placeholders en el orden en que aparecen.
    const values = [
        cod_evento,
        formattedFechaHora,
        Descripcion,
        cod_tipo_evento,
        cod_parque,
        finalCodEspecie
    ];

    console.log('Consulta SQL para INSERT', sql);
    console.log('Valores para INSERT', values);

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error al insertar directamente en la base de datos:', err.sqlMessage || err.message || err);
            // Revisa si es un error de clave duplicada para dar un mensaje más específico.
            if (err.code === 'ER_DUP_ENTRY') {
                 res.status(409).json({ // 409 Conflict es apropiado para entradas duplicadas
                    error: true,
                    respuesta: `Error: Ya existe un evento con el código ${cod_evento}. Por favor, genera un nuevo código.`
                });
            } else if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
                res.status(400).json({
                    error: true,
                    respuesta: `Error de clave foránea: ${err.sqlMessage}`
                });
            }
            else {
                res.status(500).json({
                    error: true,
                    respuesta: `Error desconocido al insertar el registro: ${err.sqlMessage || err.message}`
                });
            }
        } else {
            // results.affectedRows es directamente accesible aquí
            if (results.affectedRows > 0) {
                res.status(201).json({ // 201 Created es apropiado para una inserción exitosa
                    respuesta: 'Registro insertado correctamente en la base de datos.'
                });
            } else {
                console.error('');
                res.status(400).json({ 
                    error: true,
                    respuesta: 'El registro no se insertó. '
                });
            }
        }
    });
});

// Definimos la ruta PUT para actualizar registro en la tabla eventos_ambientales.
router.put('/eventos_ambientales', (req, res) => {

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
    const tabla = 'eventos_ambientales';

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
    // - tabla: nombre de la tabla (e.g. 'empleados')
    // - dato_actualizar: columna que queremos modificar (e.g. 'nombre')
    // - nuevoDato: nuevo valor (e.g. 'Alex')
    // - condicion: campo por el cual filtrar (e.g. 'empleados')
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
                let rowsAffected = 0;
                // Para SPs, affectedRows suele estar en results[1]
                if (results && results.length > 1 && results[1] && results[1].affectedRows !== undefined) {
                    rowsAffected = results[1].affectedRows;
                } else if (results && results.affectedRows !== undefined) {
                    rowsAffected = results.affectedRows;
                }

                if (rowsAffected > 0) {
                    res.status(200).json({
                        respuesta: 'Registro actualizado correctamente.'
                    });
                } else {
                    // Si no se afectaron filas (ej. el registro no existía), aún así es una operación "completada".
                    // Se devuelve 200 OK para que el frontend no lo trate como un error grave.
                    res.status(200).json({
                        error: false, // No es un error, sino una actualización sin cambios
                        respuesta: 'Registro no encontrado o no se realizaron cambios.'
                    });
                }
            }
        }
    );
});

// Ruta DELETE para eliminar un evento_ambiental por cod_evento
router.delete('/eventos_ambientales', (req, res) => {
    // Extraemos el cod_evento de los query parameters (e.g., /eventos_ambientales?cod_evento=123)
    const cod_evento = req.query.cod_evento;

    // Validamos que el cod_evento esté presente
    if (!cod_evento) {
        return res.status(400).json({
            error: true,
            respuesta: 'Se requiere el código del evento para eliminar.'
        });
    }

    const tabla = 'eventos_ambientales';
    const condicion = 'cod_evento'; // La columna de la tabla por la que se eliminará

    // Llamamos al procedimiento almacenado PA_DELETE.
    // Los parámetros son: p_tabla, p_condicion_col, p_valor_condicion
    db.query('CALL PA_DELETE(?, ?, ?)', [tabla, condicion, cod_evento], (err, results) => {
        if (err) {
            console.error('❌ Error en el procedimiento almacenado DELETE:', err.sqlMessage || err.message || err);
            res.status(500).json({
                error: true,
                respuesta: err.sqlMessage || err.message
            });
        } else {
            let rowsAffected = 0;
            // Para SPs, affectedRows suele estar en results[1] (el OkPacket)
            if (results && results.length > 1 && results[1] && results[1].affectedRows !== undefined) {
                rowsAffected = results[1].affectedRows;
            } else if (results && results.affectedRows !== undefined) {
                rowsAffected = results.affectedRows;
            }

            if (rowsAffected > 0) {
                res.status(200).json({
                    respuesta: 'Registro eliminado correctamente.'
                });
            } else {
                // Si no se afectaron filas, el registro no existía o ya estaba eliminado.
                // Devolvemos 200 OK porque la operación (intento de eliminación) fue completada exitosamente.
                // Esto evitará que el frontend lo trate como un error de red o de servidor.
                res.status(200).json({ // Cambiado de 404 a 200
                    error: false, // Indicamos que no hay error, solo no se encontraron filas.
                    respuesta: 'Registro no encontrado o ya eliminado (operación completada sin cambios).'
                });
            }
        }
    });
});


// Exportamos el router para que pueda ser utilizado en index.js
module.exports = router;