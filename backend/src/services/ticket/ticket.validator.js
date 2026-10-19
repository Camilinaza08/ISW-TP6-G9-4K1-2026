const { USUARIOS_MOCK } = require('../ticket/usuarios.mock');
const { TIPOS_PASE } = require('./tiposPase.mock');
const { FORMAS_PAGO } = require('./formasPago.mock');

function validarUsuario(usuario) {
  const existe = USUARIOS_MOCK.some((u) => u.id === usuario?.id);

  if (!existe) {
    throw new Error('ERROR: Usuario no registrado');
  }

  return true;
}

function normalizarFecha(fecha) {
    return new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate()
    );
}

function existeFecha(anio, mes, dia) {
    const fecha = new Date(anio, mes - 1, dia);

    return (
        fecha.getFullYear() === anio &&
        fecha.getMonth() === mes - 1 &&
        fecha.getDate() === dia
    );
}

function convertirFechaVisita(fechaVisita) {
    if (fechaVisita instanceof Date) {
        return normalizarFecha(fechaVisita);
    }

    if (
        typeof fechaVisita !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fechaVisita)
    ) {
        throw new Error("Formato de fecha inválido");
    }

    const [anio, mes, dia] = fechaVisita.split("-").map(Number);

    if (!existeFecha(anio, mes, dia)) {
        throw new Error("Fecha inválida");
    }

    return new Date(anio, mes - 1, dia);
}


function validarFecha(fechaVisita) {
    if (fechaVisita === null || fechaVisita === undefined) {
        throw new Error("Debe seleccionar una fecha de visita");
    }

    const fechaVisitaNormalizada = convertirFechaVisita(fechaVisita);
    const fechaActualNormalizada = normalizarFecha(new Date());

    const fechaMaximaPermitida = new Date(fechaActualNormalizada);

    fechaMaximaPermitida.setDate(
        fechaMaximaPermitida.getDate() + 30
    );

    if (fechaVisitaNormalizada < fechaActualNormalizada) {
        throw new Error("Fecha previa a la actual");
    }

    if (fechaVisitaNormalizada > fechaMaximaPermitida) {
        throw new Error(
            "No se pueden comprar entradas con más de 30 días de anticipación"
        );
    }

    return true;
}

const FECHAS_CIERRE = [
    { mes: 1, dia: 1 },
    { mes: 12, dia: 25 }
];

function validarAperturaParque(fechaVisita) {
    const fecha = convertirFechaVisita(fechaVisita);

    const esLunes = fecha.getDay() === 1;

    const esFechaEspecial = FECHAS_CIERRE.some(
        (cierre) =>
            cierre.mes === fecha.getMonth() + 1 &&
            cierre.dia === fecha.getDate()
    );

    if (esLunes || esFechaEspecial) {
        throw new Error("Parque Cerrado");
    }

    return true;
}

const MIN_ENTRADAS = 1;
const MAX_ENTRADAS = 10;

function validarCantidadEntradas(cantidadEntradas) {
    if (cantidadEntradas === null || cantidadEntradas === undefined) {
        throw new Error("Cantidad de entradas faltante");
    }

    if (
        !Number.isInteger(cantidadEntradas) ||
        cantidadEntradas < MIN_ENTRADAS
    ) {
        throw new Error("Cantidad inválida");
    }

    if (cantidadEntradas > MAX_ENTRADAS) {
        throw new Error(
            `No se pueden comprar más de ${MAX_ENTRADAS} entradas`
        );
    }

    return true;
}

function validarCantidadDatos(
    cantidadDatos, cantidadEntradas, errorFaltantes, errorSobrantes
) {
    if (cantidadDatos < cantidadEntradas) {
        throw new Error(errorFaltantes);
    }

    if (cantidadDatos > cantidadEntradas) {
        throw new Error(errorSobrantes);
    }
}

function validarEdades(edades) {
    if (edades.some(edad => !Number.isInteger(edad) || edad < 0)) {
        throw new Error("Edad ingresada inválida");
    }
}

function validarTiposPase(tiposPase) {
    if (tiposPase.some(tipo =>
        !TIPOS_PASE.some(pase => pase.id === tipo)
    )) {
        throw new Error("Tipo de pase inválido");
    }
}

function validarCamposObligatorios(edades, tiposPase, cantidadEntradas) {
    if (edades == null && tiposPase == null) {
        throw new Error("Datos faltantes");
    }

    if (edades == null) {
        throw new Error("Edades faltantes");
    }

    if (tiposPase == null) {
        throw new Error("Tipos de pase faltantes");
    }

    validarCantidadDatos(
        edades.length, cantidadEntradas,
        "Faltan edades de visitantes", "Sobran edades de visitantes"
    );

    validarCantidadDatos(
        tiposPase.length, cantidadEntradas,
        "Faltan tipos de pase de visitantes",
        "Sobran tipos de pase de visitantes"
    );

    validarEdades(edades);
    validarTiposPase(tiposPase);

    return true;
}

function obtenerDescuentoPorEdad(edad) {
  if (edad >= 0 && edad <= 3) {
    return 1;
  }

  if ((edad >= 4 && edad <= 15) || edad >= 60) {
    return 0.5;
  }

  return 0;
}

function calcularMonto(edades, tiposPase) {
  return tiposPase.reduce((total, tipo, i) => {
    const pase = TIPOS_PASE.find(pase => pase.id === tipo);
    const descuento = obtenerDescuentoPorEdad(edades[i]);

    return total + pase.precioBase * (1 - descuento);
  }, 0);
}

function validarFormaPago(formaPago) {
    if (formaPago === null || formaPago === undefined) {
        throw new Error("Forma de pago faltante");
    }

    const formaPagoValida = FORMAS_PAGO.some(
        opcion => opcion.nombre === formaPago
    );

    if (!formaPagoValida) {
        throw new Error("Forma de pago inválida");
    }
    return true;
}

module.exports = {
  validarUsuario,
  validarFecha,
  validarAperturaParque,
  validarCantidadEntradas,
  validarCamposObligatorios,
  validarFormaPago,
  calcularMonto
};
