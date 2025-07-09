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
const routertipo_alertas = require('./routers/tipo_alertas');
const routertipo_archivo = require('./routers/tipo_archivo');
const routertipo_espacio = require('./routers/tipo_espacio');
const routertipo_especies = require('./routers/tipo_especies');
const routertipo_evento = require('./routers/tipo_evento');

//Le dice a express: Usa las rutas definidas en router cada vez que la URL empiece con ./
app.use(routerPersonas);
app.use(routerActividades);
app.use(routerArchivos);
app.use(routerBitacoras);
app.use(routerBackups);
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
app.use('/',routertipo_alertas )
app.use('/',routertipo_archivo)
app.use('/',routertipo_espacio)
app.use('/',routertipo_especies)
app.use('/',routertipo_evento)

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
