// Para arrancar el servidor ejecutar --> node app
// Si no queremos parar y arrancar con cada cambio hacemos lo siguiente:
// 1. Instalar nodemon con el comando npm install -g nodemon
// 2. Modificar el fichero package.json para añadir el siguiente script "start": "nodemon app.js"
// 3. Ahora en el terminal ejecutamos npm start



// Requires -->  importación de librerias
var express = require('express');
var mongoose = require('mongoose');



// Inicializar variables --> usamos la librería
// Definimos el servidor
var app = express();

// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) {
        throw err;
    }

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});



// Rutas
app.get('/', (request, response, next) => {
    response.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});