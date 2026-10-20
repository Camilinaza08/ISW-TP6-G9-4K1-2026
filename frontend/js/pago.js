
const API_URL = 'http://localhost:3000';

const elMensaje = document.getElementById('mensaje');
const botones = document.querySelectorAll('.metodo');

function leer(storage, clave) {
  try {
    return JSON.parse(storage.getItem(clave));
  } catch {
    return null;
  }
}

function mostrarMensaje(texto) {
  elMensaje.textContent = texto;
  elMensaje.hidden = false;
}

// Recupera la compra validada por el backend,
// incluyendo el montoTotal calculado en comprarEntradas().
const compra = leer(sessionStorage, 'compraEnCurso');

// Sin una compra procesada no hay nada que confirmar.
if (!compra) {
  window.location.replace('compra.html');
}

// Mercado Pago permanecerá deshabilitado hasta
// implementar la integración con Checkout Pro.
botones.forEach((boton) => {
  if (boton.dataset.forma === 'Mercado Pago') {
    boton.disabled = true;
    boton.title = 'Mercado Pago estará disponible próximamente';
  }
});

// Confirma la compra mediante el backend.
async function procesarConfirmacion(compra, formaPago) {
  const sesion = obtenerSesion();

  if (!sesion) {
    throw new Error(
      'Tenés que iniciar sesión para confirmar la compra.'
    );
  }

  const res = await fetch(`${API_URL}/api/confirmacion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sesion,
      compra,
      formaPago
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || 'No se pudo confirmar la compra.'
    );
  }

  return data;
}

// Manejo de la selección de la forma de pago.
botones.forEach((boton) => {
  boton.addEventListener('click', async () => {
    if (!compra) {
      return mostrarMensaje(
        'No se encontró una compra pendiente de confirmación.'
      );
    }

    const formaPago = boton.dataset.forma;

    // Protección adicional mientras Mercado Pago no esté integrado.
    if (formaPago !== 'Efectivo') {
      return mostrarMensaje(
        'Esta forma de pago todavía no está disponible.'
      );
    }

    elMensaje.hidden = true;

    botones.forEach((b) => {
      b.disabled = true;
    });

    try {
      const compraConfirmada = await procesarConfirmacion(
        compra,
        formaPago
      );

      // Conservamos la respuesta completa del backend,
      // incluyendo ID, monto, forma de pago y estados.
      sessionStorage.setItem(
        'compraConfirmada',
        JSON.stringify(compraConfirmada)
      );

      // La compra en curso ya fue registrada.
      sessionStorage.removeItem('compraEnCurso');

      // La URL de destino es determinada por el backend.
      if (compraConfirmada.urlRedireccion) {
        window.location.href = compraConfirmada.urlRedireccion;
      } else {
        mostrarMensaje(
          'La compra fue registrada, pero no se recibió una página de destino.'
        );
      }

    } catch (err) {
      mostrarMensaje(
        err.message === 'Failed to fetch'
          ? 'No se pudo conectar con el servidor. Intentá nuevamente.'
          : err.message
      );

    } finally {
      botones.forEach((b) => {
        b.disabled = b.dataset.forma === 'Mercado Pago';
      });
    }
  });
});
