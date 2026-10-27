import { eventoValido, fechaValida, leerLista, tareaValida, textoValido } from "./validacion.js";

// Atajo para localizar elementos por selector en el documento de la agenda.
const $ = (selector) => document.querySelector(selector);
// Referencias a las zonas que se actualizan al mostrar el calendario y su formulario.
const tituloMes = $("#mes_actual");
const calendario = $("#dias_calendario");
const formulario = $("#formulario_evento");
const botonFormulario = $("#mostrar_formulario_evento");
const campoNombre = $("#nombre_evento");
const campoFecha = $("#fecha_evento");
const estado = $("#estado_eventos");

// Claves compartidas con las páginas de eventos y tareas para usar el mismo almacenamiento.
const claveEventos = "eventos_guardados";
const claveTareas = "tareas_guardadas";
// El calendario comienza en el mes actual y selecciona la fecha de hoy.
const hoy = new Date();
let mes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
let fechaSeleccionada = fechaISO(hoy);
// Copias en memoria de los datos persistidos, usadas para renderizar sin releer el almacenamiento.
let eventos = [];
let tareas = [];

// Convierte una fecha local al formato AAAA-MM-DD que usan los campos de tipo date.
function fechaISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Crea el elemento de lista que representa un único evento o tarea dentro de una celda.
function crearEntrada({ nombre, tipo }) {
  const entrada = document.createElement("li");
  entrada.className = `entrada-${tipo}`;
  entrada.textContent = nombre;
  return entrada;
}

// Reconstruye la tabla del calendario desde el estado actual del mes y las listas en memoria.
function mostrarCalendario() {
  const anio = mes.getFullYear();
  const numeroMes = mes.getMonth();
  // Convierte el índice de día de JavaScript (domingo primero) para que la semana empiece en lunes.
  const huecos = (new Date(anio, numeroMes, 1).getDay() + 6) % 7;
  // El día cero del mes siguiente corresponde al último día del mes visible.
  const dias = new Date(anio, numeroMes + 1, 0).getDate();
  // Combina ambos tipos de elementos y añade un tipo para asignar estilos diferentes.
  const entradas = [...eventos.map((item) => ({ ...item, tipo: "evento" })),
    ...tareas.map((item) => ({ ...item, tipo: "tarea" }))];

  // Actualiza el encabezado con el mes en español y elimina las celdas del render anterior.
  tituloMes.textContent = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(mes).replace(/^./, (letra) => letra.toLocaleUpperCase("es-ES"));
  calendario.replaceChildren();

  // Las celdas vacías alinean el día 1 debajo de su día de la semana (lunes primero).
  const celdas = Array.from({ length: huecos }, () => document.createElement("td"));

  // Crea una celda por cada día del mes y conecta su botón con la selección de fecha.
  for (let dia = 1; dia <= dias; dia += 1) {
    const fecha = fechaISO(new Date(anio, numeroMes, dia));
    const celda = document.createElement("td");
    const boton = document.createElement("button");

    boton.className = "numero-dia";
    boton.type = "button";
    boton.textContent = dia;
    boton.setAttribute("aria-pressed", String(fecha === fechaSeleccionada));
    boton.addEventListener("click", () => {
      // Seleccionar un día también sincroniza el campo de fecha del formulario.
      fechaSeleccionada = fecha;
      campoFecha.value = fecha;
      mostrarCalendario();
    });

    // Marca visualmente el día actual y el día elegido por el usuario.
    if (fecha === fechaISO(hoy)) celda.classList.add("dia-hoy");
    if (fecha === fechaSeleccionada) celda.classList.add("dia-seleccionado");
    celda.append(boton);

    // Añade a la celda todas las entradas cuya fecha coincide con este día.
    const delDia = entradas.filter((item) => item.fecha === fecha);
    if (delDia.length) {
      const lista = document.createElement("ul");
      lista.className = "entradas-dia";
      lista.append(...delDia.map(crearEntrada));
      celda.append(lista);
    }
    celdas.push(celda);
  }

  // Agrupa las celdas de siete en siete para formar las filas semanales de la tabla.
  for (let inicio = 0; inicio < celdas.length; inicio += 7) {
    const fila = document.createElement("tr");
    fila.append(...celdas.slice(inicio, inicio + 7));
    calendario.append(fila);
  }
}

// Alterna la visibilidad del formulario, mantiene accesible el estado del botón
// y, al abrirlo, propone la fecha seleccionada y enfoca el campo del nombre.
botonFormulario.addEventListener("click", () => {
  const formularioAbierto = formulario.classList.toggle("abierto");
  botonFormulario.setAttribute("aria-expanded", String(formularioAbierto));
  if (formularioAbierto) {
    campoFecha.value = fechaSeleccionada;
    campoNombre.focus();
  }
});

// Convierte el envío del formulario en la creación de un evento persistido.
formulario.addEventListener("submit", (envio) => {
  // Evita la recarga de la página que produciría el envío HTML convencional.
  envio.preventDefault();
  const nombre = campoNombre.value.trim();
  const fecha = campoFecha.value;

  // No guarda el evento si falta texto o la fecha no representa un día real.
  if (!textoValido(nombre) || !fechaValida(fecha)) {
    estado.textContent = "Introduce un nombre y una fecha válidos.";
    return;
  }

  // Crea una nueva lista en lugar de modificar la existente y asigna un identificador.
  const nuevosEventos = [...eventos, {
    identificador: `${Date.now()}-${Math.random()}`,
    nombre,
    fecha,
  }];

  // Persiste primero la lista y luego actualiza el estado y la interfaz.
  localStorage.setItem(claveEventos, JSON.stringify(nuevosEventos));
  eventos = nuevosEventos;
  fechaSeleccionada = fecha;
  // Sitúa el calendario en el mes del evento, usando el primer día como referencia.
  mes = new Date(`${fecha}T00:00:00`);
  mes.setDate(1);
  // Limpia el formulario y conserva la fecha recién usada como propuesta.
  formulario.reset();
  campoFecha.value = fecha;
  estado.textContent = "Evento creado y añadido al calendario.";
  mostrarCalendario();
});

// Navega al mes anterior; el día 1 evita desbordamientos al cambiar desde meses largos.
$("#mes_anterior").addEventListener("click", () => {
  mes = new Date(mes.getFullYear(), mes.getMonth() - 1, 1);
  mostrarCalendario();
});

// Navega al mes siguiente y reconstruye la tabla para el nuevo mes.
$("#mes_siguiente").addEventListener("click", () => {
  mes = new Date(mes.getFullYear(), mes.getMonth() + 1, 1);
  mostrarCalendario();
});

// El evento storage se dispara en esta pestaña cuando otra pestaña cambia una clave.
window.addEventListener("storage", (cambio) => {
  // Ignora los cambios de otras claves que no afectan al contenido del calendario.
  if (![claveEventos, claveTareas].includes(cambio.key)) return;

  // Vuelve a leer las dos listas compartidas y representa los datos actualizados.
  eventos = leerLista(claveEventos, eventoValido);
  tareas = leerLista(claveTareas, tareaValida);
  mostrarCalendario();
});

// Carga los datos existentes al iniciar la página.
eventos = leerLista(claveEventos, eventoValido);
tareas = leerLista(claveTareas, tareaValida);

// Propone hoy en el formulario y dibuja por primera vez el mes actual.
campoFecha.value = fechaSeleccionada;
mostrarCalendario();
