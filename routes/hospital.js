var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ================================================
// Obtener todos los hospitales
// ================================================
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    if (err) {
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando hospitales',
                            errors: err
                        });
                    }
                    response.status(200).json({
                        ok: true,
                        total: conteo,
                        hospitales: hospitales
                    });
                });
            }
        );
});

// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});


// ================================================
// Actualizar hospital
// ================================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = request.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            response.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });

});



// ================================================
// Crear un nuevo hospital
// ================================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: request.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        response.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});


// ================================================
// Borrar un hospital por id
// ================================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        response.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});


module.exports = app;