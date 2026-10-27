// Referencias a los valores y mensajes de resumen del presupuesto.
const totalPresupuesto = document.querySelector("#total_presupuesto");
const presupuestoRestante = document.querySelector("#presupuesto_restante");
const botonPresupuesto = document.querySelector("#mostrar_formulario_presupuesto");
const formularioPresupuesto = document.querySelector("#formulario_presupuesto");
const campoPresupuesto = document.querySelector("#cantidad_presupuesto");
const estadoPresupuesto = document.querySelector("#estado_presupuesto");
// Referencias al formulario de gasto y a la lista que muestra el historial.
const formularioGasto = document.querySelector("#formulario_gasto");
const campoNombreGasto = document.querySelector("#nombre_gasto");
const campoCantidadGasto = document.querySelector("#cantidad_gasto");
const campoFechaGasto = document.querySelector("#fecha_gasto");
const estadoGasto = document.querySelector("#estado_gasto");
const historialGastos = document.querySelector("#historial_gastos");

// Claves de localStorage para conservar el presupuesto y los gastos entre visitas.
const clavePresupuesto = "presupuesto_gastos";
const claveGastos = "gastos_guardados";
// Estado cargado en memoria que se actualiza al añadir importes o gastos.
let presupuesto = 0;
let gastos = [];

// Formatea una cantidad numérica con la convención española y el símbolo de euro.
function euros(cantidad) {
  return `${cantidad.toFixed(2).replace(".", ",")} €`;
}

// Calcula lo gastado y actualiza el presupuesto total, el saldo disponible y su estilo.
function mostrarPresupuesto() {
  // Suma las cantidades de todos los gastos registrados en memoria.
  const totalGastado = gastos.reduce((suma, gasto) => suma + gasto.cantidad, 0);
  totalPresupuesto.textContent = euros(presupuesto);
  presupuestoRestante.textContent = `Disponible: ${euros(presupuesto - totalGastado)}`;
  // Aplica una clase visual cuando el gasto acumulado supera el presupuesto.
  presupuestoRestante.classList.toggle("presupuesto-superado", totalGastado > presupuesto);
}

// Limpia y vuelve a dibujar el historial; al final sincroniza el resumen del presupuesto.
function mostrarGastos() {
  historialGastos.replaceChildren();

  // En ausencia de gastos presenta un mensaje en vez de dejar la lista vacía.
  if (gastos.length === 0) {
    const aviso = document.createElement("li");
    aviso.className = "historial-vacio";
    aviso.textContent = "Todavía no hay gastos registrados.";
    historialGastos.append(aviso);
    mostrarPresupuesto();
    return;
  }

  // Ordena una copia para mostrar los gastos más recientes primero sin reordenar el estado.
  gastos
    .slice()
    .sort((gastoA, gastoB) => gastoB.fecha.localeCompare(gastoA.fecha))
    .forEach((gasto) => {
      // Construye cada fila con nodos de texto separados para nombre, fecha e importe.
      const fila = document.createElement("li");
      const nombre = document.createElement("span");
      const fecha = document.createElement("span");
      const cantidad = document.createElement("strong");

      fila.className = "fila-gasto";
      nombre.className = "nombre-gasto";
      nombre.textContent = gasto.nombre;
      fecha.className = "fecha-gasto";
      fecha.textContent = new Date(`${gasto.fecha}T00:00:00`).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      cantidad.textContent = euros(gasto.cantidad);
      fila.append(nombre, fecha, cantidad);
      historialGastos.append(fila);
    });

  // Actualiza los importes del resumen después de completar el historial.
  mostrarPresupuesto();
}

// Alterna el formulario de presupuesto e informa del estado abierto/cerrado a tecnologías de asistencia.
botonPresupuesto.addEventListener("click", () => {
  formularioPresupuesto.hidden = !formularioPresupuesto.hidden;
  botonPresupuesto.setAttribute("aria-expanded", String(!formularioPresupuesto.hidden));
  // Sitúa el foco en el campo para que se pueda introducir el importe inmediatamente.
  if (!formularioPresupuesto.hidden) campoPresupuesto.focus();
});

// Suma el importe introducido al presupuesto y persiste el nuevo total.
formularioPresupuesto.addEventListener("submit", (envio) => {
  // Evita la navegación predeterminada del formulario.
  envio.preventDefault();
  // Convierte a número el texto del campo de importe.
  const cantidad = Number(campoPresupuesto.value);

  presupuesto += cantidad;

  // Guarda el total como texto; localStorage solo almacena cadenas.
  localStorage.setItem(clavePresupuesto, String(presupuesto));

  // Limpia el campo, confirma el cambio y refresca los importes mostrados.
  formularioPresupuesto.reset();
  estadoPresupuesto.textContent = "Presupuesto actualizado.";
  mostrarGastos();
});

// Crea un registro de gasto, lo añade a la lista y guarda la lista completa.
formularioGasto.addEventListener("submit", (envio) => {
  // Evita que el navegador recargue la página al enviar el formulario.
  envio.preventDefault();
  // Lee los valores actuales de los tres campos del gasto.
  const nombre = campoNombreGasto.value.trim();
  const cantidad = Number(campoCantidadGasto.value);
  const fecha = campoFechaGasto.value;

  // Agrupa los datos y genera un identificador para reconocer este registro.
  const gastoNuevo = {
    identificador: `${Date.now()}-${Math.random()}`,
    nombre,
    cantidad,
    fecha,
  };
  // Conserva el nuevo gasto en el estado que utiliza la interfaz.
  gastos.push(gastoNuevo);

  // Serializa y persiste todos los gastos para no perder el historial al salir.
  localStorage.setItem(claveGastos, JSON.stringify(gastos));

  // Reinicia el formulario, propone hoy para el siguiente gasto y actualiza la pantalla.
  formularioGasto.reset();
  campoFechaGasto.value = fechaActual();
  estadoGasto.textContent = "Gasto guardado correctamente.";
  mostrarGastos();
});

// Devuelve la fecha local de hoy como AAAA-MM-DD para el campo HTML de tipo date.
function fechaActual() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// Recupera el presupuesto guardado; si no existe, se conserva el valor inicial cero.
const presupuestoGuardado = localStorage.getItem(clavePresupuesto);
if (presupuestoGuardado !== null) {
  presupuesto = Number(presupuestoGuardado);
}

// Recupera el historial serializado o inicia con una lista vacía si todavía no existe.
const gastosGuardados = localStorage.getItem(claveGastos);
gastos = gastosGuardados === null ? [] : JSON.parse(gastosGuardados);

// Inicializa el campo de fecha y muestra el historial y los cálculos iniciales.
campoFechaGasto.value = fechaActual();
mostrarGastos();
