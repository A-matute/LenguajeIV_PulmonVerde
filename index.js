//constante para el paquete de MySQL
const mysql = require('mysql');
//constante para el paquete de Express
const express = require('express');

//CONST PARA VALIDAD EL ESATDO DE LA BASE DE DATOS EN PANEL DE CONFIGURACION
const db = require('./config/db-connection');

//Variable para los metodos de express
var app = express();
//Constante para el paquete  de body-paser
const bp = require('body-parser');

const cors = require('cors');
app.use(cors());
//Enviando los datos JSON a NodeJS API
app.use(bp.json());

// Endpoint para verificar el estado de la base de datos
app.get('/status', (req, res) => {
    // Hacemos una consulta simple para probar la conexión
    db.query('SELECT 1 + 1 AS solution', (err, results) => {
        if (err) {
            console.error('Error al verificar la conexión a la base de datos:', err);
            res.status(500).json({ status: 'error', message: 'Conexión fallida' });
        } else {
            res.status(200).json({ status: 'ok', message: 'Conexión exitosa' });
        }
    });
});

//Importa los archivos que cree llamado router.js
//Estos archivos contienen todas las rutas definidas con Express.
const routerPersonas = require('./routers/personas');
const routerActividades = require('./routers/actividades');
const routerArchivos = require('./routers/archivos');
const routerBitacoras = require('./routers/bitacoras');
const routerBackups = require('./routers/backups');
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
const routerCabana = require('./routers/cabanas');
const routerClientes = require('./routers/clientes');
const routerCorreos = require('./routers/correos');
const routerDetalle_Reserva = require('./routers/detalle_reserva');
const routerDirecciones = require('./routers/direcciones');
const routerCatalogo_Especies = require('./routers/catalogo_especies');
const routerlogin = require('./routers/login');


//Le dice a express: Usa las rutas definidas en router cada vez que la URL empiece con ./
app.use(routerPersonas);
app.use(routerActividades);
app.use(routerArchivos);
app.use(routerBitacoras);
app.use(routerBackups);
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
app.use(routerCabana);
app.use(routerClientes);
app.use(routerCorreos);
app.use(routerDetalle_Reserva);
app.use(routerDirecciones);
app.use(routerCatalogo_Especies);
app.use(routerlogin);



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
