const form = document.getElementById('form-login');
const inputEmail = document.getElementById('email');
const inputPassword = document.getElementById('password');
const elMensaje = document.getElementById('mensaje');

// Mostrar / ocultar contraseña
const togglePassword = document.getElementById('toggle-password');
togglePassword.addEventListener('click', () => {
  const visible = inputPassword.type === 'text';
  inputPassword.type = visible ? 'password' : 'text';
  togglePassword.textContent = visible ? 'Mostrar' : 'Ocultar';
  togglePassword.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
});

function setError(input, texto) {
  document.getElementById(`error-${input.id}`).textContent = texto;
  input.classList.toggle('is-invalid', Boolean(texto));
}

[inputEmail, inputPassword].forEach((input) => {
  input.addEventListener('input', () => setError(input, ''));
});

function validar() {
  let valido = true;
  const email = inputEmail.value.trim();

  if (!email) {
    setError(inputEmail, 'Ingresá tu correo electrónico.');
    valido = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError(inputEmail, 'El correo electrónico no es válido.');
    valido = false;
  }

  if (!inputPassword.value) {
    setError(inputPassword, 'Ingresá tu contraseña.');
    valido = false;
  }
  return valido;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  elMensaje.hidden = true;
  if (!validar()) return;

  // TODO: conectar con el backend para autenticar al usuario
  // y guardar la sesión (localStorage 'sesion') que usan compra.js y pago.js
  elMensaje.textContent = 'El inicio de sesión todavía no está conectado al servidor.';
  elMensaje.hidden = false;
});
