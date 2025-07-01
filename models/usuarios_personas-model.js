const mysql = require('mysql');

// Crear una conexión local a MySQL
const mysqlConnection = mysql.createConnection({
    host: '142.44.161.115',
    user: '25-1900P4PAC2E1',
    password: '25-1900P4PAC2E1e#56',
    database: '25-1900P4PAC2E1',
    multipleStatements: true
});

module.exports = mysqlConnection;