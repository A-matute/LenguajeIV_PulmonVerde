// Importamos Express y Multer
const express = require('express');
const router = express.Router();
const db = require('../config/db-connection');
const multer = require('multer');

// Ana R. Cabrera: Configuración de Multer para guardar archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // La carpeta donde se guardarán los archivos. Debe existir.
        cb(null, './uploads'); 
    },
    filename: (req, file, cb) => {
        // Generamos un nombre único para el archivo para evitar conflictos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// =======================================
// GET - OBTENER TODOS LOS PARQUES
// =======================================
// ANA R. CABRERA - Esta ruta usa el PA_SELECT para obtener todos los parques
router.get('/parques', (req, res) => {
    const columnas = 'cod_parque, nombre_parque, ubicacion_parque, fecha_inauguracion, estado';
    const tabla = 'parques';

    db.query('CALL PA_SELECT(?, ?)', [tabla, columnas], (err, results) => {
        if (err) {
            console.error('Ocurrió un error en el procedimiento almacenado:', err.sqlMessage || err.message || err);
            res.status(500).json({
                error: true,
                respuesta: err.sqlMessage || err.message
            });
        } else {
            // El resultado del PA es un array de arrays, tomamos el primero
            res.status(200).json(results[0]);
        }
    });
});

// =======================================
// GET - OBTENER UN PARQUE ESPECÍFICO
// =======================================
// ANA R. CABRERA - Esta ruta obtiene un solo parque usando un SELECT directo
router.get('/parques/:cod_parque', (req, res) => {
    const { cod_parque } = req.params;
    const tabla = 'parques';

    // Construimos la consulta SQL de forma segura
    const sql = `SELECT * FROM ${tabla} WHERE cod_parque = ?`;

    db.query(sql, [cod_parque], (err, results) => {
        if (err) {
            console.error('Error al obtener un parque específico:', err.sqlMessage || err.message || err);
            res.status(500).json({
                error: true,
                respuesta: err.sqlMessage || err.message
            });
        } else {
            // La API de la base de datos devuelve un array, que podría estar vacío
            res.status(200).json(results);
        }
    });
});

// =======================================
// POST - INSERTAR NUEVO PARQUE
// =======================================
router.post('/parques', (req, res) => {
    const {
        nombre_parque,
        ubicacion_parque,
        fecha_inauguracion,
        estado
    } = req.body;

    if (!nombre_parque || !ubicacion_parque) {
        return res.status(400).json({ error: true, respuesta: 'Faltan campos obligatorios: nombre_parque y ubicacion_parque.' });
    }

    // Primero, obtenemos el último código de parque para generar el siguiente
    db.query('SELECT MAX(cod_parque) as max_cod FROM parques', (err, result) => {
        if (err) {
            console.error('Error al obtener el código máximo del parque:', err.sqlMessage || err.message || err);
            return res.status(500).json({
                error: true,
                respuesta: 'Error interno del servidor al obtener el código máximo.'
            });
        }

        // Generamos el nuevo código de parque
        let nuevo_cod = 1; // Valor inicial si la tabla está vacía
        if (result[0].max_cod) {
            nuevo_cod = result[0].max_cod + 1;
        }

        // Usamos una consulta INSERT directa y segura con placeholders
        const sql = `
            INSERT INTO parques (cod_parque, nombre_parque, ubicacion_parque, fecha_inauguracion, estado)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [nuevo_cod, nombre_parque, ubicacion_parque, fecha_inauguracion, estado];

        db.query(sql, values, (err, results) => {
            if (err) {
                console.error('Error al insertar el parque:', err.sqlMessage || err.message || err);
                return res.status(500).json({
                    error: true,
                    respuesta: 'Error interno del servidor al insertar el parque.'
                });
            } else {
                res.status(201).json({
                    respuesta: `Parque con código ${nuevo_cod} insertado correctamente en la base de datos.`
                });
            }
        });
    });
});

// =======================================
// PUT - ACTUALIZAR UN PARQUE
// =======================================
router.put('/parques/:cod_parque', (req, res) => {
    const { cod_parque } = req.params;
    const {
        nombre_parque,
        ubicacion_parque,
        fecha_inauguracion,
        estado
    } = req.body;

    if (!nombre_parque || !ubicacion_parque) {
        return res.status(400).json({
            error: true,
            respuesta: 'Faltan campos obligatorios para la actualización: nombre_parque y ubicacion_parque.'
        });
    }

    const sql = `UPDATE parques SET nombre_parque = ?, ubicacion_parque = ?, fecha_inauguracion = ?, estado = ? WHERE cod_parque = ?`;
    const values = [nombre_parque, ubicacion_parque, fecha_inauguracion, estado, cod_parque];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error al actualizar el parque:', err.sqlMessage || err.message || err);
            res.status(500).json({
                error: true,
                respuesta: err.sqlMessage || err.message
            });
        } else {
            res.status(200).json({
                respuesta: 'Parque actualizado correctamente.'
            });
        }
    });
});

// =======================================
// DELETE - ELIMINAR UN PARQUE
// =======================================
router.delete('/parques/:cod_parque', (req, res) => {
    const { cod_parque } = req.params;
    const sql = `DELETE FROM parques WHERE cod_parque = ?`;

    db.query(sql, [cod_parque], (err, results) => {
        if (err) {
            console.error('Error al eliminar el parque:', err.sqlMessage || err.message || err);
            return res.status(500).json({
                error: true,
                respuesta: 'Error interno del servidor al eliminar el parque.'
            });
        }
        
        if (results.affectedRows > 0) {
            res.status(200).json({
                respuesta: 'Parque eliminado correctamente.'
            });
        } else {
            res.status(404).json({
                error: true,
                respuesta: 'El parque no fue encontrado.'
            });
        }
    });
});

// ====================================================================
// POST - SUBIR ARCHIVOS (IMÁGENES, PDF, MAPAS) PARA UN PARQUE
// ====================================================================
// ANA R. CABRERA - Endpoint para subir archivos y guardarlos en la tabla 'archivos'
router.post('/parques/:cod_parque/archivos', upload.single('documento'), (req, res) => {
    const { cod_parque } = req.params;
    const { descripcion } = req.body;
    const nombre_archivo = req.file ? req.file.filename : null;

    if (!nombre_archivo || !descripcion || !cod_parque) {
        return res.status(400).json({ error: true, respuesta: 'Faltan campos obligatorios: archivo, descripcion o codigo de parque.' });
    }

    const sql = `
        INSERT INTO archivos (cod_parque, nombre_archivo, descripcion, fecha_subida)
        VALUES (?, ?, ?, NOW());
    `;

    db.query(sql, [cod_parque, nombre_archivo, descripcion], (err, results) => {
        if (err) {
            console.error('Error al insertar archivo:', err.sqlMessage || err.message || err);
            return res.status(500).json({
                error: true,
                respuesta: 'Error interno del servidor al insertar el archivo.'
            });
        }
        res.status(201).json({
            respuesta: `Archivo subido y registrado correctamente.`
        });
    });
});

module.exports = router;

