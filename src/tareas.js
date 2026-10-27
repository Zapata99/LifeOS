import { leerConfiguracion } from "./configuracion.js";

// Atajo para buscar los elementos HTML mediante sus selectores CSS.
const $ = (selector) => document.querySelector(selector);
// Campos y contenedores principales del formulario y del listado de tareas.
const formularioTareas = $("#formulario_tareas");
const campoNombre = $("#nombre_tarea");
const campoPrioridad = $("#prioridad_tarea");
const campoFecha = $("#fecha_tarea");
const listaTareas = $("#lista_tareas");
const estadoTareas = $("#estado_tareas");
const barraProgreso = $("#progreso_tareas");
const textoProgreso = $("#texto_progreso_tareas");
// Clave compartida para conservar las tareas en el almacenamiento del navegador.
const claveAlmacenamiento = "tareas_guardadas";
// Valores que se ofrecen en los controles de prioridad.
const prioridadesPermitidas = ["alta", "media", "baja"];

// Estado en memoria que alimenta la representación de la lista.
let tareas = [];

// Actualiza el mensaje de estado visible para informar de las acciones realizadas.
const mostrarEstado = (mensaje) => {
  estadoTareas.textContent = mensaje;
};

// Genera un identificador basado en el momento de creación de la tarea.
const crearIdentificador = () => Date.now().toString();
// Convierte la prioridad a una forma adecuada para mostrarla como texto.
const formatearPrioridad = (prioridad) => prioridad.charAt(0).toUpperCase() + prioridad.slice(1);
// Convierte una fecha ISO en una fecha localizada; si no hay fecha, muestra una etiqueta.
const formatearFecha = (fecha) =>
  fecha
    ? new Date(`${fecha}T00:00:00`).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Sin fecha";

// Lee y deserializa las tareas guardadas. Si la clave aún no existe, devuelve una lista vacía.
const cargarTareas = () => {
  const tareasGuardadas = localStorage.getItem(claveAlmacenamiento);
  if (tareasGuardadas === null) return [];

  return JSON.parse(tareasGuardadas);
};

// Serializa la lista recibida y la persiste en localStorage.
const guardarTareas = (tareasNuevas) => {
  localStorage.setItem(claveAlmacenamiento, JSON.stringify(tareasNuevas));
};

// Centraliza el guardado y la actualización de estado e interfaz tras una operación.
const actualizarTareas = (nuevasTareas, mensaje) => {
  guardarTareas(nuevasTareas);
  tareas = nuevasTareas;
  mostrarTareas();
  mostrarEstado(mensaje);
};

// Crea un span de texto con una clase CSS, usando textContent para insertar texto literal.
const crearElementoTexto = (clase, texto) => {
  const elemento = document.createElement("span");
  elemento.className = clase;
  elemento.textContent = texto;
  return elemento;
};

// Crea un botón y, si se proporciona una acción, la registra para el evento click.
const crearBoton = (texto, tipo = "button", manejador = null) => {
  const boton = document.createElement("button");
  boton.type = tipo;
  boton.textContent = texto;

  if (manejador) {
    boton.addEventListener("click", manejador);
  }

  return boton;
};

// Construye un selector con las prioridades permitidas y selecciona el valor recibido.
const crearSelectorPrioridad = (valor) => {
  const selector = document.createElement("select");
  selector.append(
    ...prioridadesPermitidas.map((prioridad) => {
      const opcion = document.createElement("option");
      opcion.value = prioridad;
      opcion.textContent = formatearPrioridad(prioridad);
      return opcion;
    }),
  );
  selector.value = valor;
  return selector;
};

// Construye la vista completa de una tarea en modo lectura y conecta sus controles.
const crearElementoTarea = (tarea) => {
  const elemento = document.createElement("li");
  // Aplica el estilo de tarea completada cuando su estado está marcado.
  elemento.className = tarea.completada ? "tarea-elemento tarea-completada" : "tarea-elemento";

  // La casilla permite cambiar el estado de completado de forma accesible.
  const controlCompletada = document.createElement("label");
  controlCompletada.className = "control-tarea-completada";

  const casillaCompletada = document.createElement("input");
  casillaCompletada.type = "checkbox";
  casillaCompletada.checked = tarea.completada === true;
  casillaCompletada.setAttribute(
    "aria-label",
    `${tarea.completada ? "Desmarcar" : "Marcar"} "${tarea.nombre}" como completada`,
  );
  casillaCompletada.addEventListener("change", () => {
    // Sustituye solo la tarea seleccionada y conserva sin cambios las demás.
    const nuevas = tareas.map((item) =>
      item.identificador === tarea.identificador
        ? { ...item, completada: casillaCompletada.checked }
        : item,
    );

    // Persiste el nuevo estado, vuelve a dibujar la lista y devuelve el foco a la casilla.
    actualizarTareas(nuevas, casillaCompletada.checked
      ? "Tarea marcada como completada."
      : "Tarea marcada como pendiente.");
    document.getElementById(`completar-tarea-${tarea.identificador}`)?.focus();
  });
  casillaCompletada.id = `completar-tarea-${tarea.identificador}`;
  controlCompletada.append(casillaCompletada, document.createTextNode("Completada"));

  // El botón de edición cambia esta fila por un formulario específico para la tarea.
  const botonEditar = crearBoton("Editar", "button", () => editarTarea(tarea, elemento));
  // El botón de eliminación persiste una lista que excluye la tarea seleccionada.
  const botonEliminar = crearBoton("Eliminar", "button", () => {
    const nuevas = tareas.filter((item) => item.identificador !== tarea.identificador);
    actualizarTareas(nuevas, "Tarea eliminada.");
  });

  elemento.append(
    crearElementoTexto("tarea-nombre", tarea.nombre),
    crearElementoTexto("tarea-fecha", formatearFecha(tarea.fecha)),
    crearElementoTexto(`tarea-prioridad prioridad-${tarea.prioridad}`, `Prioridad ${tarea.prioridad}`),
    controlCompletada,
    botonEditar,
    botonEliminar,
  );

  return elemento;
};

// Representa todas las tareas y calcula el progreso de completado para el elemento progress. 
// LA BARRA DE PROGRESO ESTA CON IA PORQUE NO ME ACORDE QUE HABIA QUE HACERLO
const mostrarTareas = () => {
  listaTareas.replaceChildren(...tareas.map(crearElementoTarea));
  // Cuenta las tareas completadas y calcula el porcentaje que se presenta como texto.
  const completadas = tareas.filter((tarea) => tarea.completada === true).length;
  const total = tareas.length;
  const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100);

  // El máximo se mantiene en al menos uno para que la barra tenga un rango válido sin tareas.
  barraProgreso.max = total || 1;
  barraProgreso.value = completadas;
  barraProgreso.setAttribute("aria-valuetext", `${completadas} de ${total} tareas completadas`);
  textoProgreso.textContent = `${completadas} de ${total} tareas completadas (${porcentaje}%).`;
};

// Sustituye temporalmente la tarea por un formulario que permite cambiar fecha y prioridad.
const editarTarea = (tarea, elementoOriginal) => {
  const elemento = document.createElement("li");
  elemento.className = "tarea-elemento tarea-en-edicion";

  const formularioEdicion = document.createElement("form");
  formularioEdicion.className = "formulario-edicion-tarea";

  // Precarga la fecha y los selectores con los valores que tenía la tarea.
  const campoFechaEdicion = document.createElement("input");
  campoFechaEdicion.type = "date";
  campoFechaEdicion.lang = "es-ES";
  campoFechaEdicion.value = tarea.fecha ?? "";

  const campoPrioridadEdicion = crearSelectorPrioridad(tarea.prioridad);
  const botonGuardar = crearBoton("Guardar", "submit");
  const botonCancelar = crearBoton("Cancelar", "button", mostrarTareas);

  formularioEdicion.append(campoFechaEdicion, campoPrioridadEdicion, botonGuardar, botonCancelar);
  formularioEdicion.addEventListener("submit", (evento) => {
    // Evita que guardar la edición recargue la página.
    evento.preventDefault();

    // Actualiza solo la fecha y la prioridad de la tarea editada.
    const nuevas = tareas.map((item) =>
      item.identificador === tarea.identificador
        ? { ...item, fecha: campoFechaEdicion.value, prioridad: campoPrioridadEdicion.value }
        : item,
    );

    actualizarTareas(nuevas, "Tarea actualizada correctamente.");
  });

  // Conserva el nombre visible mientras muestra el formulario de edición junto a él.
  elemento.append(crearElementoTexto("tarea-nombre", tarea.nombre), formularioEdicion);
  listaTareas.replaceChild(elemento, elementoOriginal);
};

// Aplica al logotipo y al título de la pestaña el nombre configurado por el usuario.
const configuracion = leerConfiguracion();
if (configuracion) {
  $(".logo").textContent = configuracion.nombreAplicacion;
  document.title = `Mis tareas - ${configuracion.nombreAplicacion}`;
}

// Intercepta el envío, construye una tarea nueva y la añade al estado persistido.
formularioTareas.addEventListener("submit", (evento) => {
  // El formulario se procesa en esta página, por lo que no se usa el envío convencional.
  evento.preventDefault();

  // Lee los valores del formulario y elimina espacios exteriores del nombre.
  const nombre = campoNombre.value.trim();
  const fecha = campoFecha.value;

  // La prioridad procede del selector y el identificador distingue esta tarea de las demás.
  const nuevaTarea = {
    identificador: crearIdentificador(),
    nombre,
    prioridad: campoPrioridad.value,
    fecha,
  };

  // Guarda la lista actualizada, limpia el formulario y devuelve el foco al nombre.
  actualizarTareas([...tareas, nuevaTarea], "Tarea guardada correctamente.");
  formularioTareas.reset();
  campoNombre.focus();
});

// Inicializa el estado desde el almacenamiento y renderiza la lista al abrir la página.
tareas = cargarTareas();
mostrarTareas();
