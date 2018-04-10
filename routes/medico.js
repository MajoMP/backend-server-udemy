var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ================================================
// Obtener todos los médicos
// ================================================
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    if (err) {
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando medicos',
                            errors: err
                        });
                    }
                    response.status(200).json({
                        ok: true,
                        total: conteo,
                        medicos: medicos
                    });
                });
            }
        );
});

// ================================================
// Obtener médico
// ================================================
app.get('/:id', (req, res) => {
    var id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec((err, medico) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + ' no existe',
                    errors: { message: 'No existe un medico con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                medico: medico
            });

        });
});

// ================================================
// Actualizar médico
// ================================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = request.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            response.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });

});



// ================================================
// Crear un nuevo médico
// ================================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: request.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        response.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});


// ================================================
// Borrar un médico por id
// ================================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        response.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;