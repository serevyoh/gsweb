const ADMIN = true;

let eraActual = "actual";
let coleccionActual = "general";
let eventosGlobales = [];
let eventoEditando = null;
const timeline = document.getElementById("timeline");
const marcasTiempo =
    document.getElementById("marcas-tiempo");

const eras = {

    antigua: {
        inicio: 0,
        fin: 1738
    },

    clasica: {
        inicio: 370,
        fin: 1142
    },

    actual: {
        inicio: 1142,
        fin: 1150
    }

};
/* Píxeles por año en el eje horizontal.
   Todo el posicionado (inicio, fin, ancho) sale de esta
   misma escala, para que dos eventos que coinciden en el
   tiempo coincidan también en pantalla. */
const PIXELES_POR_ANIO = 6;
const MARGEN_INICIAL = 350;
const ANCHO_MINIMO_TARJETA = 220;

let minAnioActual = 0;

function obtenerX(anio) {
    return (
        MARGEN_INICIAL +
        (anio - minAnioActual) * PIXELES_POR_ANIO
    );
}

/* Ancho visual de la tarjeta. Si el evento tiene rango
   (inicio-fin), el ancho es la distancia real en la escala
   entre esos dos años, con un mínimo legible. */
function calcularAncho(evento) {

    if (
        evento.fin &&
        evento.fin !== evento.inicio
    ) {
        return Math.max(
            ANCHO_MINIMO_TARJETA,
            (evento.fin - evento.inicio) * PIXELES_POR_ANIO
        );
    }

    return ANCHO_MINIMO_TARJETA;
}

function generarPosiciones(eventos) {

    const posiciones = {};

    eventos.forEach(evento => {
        posiciones[evento.id] =
            obtenerX(evento.inicio);
    });

    return posiciones;
}

/* ==========================   SCROLL HORIZONTAL CON RUEDA ========================== */
const timelineWrapper =
    document.querySelector(".timeline-wrapper");
const navIndicador =
    document.getElementById("nav-indicador");

fetch("eventos.json")
    .then(r => r.json())
    .then(eventos => {

        eventosGlobales = eventos;

        if (ADMIN){

            const barra =
                document.getElementById("admin-toolbar");

            barra.style.display = "block";

            barra.innerHTML = `
                <button id="nuevo-evento">
                    + Nuevo evento
                </button>
            `;

        }

        renderizarTimeline();

    });

document.addEventListener(
    "click",
    (e)=>{

        if(e.target.id==="nuevo-evento"){

            document
            .getElementById("editor-evento")
            .classList
            .add("abierto");

        }

    }
);

document
.getElementById("cerrar-editor")
.addEventListener(
    "click",
    ()=>{

        document
        .getElementById("editor-evento")
        .classList
        .remove("abierto");

    }
);

function mostrarDetalle(evento) {

    const panel =
        document.getElementById("detalle-evento");
    
    eventoEditando = evento;

    panel.classList.remove("oculto");
    const panelAdmin =
    document.getElementById("admin-detalle");

if (ADMIN){

    panelAdmin.style.display = "flex";

}else{

    panelAdmin.style.display = "none";

}

    const imagenDetalle =
    panel.querySelector(
        ".detalle-imagen"
    );

imagenDetalle.style.backgroundImage =
    `url('${evento.imagen}')`;

imagenDetalle.style.backgroundPosition =
    `${evento.imagenPosX || "50%"}
     ${evento.imagenPosY || "50%"}`;

    panel.querySelector(".detalle-anio")
        .textContent =
            `${evento.inicio}`;

    panel.querySelector("h2")
        .textContent =
            evento.titulo;

    panel.querySelector(".detalle-descripcion")
    .innerHTML =
        evento.descripcion;
        const botonLeer =
    panel.querySelector("#leer-mas");

if (
    evento.textoCompleto ||
    evento.textoArchivo
) {

    botonLeer.classList.remove(
        "oculto"
    );

} else {

    botonLeer.classList.add(
        "oculto"
    );
}

botonLeer.onclick = () => {

    document
        .getElementById(
            "popup-relato"
        )
        .classList.remove(
            "oculto"
        );

    document
        .querySelector(
            ".popup-anio"
        )
        .textContent =
            evento.inicio;

    document
        .querySelector(
            ".popup-titulo"
        )
        .textContent =
            evento.titulo;

    if (evento.textoArchivo) {

        fetch(evento.textoArchivo)
            .then(r => r.text())
            .then(html => {

                document
                    .querySelector(
                        ".popup-texto"
                    )
                    .innerHTML = html;

            });

    } else {

        document
            .querySelector(
                ".popup-texto"
            )
            .innerHTML =
                evento.textoCompleto || "";

    }

};

const reinos =
    panel.querySelector(".detalle-reinos");
const personajes =
    panel.querySelector(".detalle-personajes");
const bloqueReinos =
    panel.querySelector(".bloque-reinos");
const bloquePersonajes =
    panel.querySelector(".bloque-personajes");
const metaLugares =
    panel.querySelector(".meta-lugares");

const metaConsecuencias =
    panel.querySelector(".meta-consecuencias");

const metaTipo =
    panel.querySelector(".meta-tipo");

const metaDuracion =
    panel.querySelector(".meta-duracion");

const bloqueTipo =
    metaTipo.closest(".meta-item");

const bloqueDuracion =
    metaDuracion.closest(".meta-item");

const bloqueLugares =
    metaLugares.closest(".meta-item");

const bloqueConsecuencias =
    metaConsecuencias.closest(".meta-item");
const bloqueConsecuenciasDestacadas =
    panel.querySelector(
        ".detalle-consecuencias-destacadas"
    );
const listaConsecuenciasDestacadas =
    panel.querySelector(
        ".consecuencias-destacadas-lista"
    );

if (evento.tipo) {

    metaTipo.textContent =
        evento.tipo;

    bloqueTipo.style.display =
        "block";

} else {

    bloqueTipo.style.display =
        "none";

}

if (
    evento.inicio
) {

    metaDuracion.textContent =
        `${evento.inicio}${
            evento.fin !== evento.inicio
            ? " - " + evento.fin
            : ""
        }`;

    bloqueDuracion.style.display =
        "block";

} else {

    bloqueDuracion.style.display =
        "none";

}

metaLugares.innerHTML = "";
metaConsecuencias.innerHTML = "";
listaConsecuenciasDestacadas
    .innerHTML = "";
personajes.innerHTML = "";
reinos.innerHTML = "";

const cantidadPersonajes =
    evento.personajes?.length || 0;

let tamAvatar = 42;

if (cantidadPersonajes >= 4)
    tamAvatar = 36;

if (cantidadPersonajes >= 6)
    tamAvatar = 32;

if (cantidadPersonajes >= 8)
    tamAvatar = 28;

evento.personajes?.forEach(personaje => {

    let nombre = personaje;
    let imagen = "";

    if (typeof personaje === "object") {
        nombre = personaje.nombre;
        imagen = personaje.imagen || "";
    }

    personajes.innerHTML += `
        <div
        class="personaje-card"
        data-nombre="${nombre}"
        data-imagen="${imagen}"
        style="width:${tamAvatar + 16}px;">

            <div
                class="personaje-avatar"
                style="
                    background-image:url('${imagen}');
                    width:${tamAvatar}px;
                    height:${tamAvatar}px;
                ">
            </div>

            <div class="personaje-nombre">
                ${nombre}
            </div>

        </div>
    `;
});

personajes
.querySelectorAll(".personaje-card")
.forEach(card => {

    card.addEventListener("click", () => {

        document
            .getElementById("popup-personaje")
            .classList.remove("oculto");

        document
            .querySelector(".popup-personaje-imagen")
            .style.backgroundImage =
            `url('${card.dataset.imagen}')`;

        document
            .querySelector(".popup-personaje-nombre")
            .textContent =
            card.dataset.nombre;

    });

});

if (
    !evento.personajes ||
    evento.personajes.length === 0
) {

    bloquePersonajes.style.display = "none";

} else {

    bloquePersonajes.style.display = "block";

}

evento.reinos?.forEach(reino => {

    let nombre = reino;
    let imagen = "";

    if (typeof reino === "object") {
        nombre = reino.nombre;
        imagen = reino.escudo || "";
    }

    reinos.innerHTML += `
        <div class="reino-card">

            <div
                class="reino-escudo"
                style="
                background-image:
                url('${imagen}');
             ">

    ${nombre.charAt(0)}

</div>

            <div class="reino-nombre">
                ${nombre}
            </div>

        </div>
    `;
});
if (
    !evento.reinos ||
    evento.reinos.length === 0
) {

    bloqueReinos.style.display = "none";

} else {

    bloqueReinos.style.display = "block";

}

evento.lugares?.forEach(lugar => {

    metaLugares.innerHTML += `
        <li>${lugar}</li>
    `;

});

if (
    !evento.lugares ||
    evento.lugares.length === 0
) {

    bloqueLugares.style.display =
        "none";

} else {

    bloqueLugares.style.display =
        "block";

}

evento.consecuencias?.forEach(c => {

    metaConsecuencias.innerHTML += `
        <li>${c}</li>
    `;

});

if (
    !evento.consecuencias ||
    evento.consecuencias.length === 0
) {

    bloqueConsecuencias.style.display =
        "none";

} else {

    bloqueConsecuencias.style.display =
        "block";

}
if (
    evento.consecuenciasDestacadas
    &&
    evento.consecuenciasDestacadas.length
) {

    bloqueConsecuenciasDestacadas
        .classList.remove(
            "oculto"
        );

    evento
        .consecuenciasDestacadas
        .forEach(c => {

            listaConsecuenciasDestacadas
                .innerHTML += `

                <div
                    class="consecuencia-destacada">

                    ${c}

                </div>
            `;
        });

} else {

    bloqueConsecuenciasDestacadas
        .classList.add(
            "oculto"
        );
}
}

document
    .getElementById("editar-evento")
    .addEventListener("click", () => {

        if (!eventoEditando)
            return;

        document
            .getElementById("ev-titulo")
            .value = eventoEditando.titulo;

        document
            .getElementById("ev-inicio")
            .value = eventoEditando.inicio;

        document
            .getElementById("ev-fin")
            .value = eventoEditando.fin;

        document
            .getElementById("ev-era")
            .value = eventoEditando.era;

        document
            .getElementById("ev-tipo")
            .value = eventoEditando.tipo;

        document
            .getElementById("ev-color")
            .value = eventoEditando.color;

        document
            .getElementById("editor-evento")
            .classList
            .add("abierto");

    });

/* ==========================   BOTONES DE NAVEGACIÓN   ========================== */
document
    .getElementById("nav-izquierda")
    .addEventListener("click", () => {
        timelineWrapper.scrollLeft -= 400;
    });
document
    .getElementById("nav-derecha")
    .addEventListener("click", () => {
        timelineWrapper.scrollLeft += 400;
    });
/* ==========================   INDICADOR DE POSICIÓN   ========================== */

function actualizarIndicador() {

    const scrollMax =
        timelineWrapper.scrollWidth -
        timelineWrapper.clientWidth;

    const porcentaje =
        timelineWrapper.scrollLeft /
        scrollMax;

    navIndicador.style.left =
        (porcentaje * 100) + "%";
}

timelineWrapper.addEventListener(
    "scroll",
    actualizarIndicador
);

actualizarIndicador();

let arrastrando = false;

navIndicador.addEventListener(
    "mousedown",
    () => arrastrando = true
);

document.addEventListener(
    "mouseup",
    () => arrastrando = false
);

document.addEventListener(
    "mousemove",
    (e) => {

        if (!arrastrando) return;

        const barra =
            document.querySelector(
                ".nav-barra"
            );

        const rect =
            barra.getBoundingClientRect();

        let x =
            e.clientX - rect.left;

        x = Math.max(
            0,
            Math.min(x, rect.width)
        );

        const porcentaje =
            x / rect.width;

        const scrollMax =
            timelineWrapper.scrollWidth -
            timelineWrapper.clientWidth;

        timelineWrapper.scrollLeft =
            porcentaje * scrollMax;
    }
);

document
    .querySelector(".nav-barra")
    .addEventListener(
        "click",
        (e) => {

            const barra =
                e.currentTarget;

            const rect =
                barra.getBoundingClientRect();

            const porcentaje =
                (e.clientX - rect.left)
                / rect.width;

            const scrollMax =
                timelineWrapper.scrollWidth -
                timelineWrapper.clientWidth;

            timelineWrapper.scrollLeft =
                porcentaje * scrollMax;
        }
    );

    document
    .getElementById("cerrar-detalle")
    .addEventListener("click", () => {

        document
            .getElementById("detalle-evento")
            .classList.add("oculto");

        document
            .querySelectorAll(".evento")
            .forEach(e =>
                e.classList.remove("activo")
            );
    });
    document
.getElementById("cerrar-popup")
.addEventListener(
    "click",
    () => {

        document
        .getElementById("popup-relato")
        .classList.add("oculto");

    }
);

document
.getElementById("cerrar-popup-personaje")
.addEventListener(
    "click",
    () => {

        document
        .getElementById("popup-personaje")
        .classList.add("oculto");

    }
);

document
.querySelector("#popup-personaje .popup-fondo")
.addEventListener(
    "click",
    () => {

        document
        .getElementById("popup-personaje")
        .classList.add("oculto");

    }
);

document
.querySelectorAll(".era-btn")
.forEach(btn => {

    btn.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(
                    ".era-btn"
                )
                .forEach(b =>
                    b.classList.remove(
                        "activo"
                    )
                );

            btn.classList.add(
                "activo"
            );

            eraActual =
                btn.dataset.era;

            renderizarTimeline();

            document
                .getElementById(
                    "detalle-evento"
                )
                .classList.add(
                    "oculto"
                );

        }
    );

});

function renderizarTimeline() {

    timeline.innerHTML = "";
    marcasTiempo.innerHTML = "";
    const eventos =
eventosGlobales
    .filter(
        e =>
            e.era === eraActual &&
            e.colecciones.includes(coleccionActual)
    )
    .sort(
        (a, b) => {

            if (eraActual === "antigua") {
                return b.inicio - a.inicio;
            }

            return a.inicio - b.inicio;
        }
    );

    const minAnio =
    Math.min(
        ...eventos.map(
            e => e.inicio
        )
    );

const maxAnio =
    Math.max(
        ...eventos.map(
            e => e.fin || e.inicio
        )
    );

/* IMPORTANTE: minAnioActual tiene que fijarse ANTES de
   generar las posiciones, porque obtenerX() lo usa para
   calcular la escala. */
minAnioActual = minAnio;

console.log(
    "Rango:",
    minAnio,
    maxAnio
);

    const posiciones =
    generarPosiciones(eventos);

    const timelineScroll =
    document.querySelector(
        ".timeline-scroll"
    );

    let maxX = 0;

eventos.forEach(evento => {

    const x =
        posiciones[evento.id];

    const ancho =
        calcularAncho(evento);

    maxX = Math.max(
        maxX,
        x + ancho
    );

});

timelineScroll.style.width =
    (maxX + 250) + "px";
document.querySelector(".timeline-line")
    .style.width =
    (maxX + 250) + "px";
    const aniosMostrados = new Set();
const filas = [];
    eventos.forEach((evento, i) => {

    console.log("Procesando:", evento.titulo);

        const div = document.createElement("div");
        div.classList.add("evento");

const ancho =
    calcularAncho(evento);

/* posiciones[evento.id] ya es la coordenada real del año
   de inicio en la escala, así que es directamente el
   borde izquierdo de la tarjeta — no hace falta corregirla. */
const left = posiciones[evento.id];

div.style.left = left + "px";

console.log(
    evento.titulo,
    evento.inicio,
    posiciones[evento.id]
);

let nivel = 0;

while (true) {

    if (!filas[nivel]) {
        filas[nivel] = [];
        break;
    }

    const haySolapamiento = filas[nivel].some(e => {

        const finA = evento.fin || evento.inicio;
        const finB = e.fin || e.inicio;

        return (
            evento.inicio <= finB &&
            e.inicio <= finA
        );

    });

    if (!haySolapamiento)
        break;

    nivel++;

}

const topEvento = 180 - nivel * 60;

        console.log(
    evento.titulo,
    "nivel:",
    nivel,
    "top:",
    topEvento
);

        div.style.top =
            topEvento + "px";

        filas[nivel].push(evento);

        div.style.width =
            ancho + "px";

const finVisual = left + ancho;

const centroX =
    (left + finVisual) / 2;

        if (!aniosMostrados.has(evento.inicio)) {

    aniosMostrados.add(evento.inicio);

    const marca =
        document.createElement("div");

    marca.classList.add(
        "marca-tiempo"
    );

    marca.style.left =
        centroX + "px";

    marca.innerHTML = `
        <div class="anio">
            ${evento.inicio}
        </div>
    `;

    marcasTiempo.appendChild(
        marca
    );
}

        div.style.backgroundImage =
            `url('${evento.imagen}')`;
        div.style.backgroundPosition =
            `${evento.cardPosX || "50%"}
            ${evento.cardPosY || "50%"}`;

        div.innerHTML = `
            <div class="evento-overlay"
                 style="background:${evento.color}">
            </div>

            <div class="evento-contenido">

                <div class="evento-anio">
                    ${evento.fin && evento.fin !== evento.inicio
                    ? evento.inicio + " - " + evento.fin
                    : evento.inicio
                    }
                </div>

                <div class="evento-titulo">
                    ${evento.titulo}
                </div>

            </div>
        `;

        div.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".evento")
                    .forEach(e =>
                        e.classList.remove(
                            "activo"
                        )
                    );

                div.classList.add(
                    "activo"
                );

                mostrarDetalle(evento);
                console.log(evento.personajes);
console.log(evento.reinos);
console.log(evento.lugares);
console.log(evento.consecuencias);

            }
        );

        const punto =
            document.createElement(
                "div"
            );

        punto.classList.add(
            "punto"
        );

        punto.style.left =
            (centroX - 7) + "px";

        punto.style.top =
            "245px";

        timeline.appendChild(
            punto
        );

        const conector =
            document.createElement(
                "div"
            );

        conector.classList.add(
            "conector"
        );

        conector.style.left =
            centroX + "px";

        conector.style.top =
            (topEvento + 48)
            + "px";

        conector.style.height =
            (257 - topEvento - 48)
            + "px";

        timeline.appendChild(
            conector
        );

        timeline.appendChild(
            div
        );

    });
}
/* ========================================
   DRAG SCROLL TIMELINE
======================================== */

let isDragging = false;
let startX = 0;
let scrollInicial = 0;

timelineWrapper.addEventListener(
    "mousedown",
    (e) => {

        if (e.target.closest(".evento"))
            return;

        isDragging = true;

        startX = e.pageX;

        scrollInicial =
            timelineWrapper.scrollLeft;

        timelineWrapper.classList.add(
            "dragging"
        );
    }
);

document.addEventListener(
    "mouseup",
    () => {

        isDragging = false;

        timelineWrapper.classList.remove(
            "dragging"
        );
    }
);

document.addEventListener(
    "mousemove",
    (e) => {

        if (!isDragging)
            return;

        e.preventDefault();

        const distancia =
            e.pageX - startX;

        timelineWrapper.scrollLeft =
            scrollInicial - distancia;
    }
);

/* ========================================
   CRONOLOGÍAS
======================================== */

const botonGeneral =
document.getElementById("toggle-general");

const erasGeneral =
document.getElementById("eras-general");

const tituloCronologia =
document.getElementById("titulo-cronologia");

const botonesCasa =
document.querySelectorAll(".casa-btn");

let casaActiva = null;
let cronologiaGeneralAbierta = true;

botonGeneral.addEventListener(
    "click",
    ()=>{

        casaActiva = null;
        coleccionActual = "general";

        renderizarTimeline();

        cronologiaGeneralAbierta =
            !cronologiaGeneralAbierta;

        erasGeneral.classList.toggle(
            "oculto",
            !cronologiaGeneralAbierta
        );

        document
            .getElementById("flecha-cronologia")
            .classList.toggle(
                "abierta",
                !cronologiaGeneralAbierta
            );

        botonesCasa.forEach(b=>{

            b.classList.remove(
                "activa"
            );

        });

    }
);

/* ========================================
   ACORDEONES DEL EDITOR
======================================== */

const acordeonesEditor =
document.querySelectorAll(".editor-acordeon");

console.log(
    "Acordeones encontrados:",
    acordeonesEditor.length
);

acordeonesEditor.forEach(acordeon=>{

    acordeon.addEventListener("click",()=>{

        console.log(
            "CLICK:",
            acordeon.textContent.trim()
        );

        const contenido =
            acordeon.nextElementSibling;

        if(!contenido){

            console.log(
                "No tiene contenido"
            );

            return;

        }

const abierto =
    contenido.classList.contains("abierto");

document
.querySelectorAll(".editor-contenido")
.forEach(c=>{

    c.classList.remove("abierto");
    c.classList.add("oculto");

});

document
.querySelectorAll(".editor-acordeon")
.forEach(a=>{

    a.classList.remove("abierto");

});

if(!abierto){

contenido.classList.remove("oculto");
contenido.classList.add("abierto");

acordeon.classList.add("abierto");

}

    });

});

botonesCasa.forEach(boton=>{

    boton.addEventListener(
        "click",
        ()=>{

            botonesCasa.forEach(b=>{

                b.classList.remove(
                    "activa"
                );

            });

            boton.classList.add(
                "activa"
            );

            casaActiva =
                boton.dataset.casa;
            coleccionActual =
                boton.dataset.casa;

            renderizarTimeline();

            erasGeneral.classList.add(
                "oculto"
            );

            cronologiaGeneralAbierta = false;

            document
            .getElementById("flecha-cronologia")
            .classList.add("abierta");

        }
    );

});

/* ========================================
   ORIGEN DE LA IMAGEN
======================================== */

const origenImagen =
document.getElementById(
    "origen-imagen"
);

const bloqueProyecto =
document.getElementById(
    "imagen-proyecto"
);

const bloqueURL =
document.getElementById(
    "imagen-url"
);

const bloqueSubida =
document.getElementById(
    "imagen-subida"
);

function actualizarOrigenImagen(){

    bloqueProyecto.classList.add(
        "oculto"
    );

    bloqueURL.classList.add(
        "oculto"
    );

    bloqueSubida.classList.add(
        "oculto"
    );

    if(
        origenImagen.value==="proyecto"
    ){

        bloqueProyecto.classList.remove(
            "oculto"
        );

    }

    if(
        origenImagen.value==="url"
    ){

        bloqueURL.classList.remove(
            "oculto"
        );

    }

    if(
        origenImagen.value==="subida"
    ){

        bloqueSubida.classList.remove(
            "oculto"
        );

    }

}

origenImagen.addEventListener(
    "change",
    actualizarOrigenImagen
);

actualizarOrigenImagen();

/* ========================================
   DRAG PREVIEW PANEL
======================================== */

const dragPreviewPanel =
document.querySelector(".preview-panel");

const dragPreviewImagen =
document.querySelector(".preview-panel-imagen");

let arrastrandoPreview = false;

let inicioX = 0;
let inicioY = 0;

let posX = 50;
let posY = 50;

dragPreviewPanel.addEventListener(
    "mousedown",
    (e)=>{

        arrastrandoPreview = true;

        inicioX = e.clientX;
        inicioY = e.clientY;

    }
);

document.addEventListener(
    "mouseup",
    ()=>{

        arrastrandoPreview = false;

    }
);

document.addEventListener(
    "mousemove",
    (e)=>{

        if(!arrastrandoPreview)
            return;

        const dx =
            e.clientX - inicioX;

        const dy =
            e.clientY - inicioY;

        inicioX = e.clientX;
        inicioY = e.clientY;

        posX += dx * 0.25;
        posY -= dy * 0.25;

dragPreviewImagen.style.backgroundPosition =
    `${posX}% ${posY}%`;

    }
);

/* ========================================
   EDITOR · REINOS
======================================== */

const reinosSeleccionados = [];

document
.querySelectorAll(".editor-reino")
.forEach(boton=>{

    boton.addEventListener(
        "click",
        ()=>{

            const reino =
                boton.dataset.reino;

            if(
                reinosSeleccionados.includes(reino)
            ){

                const indice =
                    reinosSeleccionados.indexOf(reino);

                reinosSeleccionados.splice(
                    indice,
                    1
                );

                boton.classList.remove(
                    "activo"
                );

            }else{

                reinosSeleccionados.push(
                    reino
                );

                boton.classList.add(
                    "activo"
                );

            }

            console.log(
                reinosSeleccionados
            );

        }
    );

});

/* ========================================
   EDITORES QUILL
======================================== */

const editorDescripcion = new Quill(
    "#editor-descripcion",
    {
        theme: "snow",
        placeholder: "Escribe una descripción breve del evento...",
        modules: {
            toolbar: [
                ["bold", "italic", "underline"],
                [{ list: "bullet" }, { list: "ordered" }],
                ["blockquote"],
                ["link"],
                ["clean"]
            ]
        }
    }
);

const editorContinuacion = new Quill(
    "#editor-continuacion",
    {
        theme: "snow",
        placeholder: "Escribe aquí el relato completo...",
        modules: {
            toolbar: [
                ["bold", "italic", "underline"],
                [{ list: "bullet" }, { list: "ordered" }],
                ["blockquote"],
                ["link"],
                ["image"],
                ["clean"]
            ]
        }
    }
);

/* ========================================
   BOTÓN GUARDAR
======================================== */

document
    .querySelector(".editor-guardar")
    .addEventListener("click", () => {

        const esNuevo = !eventoEditando;

        const evento = eventoEditando || {};

        evento.titulo =
            document.getElementById("ev-titulo").value;

        evento.inicio =
            Number(document.getElementById("ev-inicio").value);

        evento.fin =
            Number(document.getElementById("ev-fin").value);

        evento.era =
            document.getElementById("ev-era").value;

        evento.tipo =
            document.getElementById("ev-tipo").value;

        evento.color =
            document.getElementById("ev-color").value;

        if (esNuevo) {

            evento.id = Date.now();

            evento.colecciones = ["general"];
            evento.imagen = "";
            evento.descripcion = "";
            evento.textoCompleto = "";
            evento.lugares = [];
            evento.reinos = [];
            evento.personajes = [];
            evento.consecuencias = [];
            evento.consecuenciasDestacadas = [];

            eventosGlobales.push(evento);

        }

        eventoEditando = null;

        renderizarTimeline();

        document
            .getElementById("editor-evento")
            .classList
            .remove("abierto");

    });