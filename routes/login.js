var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');



var app = express();

var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;
var GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
var GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;


// ================================================
// Autenticación de Google
// ================================================
app.post('/google', (request, response) => {

    var token = request.body.token || 'XXX';

    var client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET);

    var ticket = client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
    }).then((e, login) => {

        if (e) {
            return response.status(400).json({
                ok: false,
                message: 'Token no válido',
                errros: e
            });
        }
        var payload = login.getPayload();
        var userid = payload['sub'];

        Usuario.findOne({ email: payload.email }, (err, usuario) => {
            if (err) {
                return response.status(500).json({
                    ok: false,
                    message: 'Error al buscar usuario - login',
                    errros: err
                });
            }


            if (usuario) {
                if (usuario.google === false) {
                    return response.status(400).json({
                        ok: false,
                        message: 'Debe usar su autenticación normal',
                        errros: err
                    });
                } else {

                    // Crear un token!!!!
                    var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas
                    usuario.password = ':)';
                    response.status(200).json({
                        ok: true,
                        usuario: usuario,
                        token: token,
                        id: usuario._id
                    });

                }
            } else {
                var usuarioNew = new Usuario();
                usuarioNew.nombre = payload.name;
                usuarioNew.email = payload.email;
                usuarioNew.password = ':)';
                usuarioNew.img = payload.picture;
                usuarioNew.google = true;

                usuarioNew.save((err, usuarioDB) => {
                    if (err) {
                        return response.status(500).json({
                            ok: false,
                            message: 'Error al crear usuario - google',
                            errros: err
                        });
                    }

                    // Crear un token!!!!
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas
                    usuarioDB.password = ':)';
                    response.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                    });
                });

            }
        });

    });
});



// ================================================
// Autenticación normal
// ================================================
app.post('/', (request, response) => {

    var body = request.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuarioDB) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token!!!!
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas
        usuarioDB.password = ':)';
        response.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });
});

module.exports = app;