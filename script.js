window.onload = async function() {

  const container = document.getElementById("mapa-container");
  const inner = document.getElementById("mapa-inner");
  const mapaImg = document.getElementById("mapa");
  const gridOverlay =
  document.getElementById("gridOverlay");

  // ================= PANEL LATERAL (MÓVIL) =================
  // Registrado ya mismo, al principio de todo, para que un
  // posible error más adelante en esta función nunca impida
  // que el botón de colapsar/expandir quede activo.

  const botonToggleSidebar =
    document.getElementById("toggleSidebarMovil");

  const sidebarEl =
    document.getElementById("sidebar");

  const sidebarContenidoEl =
    document.getElementById("sidebarContenido");

  if(botonToggleSidebar && sidebarEl){

    botonToggleSidebar.addEventListener("click", () => {

      sidebarEl.classList.toggle("colapsado");

      const icono =
        botonToggleSidebar.querySelector("i");

      icono.className =
        sidebarEl.classList.contains("colapsado")
          ? "fas fa-bars"
          : "fas fa-times";

    });

  }else{

    console.warn(
      "No se encontró #toggleSidebarMovil o #sidebar en el DOM."
    );

  }

  // ================= TIRADOR PARA REDIMENSIONAR (MÓVIL) =================
  // Permite arrastrar verticalmente el borde inferior de la
  // franja superior para ajustar su altura a mano.

  const tiradorSidebar =
    document.getElementById("resizeSidebarMovil");

  if(tiradorSidebar && sidebarContenidoEl){

    let arrastrandoAlto = false;
    let altoInicial = 0;
    let yInicial = 0;

    const ALTO_MINIMO = 100;

    const altoMaximo = () =>
      window.innerHeight * 0.75;

    tiradorSidebar.addEventListener("pointerdown", (e) => {

      arrastrandoAlto = true;
      yInicial = e.clientY;

      altoInicial =
        sidebarContenidoEl.getBoundingClientRect().height;

      tiradorSidebar.setPointerCapture(e.pointerId);

    });

    tiradorSidebar.addEventListener("pointermove", (e) => {

      if(!arrastrandoAlto) return;

      const delta = e.clientY - yInicial;

      let nuevoAlto = altoInicial + delta;

      nuevoAlto = Math.max(
        ALTO_MINIMO,
        Math.min(altoMaximo(), nuevoAlto)
      );

      sidebarContenidoEl.style.maxHeight =
        nuevoAlto + "px";

    });

    const terminarArrastreAlto = () => {
      arrastrandoAlto = false;
    };

    tiradorSidebar.addEventListener("pointerup", terminarArrastreAlto);
    tiradorSidebar.addEventListener("pointercancel", terminarArrastreAlto);

  }

  // ================= TIRADOR: FICHA vs RESTO (MÓVIL) =================
  // Reparte el espacio entre la ficha de información (arriba)
  // y el resto del contenido: filtros, admin, discord (abajo).

  const tiradorInfoScroll =
    document.getElementById("resizeInfoScroll");

  const infoScrollEl =
    document.getElementById("infoScroll");

  if(tiradorInfoScroll && infoScrollEl){

    let arrastrandoInfo = false;
    let altoInfoInicial = 0;
    let yInfoInicial = 0;

    const ALTO_INFO_MINIMO = 60;

    const altoInfoMaximo = () =>
      (sidebarContenidoEl
        ? sidebarContenidoEl.getBoundingClientRect().height
        : window.innerHeight * 0.6) - 60;
        // deja siempre un hueco mínimo para el resto

    tiradorInfoScroll.addEventListener("pointerdown", (e) => {

      arrastrandoInfo = true;
      yInfoInicial = e.clientY;

      altoInfoInicial =
        infoScrollEl.getBoundingClientRect().height;

      tiradorInfoScroll.setPointerCapture(e.pointerId);

    });

    tiradorInfoScroll.addEventListener("pointermove", (e) => {

      if(!arrastrandoInfo) return;

      const delta = e.clientY - yInfoInicial;

      let nuevoAlto = altoInfoInicial + delta;

      nuevoAlto = Math.max(
        ALTO_INFO_MINIMO,
        Math.min(altoInfoMaximo(), nuevoAlto)
      );

      infoScrollEl.style.height =
        nuevoAlto + "px";

    });

    const terminarArrastreInfo = () => {
      arrastrandoInfo = false;
    };

    tiradorInfoScroll.addEventListener("pointerup", terminarArrastreInfo);
    tiradorInfoScroll.addEventListener("pointercancel", terminarArrastreInfo);

  }

  // ================= LIMPIEZA AL CAMBIAR DE MODO =================
  // Las alturas que fijan los tiradores son estilos inline, y un
  // inline pesa más que el CSS de escritorio. Si no se limpian al
  // cruzar el punto de corte, se quedan "pegadas" y aplastan la
  // ficha o el panel cuando pasas de móvil a escritorio (o al revés).

  const mqMovil = window.matchMedia("(max-width: 860px)");

  function limpiarAlturasManuales(){

    if(sidebarContenidoEl){
      sidebarContenidoEl.style.maxHeight = "";
    }

    if(infoScrollEl){
      infoScrollEl.style.height = "";
    }

  }

  mqMovil.addEventListener("change", limpiarAlturasManuales);

  // ================= SUBTÍTULO: TOPBAR vs RESTO =================
  // En modo topbar, el subtítulo se traslada a la cabecera para
  // aprovechar el hueco entre el título y el botón toggle. En
  // escritorio y en el tramo intermedio (sidebar izquierda),
  // vuelve a su sitio original, bajo el ornamento.

  const cabeceraEl =
    document.getElementById("sidebarCabecera");

  const ornamentoEl =
    document.getElementById("ornamento");

  const subtituloEl =
    document.getElementById("subtituloMapa");

  function colocarSubtitulo(){

    if(!cabeceraEl || !subtituloEl) return;

    if(mqMovil.matches){

      // Topbar: entre el título y el botón de mostrar/ocultar
      cabeceraEl.insertBefore(
        subtituloEl,
        botonToggleSidebar || null
      );

    }else if(ornamentoEl){

      // Escritorio / sidebar: justo tras el ornamento
      if(ornamentoEl.nextSibling !== subtituloEl){
        ornamentoEl.insertAdjacentElement(
          "afterend",
          subtituloEl
        );
      }

    }

  }

  colocarSubtitulo();
  mqMovil.addEventListener("change", colocarSubtitulo);

  // ================= SECCIONES PLEGABLES =================
  // Válido en escritorio, sidebar responsive y topbar responsive.
  // Recuerda qué secciones tenía el usuario plegadas.

  const CLAVE_SECCIONES = "granSiniestaSeccionesPlegadas";
  let estadoSecciones = {};

  function cargarEstadoSecciones(){

    let estado = {};

    try{

      estado =
        JSON.parse(
          localStorage.getItem(CLAVE_SECCIONES)
        ) || {};

    }catch(e){

      estado = {};

    }

    // La ficha empieza plegada en todos los modos. Al pulsar un
    // marcador se abre de nuevo mediante desplegarFichaLugar().
    estado.ficha = true;
    estadoSecciones = estado;
    localStorage.setItem(
      CLAVE_SECCIONES,
      JSON.stringify(estadoSecciones)
    );

    document
      .querySelectorAll(".seccionCabecera")
      .forEach(cabecera => {

        const id = cabecera.dataset.seccion;
        const wrapper = cabecera.closest(".seccionPlegable");

        if(!wrapper) return;

        if(estado[id]){
          wrapper.classList.add("plegada");
        }

        cabecera.addEventListener("click", () => {

          wrapper.classList.toggle("plegada");

          // Limpia la altura fijada a mano por su tirador,
          // para que el CSS "auto" recupere el control
          if(
            wrapper.id === "infoScroll" &&
            wrapper.classList.contains("plegada")
          ){
            wrapper.style.height = "";
          }

          estado[id] =
            wrapper.classList.contains("plegada");

          localStorage.setItem(
            CLAVE_SECCIONES,
            JSON.stringify(estado)
          );

        });

      });

  }

  cargarEstadoSecciones();

  // En escritorio todas las secciones arrancan abiertas. El usuario
  // aún puede plegarlas durante la sesión si lo desea.
  function abrirSeccionesEnEscritorio(){

    if(mqMovil.matches) return;

    document
      .querySelectorAll(".seccionPlegable")
      .forEach(seccion => seccion.classList.remove("plegada"));

    const ficha = document.getElementById("infoScroll");
    if(ficha){
      ficha.classList.add("plegada");
    }

    Object.keys(estadoSecciones).forEach(id => {
      delete estadoSecciones[id];
    });
    estadoSecciones.ficha = true;
    localStorage.setItem(
      CLAVE_SECCIONES,
      JSON.stringify(estadoSecciones)
    );

  }

  abrirSeccionesEnEscritorio();
  mqMovil.addEventListener("change", abrirSeccionesEnEscritorio);

  function desplegarFichaLugar(){

    const ficha = document.getElementById("infoScroll");

    if(ficha){
      ficha.classList.remove("plegada");
      estadoSecciones.ficha = false;
      localStorage.setItem(
        CLAVE_SECCIONES,
        JSON.stringify(estadoSecciones)
      );

      const contenidoFicha = ficha.querySelector(".seccionContenido");
      if(contenidoFicha){
        contenidoFicha.scrollTop = 0;
      }
    }

    if(sidebarEl){
      sidebarEl.classList.remove("colapsado");
    }

    const icono = botonToggleSidebar?.querySelector("i");
    if(icono){
      icono.className = "fas fa-times";
    }

  }

  let lugares = [];
  let territorios = {};

  async function cargarDatos(){

  const respuesta =
    await fetch("gran-siniesta.json");

  const datos =
    await respuesta.json();

  lugares =
    datos.lugares || [];

  territorios =
    datos.territorios || {};

}
  await cargarDatos();
  console.log(lugares);
  console.log(territorios);
  // ================= GUARDADO =================

const datosGuardados =
  localStorage.getItem("granSiniestaMapa");

if (datosGuardados) {

  const datos =
    JSON.parse(datosGuardados);

  lugares =
    datos.lugares || [];

  territorios =
    datos.territorios || {};

}
  let modoEdicion = false;
  
let colorTerritorio = "#a11011";

/*
==================================================
MODO ADMIN
true  = edición habilitada
false = modo público (GitHub Pages)
==================================================
*/

const ES_ADMIN = false;

  // ================= LIBRERÍA COMPLETA =================

  const RECURSOS = {

  minerales: {

    "Madera": {
      rareza: "comun",
      tirada: "d6+2"
    },

    "Cobre": {
      rareza: "comun",
      tirada: "d6+2"
    },

    "Bronce": {
      rareza: "comun",
      tirada: "d6+2"
    },

    "Hierro": {
      rareza: "comun",
      tirada: "d6+2"
    },

    "Azufre": {
      rareza: "comun",
      tirada: "d6+2"
    },

    "Basalto": {
      rareza: "comun",
      tirada: "d6+2"
    },

    "Acero": {
      rareza: "inusual",
      tirada: "d4"
    },

    "Pólvora": {
      rareza: "inusual",
      tirada: "d4"
    },

    "Obsidiana": {
      rareza: "inusual",
      tirada: "d4"
    },

    "Ámbar": {
      rareza: "inusual",
      tirada: "d4"
    },

    "Ópalo": {
      rareza: "inusual",
      tirada: "d4"
    },

    "Plata": {
      rareza: "raro",
      tirada: "d3"
    },

    "Cuarzo": {
      rareza: "raro",
      tirada: "d3"
    },

    "Trozo de Meteorito": {
      rareza: "raro",
      tirada: "d3"
    },

    "Mercurio": {
      rareza: "raro",
      tirada: "d3"
    },

    "Oro": {
      rareza: "muy_raro",
      tirada: "1"
    },

    "Viasrion": {
      rareza: "muy_raro",
      tirada: "1"
    }

  }

};
  const LIB = {

    minerales: [
      "Madera","Antimonio","Arsénico","Cobre","Bronce","Hierro","Acero","Plomo","Plata","Oro",
      "Mercurio","Azufre","Pólvora","Basalto","Obsidiana","Ámbar","Cuarzo","Esmeralda","Ópalo",
      "Turquesa","Haxio","Viasrion","Trozo de Meteorito","Agua Vital"
    ],

    vegetacion: [
      "Acónito","Madreselva","Arrayán Blanco","Verbena","Celidonia","Cicuta","Milenrama",
      "Espino de Hart","Raíz de Mandrágora","Bayas de Brionia Dioica","Bejin","Tremol",
      "Coral Azul","Pino del Diablo","Rafflesia Arnoldii","Yiacar","Drupa de Mirlo",
      "Flor de Tacca","Reina de la Noche","Drakaea","Flor de Mimosa","Jade",
      "Welwitschia","Lycoris Radiata"
    ],

    monstruos: [
      "Draco","Golem","Las'kram","Nagkar","Nakkros","Dorgselbur","Hombre lobo",
      "Alto Vampiro","Lamia","Kathakano","Vieszcy","Apariciones","Sangrientos",
      "Doppler","Mamarro","Lisovik","Nazbag","Quimera","Grifo","Arpía","Sirena",
      "Narvashji","Espina Roja","Garuba","Acantha","Gallón","Wyvern","Cocatriz","Basilisco"
    ],

    comida: [
      "Ajo","Arroz","Avena","Calabaza","Cebada","Cebolla","Especias","Huevo","Lechuga",
      "Miel","Patatas","Pimiento","Salmón","Tomate","Trigo","Trucha","Vino","Uvas",
      "Bayas","Carne de Caza","Cerezas","Dorada","Fresas","Leche","Lubina","Manzana",
      "Plátano","Seta"
    ]

  };
  
  Object.keys(LIB).forEach(categoria => {
  LIB[categoria].sort((a, b) =>
    a.localeCompare(b, "es")
  );
});

const ICONOS = [

  {
    nombre: "Capital",
    clase: "fab fa-fort-awesome",
    tamaño: "18px"
  },

  {
    nombre: "Región / Zona",
    clase: "ra ra-spikeball",
    tamaño: "14px"
  },

  {
    nombre: "Ciudad",
    clase: "fas fa-chess-rook",
    tamaño: "12px"
  },

  {
    nombre: "Bosque",
    clase: "fab fa-pagelines",
    tamaño: "12px"
  },

  {
    nombre: "Montaña",
    clase: "fas fa-mountain",
    tamaño: "12px"
  },

  {
    nombre: "Mar",
    clase: "ra ra-aquarius",
    tamaño: "12px"
  },
  
    {
    nombre: "Hiniestra",
    clase: "ra ra-capitol",
    tamaño: "18px"
  }

];

  // ================= CUADRÍCULA =================

let gridVisible = false;
let mapaAlt = false;
let filtrosActivos = new Set();

function crearCuadricula(){

  gridOverlay.innerHTML = "";

  gridOverlay.style.display = "grid";

  gridOverlay.style.gridTemplateColumns =
    "repeat(93, 1fr)";

  gridOverlay.style.gridTemplateRows =
    "repeat(64, 1fr)";

for(let fila=0; fila<64; fila++){

  for(let columna=0; columna<93; columna++){

    const cell =
      document.createElement("div");

    cell.className = "grid-cell";

    cell.dataset.x = columna;
    cell.dataset.y = fila;

cell.addEventListener("click", () => {

  if(!ES_ADMIN) return;

  if(!modoEdicion) return;

  const clave =
    columna + "_" + fila;

  // MISMO COLOR → BORRAR

  if(
    territorios[clave] === colorTerritorio
  ){

    delete territorios[clave];

    cell.style.backgroundColor =
      "transparent";

    return;

  }

  // COLOR DISTINTO → PINTAR

  territorios[clave] =
    colorTerritorio;

  cell.style.backgroundColor =
    colorTerritorio;

  cell.style.opacity = "0.6";

});

    gridOverlay.appendChild(cell);

  }

}

}

crearCuadricula();

gridOverlay.style.display = "none";
  Object.entries(territorios)
.forEach(([clave, color]) => {

  const partes =
    clave.split("_");

  const x =
    partes[0];

  const y =
    partes[1];

  const indice =
    (Number(y) * 93)
    + Number(x);

  const cell =
    document.querySelectorAll(".grid-cell")[indice];

  if(!cell) return;

  cell.style.backgroundColor =
    color;

  cell.style.opacity = "0.6";

});
  
  // ================= MODO EDICIÓN =================

  const botonModo = document.getElementById("modoEdicion");
  const botonAdmin =
document.getElementById("toggleAdmin");

const adminPanel =
document.getElementById("adminPanel");
if(!ES_ADMIN){

  document.getElementById(
    "toggleAdmin"
  ).style.display = "none";

  document.getElementById(
    "adminPanel"
  ).style.display = "none";

}
  const botonGuardar =
  document.getElementById("guardarMapa");
  const botonExportar =
  document.getElementById("exportarMapa");
  const botonImportar =
document.getElementById("importarMapa");

const inputImport =
document.getElementById("importFile");
const panelFiltros =
document.getElementById("panelFiltros");
const botonLimpiar =
document.getElementById("limpiarFiltros");
  
document
.querySelectorAll(".faccion")
.forEach(el => {

  el.style.borderLeftColor =
    el.dataset.color;

  el.onclick = () => {

    document
      .querySelectorAll(".faccion")
      .forEach(f =>
        f.classList.remove("activa")
      );

    el.classList.add("activa");

    colorTerritorio =
      el.dataset.color;

  };

});

document
.querySelector(".faccion")
.classList.add("activa");
botonLimpiar.onclick = () => {

  filtrosActivos.clear();

  aplicarFiltros();

  actualizarFiltrosActivos();

  document
    .querySelectorAll(".filtroTag")
    .forEach(tag => {

      tag.classList.remove("activo");

    });

};
document
.querySelectorAll(".categoriaFiltro")
.forEach(icono => {

  icono.onclick = () => {

    document
      .querySelectorAll(".categoriaFiltro")
      .forEach(i =>
        i.classList.remove("activa")
      );

    icono.classList.add("activa");

    const categoria =
      icono.dataset.categoria;

    // =====================
    // POLÍTICA
    // =====================

    if(categoria === "politica"){

      panelFiltros.innerHTML = `

        <button id="toggleCasasPolitica">
          Las Siete Casas
        </button>

        <button id="toggleGridPolitica">
          Cuadrícula
        </button>

      `;

      const btnCasas =
      document.getElementById("toggleCasasPolitica");
      
      const mapaCasas =
      document.getElementById("mapaCasas");
      
      if(mapaAlt){
      
        btnCasas.classList.add("activo");
      
      }

btnCasas.onclick = () => {

  mapaAlt = !mapaAlt;

  mapaCasas.style.display =
    mapaAlt
      ? "block"
      : "none";

  btnCasas.classList.toggle(
    "activo",
    mapaAlt
  );

};

      const btnGrid =
      document.getElementById("toggleGridPolitica");

      btnGrid.onclick = () => {

        gridVisible = !gridVisible;

        gridOverlay.style.display =
          gridVisible
          ? "grid"
          : "none";

        btnGrid.classList.toggle(
          "activo",
          gridVisible
        );

      };

      return;

    }

    // =====================
    // RESTO DE CATEGORÍAS
    // =====================

    const lista =
      LIB[categoria];

panelFiltros.innerHTML =
  lista.map(item => `

    <div
      class="filtroTag ${
        filtrosActivos.has(item)
          ? "activo"
          : ""
      }"
      data-valor="${item}"
    >
      ${item}
    </div>

  `).join("");
document
.querySelectorAll(".filtroTag")
.forEach(tag => {

  tag.addEventListener(
    "click",
    () => {

      const valor =
        tag.dataset.valor;

      tag.classList.toggle(
        "activo"
      );

      if(
        filtrosActivos.has(valor)
      ){

        filtrosActivos.delete(
          valor
        );

      }
      else{

        filtrosActivos.add(
          valor
        );

      }

      aplicarFiltros();
      actualizarFiltrosActivos();

    }
  );

});
    
actualizarFiltrosActivos();

  };

});
  botonAdmin.onclick = () => {

  adminPanel.classList.toggle(
    "abierto"
  );

};

  botonModo.onclick = () => {

  modoEdicion = !modoEdicion;

  botonModo.classList.toggle("activo");

  if(modoEdicion){

    container.style.cursor = "crosshair";

  }else{

    container.style.cursor = "grab";

  }

};
botonGuardar.onclick = () => {

  localStorage.setItem(
    "granSiniestaMapa",

    JSON.stringify({

      lugares,
      territorios

    })

  );

  alert("Mapa guardado");

};
  
botonExportar.onclick = () => {

  const exportable = {

  lugares: lugares.map(lugar => {

    const copia = { ...lugar };

    delete copia._el;

    return copia;

  }),

  territorios

};

  const json =
    JSON.stringify(exportable, null, 2);

  const blob =
    new Blob(
      [json],
      {type:"application/json"}
    );

  const url =
    URL.createObjectURL(blob);

  const enlace =
    document.createElement("a");

  enlace.href = url;
  enlace.download = "gran-siniesta.json";

  enlace.click();

  URL.revokeObjectURL(url);

};
  botonImportar.onclick = () => {

  inputImport.click();

};
  
  inputImport.addEventListener(
  "change",
  function(e){

    const archivo =
      e.target.files[0];

    if(!archivo) return;

    const lector =
      new FileReader();

    lector.onload = function(ev){

      try{

        const datos =
          JSON.parse(ev.target.result);

        lugares =
  datos.lugares || [];

// Convertir minerales antiguos (objetos)
// en minerales de texto

lugares.forEach(lugar => {

  lugar.minerales =
    (lugar.minerales || []).map(mineral =>

      typeof mineral === "object"
        ? mineral.nombre
        : mineral

    );

});

territorios =
  datos.territorios || {};

        reconstruirMapa();

        localStorage.setItem(
          "granSiniestaMapa",
          JSON.stringify({
            lugares,
            territorios
          })
        );

        alert(
          "Mapa importado correctamente"
        );

      }catch(error){

        alert(
          "JSON inválido"
        );

      }

    };

    lector.readAsText(
      archivo
    );

  }
);

  // ================= DRAG =================
  let scale = 1, posX = 0, posY = 0;
  let isDragging = false, startX, startY;
  
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 4;
  const ZOOM_SPEED = 0.1;

container.onmousedown = (e) => {
  e.preventDefault();
  isDragging = true;
  startX = e.clientX - posX;
  startY = e.clientY - posY;
};

  container.onmousemove = (e) => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateTransform();
  };

  container.onmouseup = () => isDragging = false;
  container.onmouseleave = () => isDragging = false;

  function updateTransform() {

  inner.style.transformOrigin = "0 0";

  inner.style.transform =
    `translate(${posX}px, ${posY}px) scale(${scale})`;

}

  // ================= ZOOM =================

container.onwheel = (e) => {

  e.preventDefault();

  const rect = container.getBoundingClientRect();

  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Coordenadas del punto del mapa bajo el cursor
  const worldX = (mouseX - posX) / scale;
  const worldY = (mouseY - posY) / scale;

  // Calcular nuevo zoom
  const zoom =
    e.deltaY < 0
      ? scale + ZOOM_SPEED
      : scale - ZOOM_SPEED;

  scale = Math.max(
    MIN_ZOOM,
    Math.min(MAX_ZOOM, zoom)
  );

  // Recolocar el mapa para que el punto bajo el cursor no cambie
  posX = mouseX - worldX * scale;
  posY = mouseY - worldY * scale;

  updateTransform();

};

  // ================= TÁCTIL (MÓVIL / TABLET) =================
  // Un dedo = arrastrar el mapa. Dos dedos = pellizcar para hacer zoom.

  let isPinching = false;
  let pinchStartDist = 0;
  let pinchStartScale = 1;
  let pinchWorldX = 0, pinchWorldY = 0;
  let pinchMidX = 0, pinchMidY = 0;

  function distanciaEntreDedos(t1, t2){
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  }

  function puntoMedio(t1, t2){
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2
    };
  }

  container.addEventListener("touchstart", (e) => {

    if(e.touches.length === 1){

      isDragging = true;
      isPinching = false;

      const t = e.touches[0];

      startX = t.clientX - posX;
      startY = t.clientY - posY;

    } else if(e.touches.length === 2){

      isDragging = false;
      isPinching = true;

      const [t1, t2] = e.touches;

      pinchStartDist = distanciaEntreDedos(t1, t2);
      pinchStartScale = scale;

      const rect = container.getBoundingClientRect();
      const medio = puntoMedio(t1, t2);

      pinchMidX = medio.x - rect.left;
      pinchMidY = medio.y - rect.top;

      pinchWorldX = (pinchMidX - posX) / scale;
      pinchWorldY = (pinchMidY - posY) / scale;

    }

  }, { passive: false });

  container.addEventListener("touchmove", (e) => {

    e.preventDefault();

    if(isPinching && e.touches.length === 2){

      const [t1, t2] = e.touches;

      const nuevaDist = distanciaEntreDedos(t1, t2);

      let nuevaEscala =
        pinchStartScale * (nuevaDist / pinchStartDist);

      nuevaEscala = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, nuevaEscala)
      );

      scale = nuevaEscala;

      posX = pinchMidX - pinchWorldX * scale;
      posY = pinchMidY - pinchWorldY * scale;

      updateTransform();

    } else if(isDragging && e.touches.length === 1){

      const t = e.touches[0];

      posX = t.clientX - startX;
      posY = t.clientY - startY;

      updateTransform();

    }

  }, { passive: false });

  function terminarToqueMapa(e){

    if(e.touches.length === 0){

      isDragging = false;
      isPinching = false;

    } else if(e.touches.length === 1){

      // Se levantó un dedo mientras se pellizcaba:
      // continuar como arrastre con el dedo restante.

      isPinching = false;
      isDragging = true;

      const t = e.touches[0];

      startX = t.clientX - posX;
      startY = t.clientY - posY;

    }

  }

  container.addEventListener("touchend", terminarToqueMapa);
  container.addEventListener("touchcancel", terminarToqueMapa);

  // ================= TOGGLE MAPA =================


function reconstruirMapa(){

  // BORRAR MARCADORES

  document
    .querySelectorAll(".marcador")
    .forEach(el => el.remove());

  // VOLVER A CREAR

  lugares.forEach(lugar => {

    crearMarcador(lugar);

  });

  // LIMPIAR CUADRÍCULA

  document
    .querySelectorAll(".grid-cell")
    .forEach(cell => {

      cell.style.backgroundColor =
        "transparent";

    });

  // REPINTAR TERRITORIOS

  Object.entries(territorios)
  .forEach(([clave, color]) => {

    const partes =
      clave.split("_");

    const x =
      Number(partes[0]);

    const y =
      Number(partes[1]);

    const indice =
      y * 93 + x;

    const cell =
      document.querySelectorAll(".grid-cell")[indice];

    if(!cell) return;

    cell.style.backgroundColor =
      color;

    cell.style.opacity = "0.6";

  });

}  

// ================= CREAR MARCADOR =================

  function crearMarcador(lugar) {
    const marcador = document.createElement("div");
    marcador.className = "marcador";
    marcador.style.left = lugar.x + "%";
    marcador.style.top = lugar.y + "%";

marcador.innerHTML =
  `<i
    class="${lugar.icono || "fas fa-map-marker-alt"}"
    style="
      color:${lugar.color || "#ffffff"};
      font-size:${lugar.tamaño || "12px"};
      text-shadow:
0 0 2px rgba(0,0,0,.75),
0 0 6px rgba(0,0,0,.70);
    "
  ></i>`;

marcador.onclick = (e) => {

  e.stopPropagation();

  if(
    ES_ADMIN &&
    modoEdicion
  ){
    abrirFormulario(lugar);
  }
  else{
    mostrarLugar(lugar);
  }

};

    lugar._el = marcador;
    inner.appendChild(marcador);
  }

// ================= CARGAR MARCADORES =================

console.log("Voy a crear", lugares.length, "marcadores");

lugares.forEach(lugar => {

  crearMarcador(lugar);

});

console.log("Marcadores creados");

// ================= CLICK MAPA =================

inner.onclick = function(e) {
  if(!ES_ADMIN) return;

  // Si se ha clicado una casilla de la cuadrícula,
  // no crear localización.

  if (
    e.target.classList.contains("grid-cell")
  ) {
    return;
  }

  if (!modoEdicion) return;

  const rect = inner.getBoundingClientRect();

  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  const nuevo = { x, y };

  lugares.push(nuevo);

  crearMarcador(nuevo);

  abrirFormulario(nuevo);

};

  // ================= FORMULARIO =================

  function abrirFormulario(lugar) {

    document.querySelectorAll(".form-popup").forEach(e => e.remove());

    const form = document.createElement("div");
    form.className = "form-popup";

    form.innerHTML = `
<input placeholder="Nombre" id="f-nombre" value="${lugar.nombre || ""}">

<textarea placeholder="Descripción" id="f-desc">${lugar.descripcion || ""}</textarea>

<input
  placeholder="URL de imagen"
  id="f-imagen"
  value="${lugar.imagen || ""}"
>

<label>Icono:</label>

<div class="icon-grid">

${ICONOS.map(i => `
  <div
    class="icon-option ${lugar.icono===i.clase ? 'selected-icon' : ''}"
    data-clase="${i.clase}"
  >

    <i class="${i.clase}"></i>

    <span>
      ${i.nombre}
    </span>

  </div>
`).join("")}

</div>

<label>Color:</label>

<div class="color-grid">

<div class="color-option" data-color="#a11011" title="Kal'arch"></div>

<div class="color-option" data-color="#ffa900" title="Reshk'arch"></div>

<div class="color-option" data-color="#a6b7c4" title="Rehgis"></div>

<div class="color-option" data-color="#c93457" title="Blavyr"></div>

<div class="color-option" data-color="#0054ad" title="Vaelekin"></div>

<div class="color-option" data-color="#1e7329" title="Gallarion"></div>

<div class="color-option" data-color="#008791" title="A'Drien"></div>

<div class="color-option" data-color="#6951c9" title="Ve'anor"></div>

<div class="color-option" data-color="#b545de" title="Reden"></div>

<div class="color-option" data-color="#731010" title="Vampiros"></div>

</div>

      ${crearCheckboxes("Vegetación", "veg", LIB.vegetacion, lugar.vegetacion)}
      ${crearCheckboxes("Monstruos", "mon", LIB.monstruos, lugar.monstruos)}
      ${crearCheckboxes("Minerales", "min", LIB.minerales, lugar.minerales)}
      ${crearCheckboxes("Comida", "com", LIB.comida, lugar.comida)}

      <button id="guardar">Guardar</button>
      <button id="borrar" style="background:#5a0f0f;">Eliminar</button>
    `;

    document.body.appendChild(form);
    document
.querySelectorAll(".editorTag")
.forEach(tag => {

  tag.onclick = () => {

    tag.classList.toggle(
      "activo"
    );

  };

});
    let iconoSeleccionado =
  lugar.icono || "fas fa-map-marker-alt";

let colorSeleccionado =
  lugar.color || "#ffffff";


// ICONOS

document.querySelectorAll(".icon-option")
.forEach(el => {

  el.addEventListener("click", () => {

    document
      .querySelectorAll(".icon-option")
      .forEach(i => i.classList.remove("selected-icon"));

    el.classList.add("selected-icon");

    iconoSeleccionado = el.dataset.clase;

  });

});


// COLORES

document.querySelectorAll(".color-option")
.forEach(el => {

  el.style.backgroundColor =
    el.dataset.color;

  el.addEventListener("click", () => {

    document
      .querySelectorAll(".color-option")
      .forEach(c => c.classList.remove("selected-color"));

    el.classList.add("selected-color");

    colorSeleccionado =
      el.dataset.color;

  });

});

    document.getElementById("guardar").onclick = () => {

      lugar.nombre = val("f-nombre");
      lugar.descripcion = val("f-desc");
      lugar.imagen = val("f-imagen");
      lugar.icono = iconoSeleccionado;
      const iconoInfo =
  ICONOS.find(
    i => i.clase === iconoSeleccionado
  );

lugar.tamaño =
  iconoInfo?.tamaño || "12px";
      lugar.color = colorSeleccionado;

      lugar.vegetacion = getChecks("veg");
      lugar.monstruos = getChecks("mon");
      lugar.minerales = getChecks("min");
      lugar.comida = getChecks("com");

      actualizarMarcador(lugar);

      form.remove();
    };

document.getElementById("borrar").onclick = () => {

  lugar._el.remove();

  lugares = lugares.filter(
    l => l !== lugar
  );

localStorage.setItem(
  "granSiniestaMapa",
  JSON.stringify({
    lugares,
    territorios
  })
);

  form.remove();

};
  }

  function val(id) {
    return document.getElementById(id).value;
  }

function getChecks(prefix){
  return Array
  .from(
    document.querySelectorAll(
      `.editorTag.activo[data-prefix="${prefix}"]`
    )

  )
  .map(tag =>
    tag.dataset.value
  );

}

function crearCheckboxes(
  titulo,
  prefix,
  lista,
  seleccion = []
){

  return `
    <details>

      <summary>
        ${titulo}
        ${
          seleccion?.length
          ? `(${seleccion.length})`
          : ""
        }
      </summary>

      <div class="checkbox-grid">

        ${lista.map(item => `

          <div
            class="filtroTag editorTag ${
  seleccion.some(s =>
    typeof s === "string"
      ? s === item
      : s.nombre === item
    )
      ? "activo"
      : ""
}"
            data-prefix="${prefix}"
            data-value="${item}"
          >

            ${item}

          </div>

        `).join("")}

      </div>

    </details>
  `;

}

  function actualizarMarcador(lugar) {
    lugar._el.innerHTML =
  `<i
    class="${lugar.icono}"
    style="
      color:${lugar.color};
      font-size:${lugar.tamaño || "12px"};
    "
  ></i>`;
  }
function aplicarFiltros(){

  lugares.forEach(lugar => {

    if(filtrosActivos.size === 0){

      lugar._el.style.display = "block";
      return;

    }

    const datosLugar = [

  ...(lugar.vegetacion || []),

  ...(lugar.monstruos || []),

  ...(lugar.minerales || []).map(m =>
    typeof m === "string"
      ? m
      : m.nombre
  ),

  ...(lugar.comida || [])

];

    const cumpleTodos =

      [...filtrosActivos]
      .every(filtro =>
        datosLugar.includes(filtro)
      );

    lugar._el.style.display =
      cumpleTodos
      ? "block"
      : "none";

  });

}


// ================= FILTROS ACTIVOS =================

function actualizarFiltrosActivos(){

  const lista =
  document.getElementById(
    "listaFiltrosActivos"
  );

const panel =
  document.getElementById(
    "panelFiltrosActivos"
  );

lista.innerHTML = "";

  lista.innerHTML = "";

  filtrosActivos.forEach(valor => {

    const tag =
      document.createElement("div");

    tag.className =
      "filtroActivo";

    tag.innerHTML =
      valor + " ✕";

    tag.onclick = () => {

      filtrosActivos.delete(valor);

      aplicarFiltros();

      actualizarFiltrosActivos();

      const boton =
        document.querySelector(
          `.filtroTag[data-valor="${valor}"]`
        );

      if(boton){

        boton.classList.remove("activo");

      }

    };

    lista.appendChild(tag);

  });

  document.getElementById(
  "limpiarFiltros"
).style.display =

  filtrosActivos.size
    ? "block"
    : "none";

panel.style.display =

  filtrosActivos.size
    ? "block"
    : "none";

}


// ================= PANEL =================

function mostrarLugar(lugar) {

  // Un marcador siempre revela la ficha, incluso si la secciÃ³n o la
  // barra superior mÃ³vil estaban plegadas.
  desplegarFichaLugar();

  document.getElementById("nombre").innerText = "";

  let cabecera = "";
  let contenido = "";

  if(lugar.imagen){

    cabecera += `
      <img
        src="${lugar.imagen}"
        class="info-imagen"
        id="imagenLugar"
      >
    `;

  }

  cabecera += `
    <div class="tituloLugar">
      ${lugar.nombre || ""}
    </div>
  `;

  contenido += `
    <div class="textoDescripcion">
      ${(lugar.descripcion || "").replace(/\n/g,"<br>")}
    </div>
  `;

  if(lugar.vegetacion?.length){

    contenido +=
      `<div class="label">VEGETACIÓN</div><br>`
      + lugar.vegetacion.join(", ")
      + "<br>";

  }

  if(lugar.monstruos?.length){

    contenido +=
      `<div class="label">MONSTRUOS</div><br>`
      + lugar.monstruos.join(", ")
      + "<br>";

  }

  if(lugar.minerales?.length){

    contenido +=
      `<div class="label">MINERALES</div><br>`
      + lugar.minerales
        .map(m => typeof m === "string" ? m : m.nombre)
        .join(", ")
      + "<br>";

  }

  if(lugar.comida?.length){

    contenido +=
      `<div class="label">COMIDA</div><br>`
      + lugar.comida.join(", ");

  }

  document.getElementById("descripcion").innerHTML = `
    <div id="fichaCabecera">
      ${cabecera}
    </div>

    <div id="fichaContenido">
      ${contenido}
    </div>
  `;

  const imagen = document.getElementById("imagenLugar");

  if(imagen){

    imagen.onclick = () => {

      const popup = document.createElement("div");

      popup.className = "imagen-popup";

      popup.innerHTML = `
        <img
          src="${lugar.imagen}"
          class="imagen-popup-img"
        >
      `;

      popup.onclick = () => {

        popup.remove();

      };

      document.body.appendChild(popup);

    };

  }

}
// ================= LEYENDA =================
const cabeceraLeyenda =
  document.getElementById("leyendaCabecera");

const contenidoLeyenda =
  document.getElementById("leyendaContenido");

const flechaVolver =
  document.getElementById("volverInicio");

if(cabeceraLeyenda && contenidoLeyenda){

  contenidoLeyenda.style.display = "none";

  cabeceraLeyenda.addEventListener("click", () => {

    const visible =
      getComputedStyle(contenidoLeyenda).display !== "none";

    contenidoLeyenda.style.display =
      visible ? "none" : "block";

    flechaVolver.classList.toggle(
      "leyendaAbierta",
      !visible
    );

  });

}
};

const mapaNombres =
document.getElementById("mapaNombres");

const btnNombres =
document.getElementById("toggleNombres");

let nombresVisibles = true;

btnNombres.classList.add("activo");

btnNombres.onclick = () => {

  nombresVisibles = !nombresVisibles;

  mapaNombres.style.display =
    nombresVisibles
    ? "block"
    : "none";

  btnNombres.classList.toggle(
    "activo",
    nombresVisibles
  );

};
