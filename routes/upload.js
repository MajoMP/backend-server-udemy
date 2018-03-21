var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());


app.put('/:tipo/:id', (request, response) => {
    var tipo = request.params.tipo;
    var id = request.params.id;

    // Tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return response.status(400).json({
            ok: false,
            message: 'Tipo de colección no es válida',
            error: { message: 'Las colecciones válidas son: ' + tiposValidos.join(', ') }
        });
    }

    if (!request.files) {
        return response.status(400).json({
            ok: false,
            message: 'No seleccionó nada',
            error: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = request.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sole aceptamos estas extensiones
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return response.status(400).json({
            ok: false,
            message: 'Extensión no válida',
            error: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    //Mover el archivo del temporal a un path específico
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, (err) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al mover archivo',
                error: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, response);
    });
});


function subirPorTipo(tipo, id, nombreArchivo, response) {

    switch (tipo) {
        case 'usuarios':
            subirPorUsuario(id, nombreArchivo, response);
            break;

        case 'hospitales':
            subirPorHospital(id, nombreArchivo, response);
            break;
        case 'medicos':
            subirPorMedico(id, nombreArchivo, response);
            break;
        default:
    }
}


function subirPorUsuario(id, nombreArchivo, response) {
    Usuario.findById(id, (err, usuario) => {

        if (!usuario) {
            return response.status(400).json({
                ok: false,
                message: 'Usuario no existe',
                error: { message: 'Usuario no existe' }
            });
        }

        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al buscar el usuario',
                error: err
            });
        }

        var pathViejo = './uploads/usuarios/' + usuario.img;

        // Si existe elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo);
        }

        usuario.img = nombreArchivo;
        usuario.save((err, usuarioActualizado) => {

            if (err) {
                return response.status(500).json({
                    ok: false,
                    message: 'Error al guardar la imagen del usuario',
                    error: err
                });
            }
            usuarioActualizado.password = ':)';
            return response.status(200).json({
                ok: true,
                message: 'Imagen de usuario actualizada',
                usuario: usuarioActualizado
            });

        });
    });
}


function subirPorHospital(id, nombreArchivo, response) {
    Hospital.findById(id, (err, hospital) => {
        if (!hospital) {
            return response.status(400).json({
                ok: false,
                message: 'Hospital no existe',
                error: { message: 'Hospital no existe' }
            });
        }

        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al buscar el hospital',
                error: err
            });
        }

        var pathViejo = './uploads/hospitales/' + hospital.img;

        // Si existe elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo);
        }

        hospital.img = nombreArchivo;
        hospital.save((err, hospitalActualizado) => {

            if (err) {
                return response.status(500).json({
                    ok: false,
                    message: 'Error al guardar la imagen del hospital',
                    error: err
                });
            }
            return response.status(200).json({
                ok: true,
                message: 'Imagen de hospital actualizada',
                hospital: hospitalActualizado
            });

        });
    });
}

function subirPorMedico(id, nombreArchivo, response) {
    Medico.findById(id, (err, medico) => {

        if (!medico) {
            return response.status(400).json({
                ok: false,
                message: 'Medico no existe',
                error: { message: 'Medico no existe' }
            });
        }

        if (err) {
            return response.status(500).json({
                ok: false,
                message: 'Error al buscar el medico',
                error: err
            });
        }

        var pathViejo = './uploads/medicos/' + medico.img;

        // Si existe elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo);
        }

        medico.img = nombreArchivo;
        medico.save((err, medicoActualizado) => {

            if (err) {
                return response.status(500).json({
                    ok: false,
                    message: 'Error al guardar la imagen del medico',
                    error: err
                });
            }

            return response.status(200).json({
                ok: true,
                message: 'Imagen de medico actualizada',
                medico: medicoActualizado
            });

        });
    });
}

module.exports = app;