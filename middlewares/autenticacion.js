var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;


// ================================================
// Verificar token
// ================================================
exports.verificaToken = function(request, response, next) {

    var token = request.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return response.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        request.usuario = decoded.usuario;
        next();
    });

};


// ================================================
// Verificar ADMIN
// ================================================
exports.verificaAdminRole = function(request, response, next) {

    var usuario = request.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return response.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: { message: 'No es administrador, no puede hacer eso' }
        });
    }
};


// ================================================
// Verificar ADMIN o Mismo Usuario
// ================================================
exports.verificaAdminOMismoUsuario = function(request, response, next) {

    var usuario = request.usuario;
    var id = request.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return response.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador ni es el mismo usuario',
            errors: { message: 'No es administrador, no puede hacer eso' }
        });
    }
};