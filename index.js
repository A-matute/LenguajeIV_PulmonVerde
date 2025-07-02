//constante para el paquete de MySQL
const mysql = require('mysql');
//constante para el paquete de Express
const express = require('express');
//Variable para los metodos de express
var app = express();
//Constante para el paquete  de body-paser
const bp = require('body-parser');
//Enviando los datos JSON a NodeJS API
app.use(bp.json());

//Importa los archivos que cree llamado router.js
//Estos archivos contienen todas las rutas definidas con Express.
const routerPersonas = require('./routers/personas');
const routerActividades = require('./routers/actividades');
const routerArchivos = require('./routers/archivos');
const routerBitacoras = require('./routers/bitacoras');
const routerBackups = require('./routers/backups');













//Le dice a express: Usa las rutas definidas en router cada vez que la URL empiece con ./
app.use(routerPersonas);
app.use(routerActividades);
app.use(routerArchivos);
app.use(routerBitacoras);
app.use(routerBackups);

//Le dice a Express: Cada vez que recibas datos en JSON en el body de la petición, conviértelos automáticamente en un objeto de JavaScript para poder trabajarlos.
app.use(express.json());

//Conectar a la base de datos (MySQL)
var mysqlConnection = mysql.createConnection({
    host: '142.44.161.115',
    user:'25-1900P4PAC2E1',
    password: '25-1900P4PAC2E1e#56',
    database: '25-1900P4PAC2E1',
    multipleStatements: true
});


//Test de conexion a la base de datos
mysqlConnection.connect((err)=>{
    if(!err){
        console.log('Conexion exitosa a la base de datos MySQL.');
    }else{
        console.log('Error al conectar a la base de datos MySQL.');
    }
})

//Ejecutar el servidor en el puerto destinado
app.listen(3000, () => console.log('Servidor activo en el puerto 3000'));