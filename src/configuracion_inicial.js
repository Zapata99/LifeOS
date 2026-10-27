import { guardarConfiguracion } from "./configuracion.js";

// Obtiene el formulario y los campos cuyos valores se guardarán como configuración.
// Los selectores corresponden a los identificadores definidos en conf_inicial.html.
const formularioConfiguracion = document.querySelector("#formulario_configuracion");
const campoNombreAplicacion = document.querySelector("#nombre_aplicacion");
const campoNombreUsuario = document.querySelector("#nombre_usuario");
const estado = document.querySelector("#estado_configuracion");

// Intercepta el envío para guardar los datos en el navegador antes de abandonar la página.
formularioConfiguracion.addEventListener("submit", (evento) => {
  // Mantiene al usuario en la página mientras el código guarda los valores.
  evento.preventDefault();

  // Quita espacios de los extremos para evitar almacenarlos como parte de los nombres.
  const nombreAplicacion = campoNombreAplicacion.value.trim();
  const nombreUsuario = campoNombreUsuario.value.trim();

  if (!nombreAplicacion || nombreAplicacion.length > 50 || !nombreUsuario || nombreUsuario.length > 50) {
    estado.textContent = "Los nombres deben tener entre 1 y 50 caracteres.";
    return;
  }

  // La función compartida serializa y almacena ambos valores en localStorage.
  guardarConfiguracion(nombreAplicacion, nombreUsuario);

  // Tras guardar, navega al inicio, que ya puede leer y mostrar la configuración.
  window.location.href = "./index.html";
});
