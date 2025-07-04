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

//Importa el archivo que cree llamado router.js
//Este archivo contiene todas tus rutas definidas con Express.
const routerPersona = require('./routers/personas');
const routerParques = require('./routers/parques');
const routerReservas = require('./routers/reservas');
const routerPermisos = require('./routers/permisos');
const routerRoles_pantallas_permisos = require('./routers/roles_pantallas_permisos');
const routerRoles = require('./routers/roles');
const routerTelefonos = require('./routers/telefonos');
const routerEmpleados = require('./routers/empleados');
const routerEspacios = require('./routers/espacios');
const routerEventosAmbientales = require('./routers/eventos_ambientales');
const routerLogLogins = require('./routers/log_logins');
const routerMantenimientos = require('./routers/mantenimientos');
const routerPantallas = require('./routers/pantallas');
const routerUsuarios = require('./routers/usuarios');
const routerUsuariosRoles = require('./routers/usuarios_roles');
const routerAlertas = require('./routers/alertas');
const routerRecursos = require('./routers/recursos');



//Le dice a express: Usa las rutas definidas en router cada vez que la URL empiece con /.
app.use(routerPersona);
app.use(routerParques);
app.use(routerReservas);
app.use(routerPermisos);
app.use(routerRoles_pantallas_permisos);
app.use(routerRoles);
app.use(routerTelefonos);
app.use(routerEmpleados);
app.use(routerEspacios);
app.use(routerEventosAmbientales);
app.use(routerLogLogins);
app.use(routerMantenimientos);
app.use(routerPantallas);
app.use(routerUsuarios);
app.use(routerUsuariosRoles);
app.use(routerAlertas);
app.use(routerRecursos);

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
