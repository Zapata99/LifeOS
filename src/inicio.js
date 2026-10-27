import { leerConfiguracion } from "./configuracion.js";
import { eventoValido, gastoValido, leerLista, tareaValida } from "./validacion.js";

// Elementos de la página de inicio donde se muestran la identidad y los resúmenes.
const nombreUsuario = document.querySelector("#nombre_usuario");
const logo = document.querySelector(".logo");
const resumenTareas = document.querySelector("#resumen_tareas");
const resumenEventos = document.querySelector("#resumen_eventos");
const resumenGastos = document.querySelector("#resumen_gastos");
// Claves utilizadas por las demás páginas para guardar cada tipo de información.
const claveTareas = "tareas_guardadas";
const claveEventos = "eventos_guardados";
const claveGastos = "gastos_guardados";

// Lee las tareas guardadas y crea un elemento de resumen por cada una.
function mostrarResumenTareas() {
  // Si nunca se guardaron tareas, utiliza una lista vacía; si existen, las deserializa.
  const tareas = leerLista(claveTareas, tareaValida);

  // Informa explícitamente de que todavía no hay elementos que resumir.
  if (tareas.length === 0) {
    const mensaje = document.createElement("li");
    mensaje.textContent = "Todavía no hay tareas.";
    resumenTareas.append(mensaje);
    return;
  }

  // Cada tarea se representa con nombre, prioridad y fecha legibles.
  tareas.forEach((tarea) => {
    const elementoTarea = document.createElement("li");
    const nombreTarea = document.createElement("span");
    nombreTarea.className = "tarea-nombre";
    nombreTarea.textContent = tarea.nombre;

    const prioridadTarea = document.createElement("span");
    prioridadTarea.className = `tarea-prioridad prioridad-${tarea.prioridad}`;
    prioridadTarea.textContent = `Prioridad ${tarea.prioridad}`;

    const fechaTarea = document.createElement("span");
    fechaTarea.className = "tarea-fecha";
    fechaTarea.textContent = tarea.fecha
      ? new Date(`${tarea.fecha}T00:00:00`).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      // Las tareas pueden no tener fecha, por lo que se usa una etiqueta alternativa.
      : "Sin fecha";

    elementoTarea.append(nombreTarea, fechaTarea, prioridadTarea);
    resumenTareas.append(elementoTarea);
  });
}

// Lee los eventos guardados y los presenta en el resumen de la página de inicio.
function mostrarResumenEventos() {
  // La misma clave utilizada por el calendario permite compartir los eventos entre páginas.
  const eventos = leerLista(claveEventos, eventoValido);

  // Muestra un mensaje cuando el almacenamiento todavía no contiene eventos.
  if (eventos.length === 0) {
    const mensaje = document.createElement("li");
    mensaje.textContent = "Todavía no hay eventos.";
    resumenEventos.append(mensaje);
    return;
  }

  // Representa cada evento con su nombre y su fecha localizada.
  eventos.forEach((evento) => {
    const elemento = document.createElement("li");
    const nombre = document.createElement("span");
    const fecha = document.createElement("span");

    nombre.className = "evento-nombre";
    nombre.textContent = evento.nombre;
    fecha.className = "evento-fecha";
    fecha.textContent = new Date(`${evento.fecha}T00:00:00`).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    elemento.append(nombre, fecha);
    resumenEventos.append(elemento);
  });
}

// Lee los gastos guardados y muestra sus importes y fechas dentro del resumen.
function mostrarResumenGastos() {
  // Recupera la lista compartida con la página de gestión de gastos.
  const gastos = leerLista(claveGastos, gastoValido);

  // Mantiene visible el estado vacío cuando aún no se ha registrado ningún gasto.
  if (gastos.length === 0) {
    const mensaje = document.createElement("li");
    mensaje.textContent = "Todavía no hay gastos.";
    resumenGastos.append(mensaje);
    return;
  }

  // Prepara un único formateador de moneda para reutilizarlo con todos los gastos.
  const formatoEuros = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  });

  // Ordena una copia por fecha descendente y crea una fila informativa por gasto.
  gastos
    .slice()
    .sort((gastoA, gastoB) => gastoB.fecha.localeCompare(gastoA.fecha))
    .forEach((gasto) => {
      const elemento = document.createElement("li");
      const nombre = document.createElement("span");
      const detalle = document.createElement("span");

      nombre.className = "gasto-nombre";
      nombre.textContent = gasto.nombre;
      detalle.className = "gasto-detalle";
      const fecha = new Date(`${gasto.fecha}T00:00:00`).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      detalle.textContent = `${formatoEuros.format(gasto.cantidad)} · ${fecha}`;

      elemento.append(nombre, detalle);
      resumenGastos.append(elemento);
    });
}

// Recupera los nombres de configuración compartidos con la página inicial.
const configuracion = leerConfiguracion();

if (configuracion) {
  // Personaliza la marca visible, el saludo y el título de la pestaña si hay configuración.
  logo.textContent = configuracion.nombreAplicacion;
  nombreUsuario.textContent = configuracion.nombreUsuario;
  document.title = configuracion.nombreAplicacion;
}

// Carga en el inicio los tres resúmenes desde el almacenamiento local.
mostrarResumenTareas();
mostrarResumenEventos();
mostrarResumenGastos();
