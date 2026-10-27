// Comprueba que el texto, una vez recortado, respeta los límites indicados.
export const textoValido = (valor, minimo = 1, maximo = 100) =>
  typeof valor === "string" && valor.trim().length >= minimo && valor.trim().length <= maximo;

// Valida fechas ISO reales y permite dejarla vacía solo cuando se solicita.
export const fechaValida = (valor, opcional = false) => {
  if (opcional && valor === "") return true;
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(valor);
};

// Acepta únicamente números finitos que alcancen el mínimo permitido.
export const numeroValido = (valor, minimo = 0.01) =>
  typeof valor === "number" && Number.isFinite(valor) && valor >= minimo;

// Verifica que el valor sea un objeto y que sus identificadores sean texto válido.
const registroValido = (valor) =>
  valor !== null && typeof valor === "object" && !Array.isArray(valor);
const identificadorValido = (valor) => textoValido(valor, 1, 100);

// Comprueba los campos necesarios de una tarea, incluida su prioridad permitida.
export const tareaValida = (valor) =>
  registroValido(valor) &&
  identificadorValido(valor.identificador) &&
  textoValido(valor.nombre, 3) &&
  ["alta", "media", "baja"].includes(valor.prioridad) &&
  fechaValida(valor.fecha, true) &&
  (valor.completada === undefined || typeof valor.completada === "boolean");

// Comprueba que el evento tenga identificador, nombre y fecha válidos.
export const eventoValido = (valor) =>
  registroValido(valor) &&
  identificadorValido(valor.identificador) &&
  textoValido(valor.nombre) &&
  fechaValida(valor.fecha);

// Comprueba que el gasto tenga datos válidos y un importe positivo.
export const gastoValido = (valor) =>
  registroValido(valor) &&
  identificadorValido(valor.identificador) &&
  textoValido(valor.nombre) &&
  numeroValido(valor.cantidad) &&
  fechaValida(valor.fecha);

// Lee una lista JSON y detiene el proceso si su estructura o elementos no son válidos.
export function leerLista(claveAlmacenamiento, validar) {
  const datosSerializados = localStorage.getItem(claveAlmacenamiento);
  if (datosSerializados === null) return [];

  const datosGuardados = JSON.parse(datosSerializados);
  if (!Array.isArray(datosGuardados) || !datosGuardados.every(validar)) {
    throw new TypeError(`Los datos guardados en "${claveAlmacenamiento}" no son válidos.`);
  }
  return datosGuardados;
}

const claveConfiguracion = "configuracion_aplicacion";

// Recupera la configuración y valida los nombres antes de entregarlos a la interfaz.
export function leerConfiguracion() {
  const datosSerializados = localStorage.getItem(claveConfiguracion);
  if (datosSerializados === null) return null;

  const datosGuardados = JSON.parse(datosSerializados);
  if (
    !registroValido(datosGuardados) ||
    !textoValido(datosGuardados.nombreAplicacion, 1, 50) ||
    !textoValido(datosGuardados.nombreUsuario, 1, 50)
  ) {
    throw new TypeError("La configuración guardada no es válida.");
  }
  return datosGuardados;
}

// Valida y guarda los nombres de configuración en el almacenamiento local.
export function guardarConfiguracion(nombreAplicacion, nombreUsuario) {
  if (!textoValido(nombreAplicacion, 1, 50) || !textoValido(nombreUsuario, 1, 50)) {
    throw new TypeError("Introduce nombres de entre 1 y 50 caracteres.");
  }
  localStorage.setItem(
    claveConfiguracion,
    JSON.stringify({ nombreAplicacion: nombreAplicacion.trim(), nombreUsuario: nombreUsuario.trim() }),
  );
}
