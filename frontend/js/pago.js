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

// Sin una compra procesada no hay nada que pagar
const compra = leer(sessionStorage, 'compraEnCurso');
if (!compra) window.location.replace('compra.html');

botones.forEach((boton) => {
  boton.addEventListener('click', async () => {
    const sesion = leer(localStorage, 'sesion');
    if (!sesion) return mostrarMensaje('Tenés que iniciar sesión para confirmar la compra.');

    const datosCompra = { ...compra, formaDePago: boton.dataset.forma };

    botones.forEach((b) => (b.disabled = true));
    try {
      const res = await fetch(`${API_URL}/api/confirmacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesion, datosCompra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo confirmar la compra.');

      sessionStorage.setItem('compraConfirmada', JSON.stringify(data));
      sessionStorage.removeItem('compraEnCurso');
      // Efectivo -> página interna de confirmación / Mercado Pago -> init_point de Checkout Pro
      if (data.urlRedireccion) window.location.href = data.urlRedireccion;
    } catch (err) {
      mostrarMensaje(err.message === 'Failed to fetch' ? 'No se pudo conectar con el servidor.' : err.message);
    } finally {
      botones.forEach((b) => (b.disabled = false));
    }
  });
});
