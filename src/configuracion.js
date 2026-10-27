// Clave de almacenamiento de la configuración.
const claveConfiguracion = "configuracion_aplicacion";

// Lee los datos de configuración.
export function leerConfiguracion() {
  const texto = localStorage.getItem(claveConfiguracion);
  if (texto === null) return null;

  return JSON.parse(texto);
}

// Guarda el nombre de la aplicación y el del usuario.
export function guardarConfiguracion(nombreAplicacion, nombreUsuario) {
  localStorage.setItem(claveConfiguracion, JSON.stringify({ nombreAplicacion, nombreUsuario }));
}
