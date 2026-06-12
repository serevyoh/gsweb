window.onload = async function() {

let lugares = [];
let territorios = {};

  await cargarDatos();

  const container = document.getElementById("mapa-container");
  const inner = document.getElementById("mapa-inner");
  const mapaImg = document.getElementById("mapa");
  const gridOverlay =
  document.getElementById("gridOverlay");

// ================= DATOS JSON =================

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
    nombre: "Bosque",
    clase: "fab fa-pagelines",
    tamaño: "12px"
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

      document
      .getElementById("toggleCasasPolitica")
      .onclick = () => {

        mapaAlt = !mapaAlt;

        mapaImg.src = mapaAlt
          ? "https://i.imgur.com/JDwDzay.jpeg"
          : "https://i.imgur.com/Mr40FCw.jpeg";

      };

      document
      .getElementById("toggleGridPolitica")
      .onclick = () => {

        gridVisible = !gridVisible;

        gridOverlay.style.display =
          gridVisible
          ? "grid"
          : "none";

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
      class="filtroTag"
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

    }
  );

});

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

      const copia = {...lugar};

      delete copia._el;

      return copia;

    }),

    territorios

  };

  const json =
    JSON.stringify(exportable, null, 2);

  const blob =
    new Blob([json], {
      type: "application/json"
    });

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
    inner.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  }

  // ================= ZOOM =================

  container.onwheel = (e) => {
    e.preventDefault();
    scale += (e.deltaY < 0 ? 0.1 : -0.1);
    if (scale < 0.5) scale = 0.5;
    updateTransform();
  };

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
  
lugares.forEach(lugar => {
  crearMarcador(lugar);
});
  
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
              seleccion.includes(item)
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
      ...(lugar.minerales || []),
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

  // ================= PANEL =================

function mostrarLugar(lugar) {

  document.getElementById("nombre").innerText = "";

  let html = "";

if(lugar.imagen){

  html += `
    <img
      src="${lugar.imagen}"
      class="info-imagen"
      id="imagenLugar"
    >
  `;

}

  html += `
    <div class="tituloLugar">
      ${lugar.nombre || ""}
    </div>
  `;

  html +=
    (lugar.descripcion || "")
    + "<br><br>";

  if(lugar.vegetacion?.length){

    html +=
      `<div class="label">VEGETACIÓN</div><br>`
      + lugar.vegetacion.join(", ")
      + "<br>";

  }

  if(lugar.monstruos?.length){

    html +=
      `<div class="label">MONSTRUOS</div><br>`
      + lugar.monstruos.join(", ")
      + "<br>";

  }

  if(lugar.minerales?.length){

    html +=
      `<div class="label">MINERALES</div><br>`
      + lugar.minerales.join(", ")
      + "<br>";

  }

  if(lugar.comida?.length){

    html +=
      `<div class="label">COMIDA</div><br>`
      + lugar.comida.join(", ");

  }

document.getElementById(
  "descripcion"
).innerHTML = html;

const imagen =
document.getElementById(
  "imagenLugar"
);

if(imagen){

  imagen.onclick = () => {

    const popup =
      document.createElement("div");

    popup.className =
      "imagen-popup";

    popup.innerHTML = `

      <img
        src="${lugar.imagen}"
        class="imagen-popup-img"
      >

    `;

    popup.onclick = () => {

      popup.remove();

    };

    document.body.appendChild(
      popup
    );

  };

}

}

};
