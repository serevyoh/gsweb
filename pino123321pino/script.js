const ADMIN = true;

let eraActual = "actual";
let coleccionActual = "general";
let eventosGlobales = [];
let eventoEditando = null;
const timeline = document.getElementById("timeline");
const marcasTiempo =
    document.getElementById("marcas-tiempo");

/* Genera un id que no choque con ninguno ya existente. Un
   simple Date.now() podría repetirse si se guardan dos
   eventos en el mismo milisegundo, o si se importa un JSON
   con ids que coinciden con los de eventos nuevos creados
   después. */
function generarIdUnico() {

    let id = Date.now();

    while (eventosGlobales.some(e => e.id === id)) {
        id++;
    }

    return id;

}

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
/* Píxeles por año "real" cuando dos años consecutivos SÍ
   tienen eventos cerca. HUECO_MINIMO evita que dos eventos
   muy próximos en el tiempo queden pegados; HUECO_MAXIMO
   evita que un salto de siglos sin ningún evento obligue a
   hacer scroll kilométrico. */
const PIXELES_POR_ANIO = 4;
const MARGEN_INICIAL = 350;
const ANCHO_MINIMO_TARJETA = 220;
const HUECO_MINIMO_ENTRE_ANCLAS = 180;
const HUECO_MAXIMO_ENTRE_ANCLAS = 500;
const MARGEN_ENTRE_PUNTUALES = 24;

/* Mapa año -> posición X, reconstruido en cada render a
   partir de los eventos que hay en pantalla en ese momento. */
let mapaAnclas = {};

/* Construye la escala usando solo los años que aparecen de
   verdad en los datos (el inicio y el fin de cada evento).
   La distancia entre dos años "ancla" consecutivos es
   proporcional a su diferencia real, pero recortada entre un
   mínimo y un máximo. Como se recalcula en cada render, la
   escala se reorganiza sola según se añaden o quitan eventos.

   direccion = 1 para cronologías normales (los años crecen
   hacia la derecha), -1 para cronologías "a la inversa" como
   Historia Antigua (los años decrecen hacia la derecha, como
   una cuenta atrás hacia el año 0). */
function construirEscala(eventos, direccion) {

    const anclas = new Set();

    eventos.forEach(evento => {
        anclas.add(evento.inicio);
        anclas.add(
            evento.fin || evento.inicio
        );
    });

    const anclasOrdenadas =
        [...anclas].sort(
            (a, b) => (a - b) * direccion
        );

    const mapa = {};

    let x = MARGEN_INICIAL;

    anclasOrdenadas.forEach((anio, i) => {

        if (i === 0) {
            mapa[anio] = x;
            return;
        }

        const anterior =
            anclasOrdenadas[i - 1];

        const diferencia =
            Math.abs(anio - anterior);

        const hueco =
            Math.min(
                HUECO_MAXIMO_ENTRE_ANCLAS,
                Math.max(
                    HUECO_MINIMO_ENTRE_ANCLAS,
                    diferencia * PIXELES_POR_ANIO
                )
            );

        x += hueco;

        mapa[anio] = x;

    });

    return mapa;

}

function obtenerX(anio) {
    return mapaAnclas[anio];
}

/* Ancho visual de la tarjeta: la distancia real en la escala
   entre su año de inicio y su año de fin, con un mínimo
   legible para que ningún evento salga demasiado estrecho. */
function calcularAncho(evento) {

    const x1 = obtenerX(evento.inicio);
    const x2 = obtenerX(
        evento.fin || evento.inicio
    );

    return Math.max(
        ANCHO_MINIMO_TARJETA,
        Math.abs(x2 - x1)
    );

}

/* Borde izquierdo de la tarjeta. Se calcula con el mínimo de
   los dos extremos en vez de asumir que "inicio" siempre cae
   a la izquierda, para que funcione igual en cronologías
   invertidas como Historia Antigua. */
function calcularLeft(evento) {

    const x1 = obtenerX(evento.inicio);
    const x2 = obtenerX(
        evento.fin || evento.inicio
    );

    return Math.min(x1, x2);

}

function esPuntual(evento) {
    return (
        !evento.fin ||
        evento.fin === evento.inicio
    );
}


/* ==========================   SCROLL HORIZONTAL CON RUEDA ========================== */
const timelineWrapper =
    document.querySelector(".timeline-wrapper");

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

            eventoEditando = null;

            limpiarFormularioEditor();

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
    textoTieneContenido(evento.textoCompleto) ||
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

        rellenarFormularioEditor(eventoEditando);

        document
            .getElementById("editor-evento")
            .classList
            .add("abierto");

    });

document
    .getElementById("eliminar-evento")
    .addEventListener("click", () => {

        if (!eventoEditando)
            return;

        const confirmado = confirm(
            `¿Eliminar "${eventoEditando.titulo}"? Esta acción no se puede deshacer.`
        );

        if (!confirmado)
            return;

        eventosGlobales =
            eventosGlobales.filter(
                e => e.id !== eventoEditando.id
            );

        eventoEditando = null;

        document
            .getElementById("detalle-evento")
            .classList.add("oculto");

        renderizarTimeline();

    });

/* ========================================
   MINIMAPA
======================================== */

function actualizarViewport() {

    const viewport =
        document.getElementById("minimap-viewport");

    const clone =
        document.getElementById("minimap-clone");

    const overlayIzq =
        document.getElementById("minimap-overlay-izq");

    const overlayDch =
        document.getElementById("minimap-overlay-dch");

    if (!viewport || !clone) return;

    const scrollMax =
        timelineWrapper.scrollWidth -
        timelineWrapper.clientWidth;

    const minimapEl =
        document.getElementById("timeline-minimap");

    const minimapWidth =
        minimapEl ? minimapEl.clientWidth : 1000;

    const scroll =
        document.querySelector(".timeline-scroll");

    const timelineWidth =
        scroll
            ? Math.max(scroll.scrollWidth || 4000, 4000)
            : Math.max(timelineWrapper.scrollWidth, 4000);

    const factor =
        minimapWidth / timelineWidth;

    if (scrollMax <= 0) {

        const vpWidth =
            minimapWidth;

        viewport.style.width = vpWidth + "px";
        viewport.style.left = "0px";

        if (overlayIzq) overlayIzq.style.width = "0px";
        if (overlayDch) overlayDch.style.width = "0px";

        return;

    }

    const vpWidth =
        timelineWrapper.clientWidth * factor;

    const vpLeft =
        timelineWrapper.scrollLeft * factor;

    viewport.style.width = vpWidth + "px";
    viewport.style.left = vpLeft + "px";

    if (overlayIzq) {
        overlayIzq.style.left = "0px";
        overlayIzq.style.width = vpLeft + "px";
    }

    if (overlayDch) {
        const dchStart = vpLeft + vpWidth;
        overlayDch.style.left = dchStart + "px";
        overlayDch.style.width =
            (minimapWidth - dchStart) + "px";
    }

}

function reconstruirMinimapa() {

    const contenedor =
        document.getElementById("timeline-minimap");

    const clone =
        document.getElementById("minimap-clone");

    if (!contenedor || !clone) return;

    const scroll =
        document.querySelector(".timeline-scroll");

    if (!scroll) return;

    clone.replaceChildren();

    const clon =
        scroll.cloneNode(true);

    clon.removeAttribute("id");

    clone.appendChild(clon);

    const minimapWidth =
        contenedor.clientWidth;

    const scrollMax =
        timelineWrapper.scrollWidth -
        timelineWrapper.clientWidth;

    const referenceWidth =
        Math.max(scroll.scrollWidth || 4000, 4000);

    const factor =
        minimapWidth / referenceWidth;

    clon.style.transform = "";

    clon.style.width = referenceWidth + "px";
    clon.style.height = "460px";

    contenedor.style.height = "60px";

    clone.style.transform =
        "scale(" + factor + ")";

    clone.style.height =
        (460 * factor) + "px";

    clone.style.width = referenceWidth + "px";

    clone.style.top =
        (30 - 160 * factor) + "px";

    if (scrollMax <= 0) {

        let minLeft = Infinity;
        let maxRight = -Infinity;

        clon.querySelectorAll(".evento").forEach(ev => {

            const l =
                parseFloat(ev.style.left) || 0;

            const w =
                parseFloat(ev.style.width) || 200;

            if (l < minLeft) minLeft = l;
            if (l + w > maxRight) maxRight = l + w;

        });

        if (minLeft < Infinity && maxRight > minLeft) {

            const contentCenter =
                (minLeft + maxRight) / 2;

            const shift =
                referenceWidth / 2 - contentCenter;

            clon.style.transform =
                "translateX(" + shift + "px)";

        }

        clone.style.left = "0px";

    } else {

        clone.style.left = "0px";

    }

    clone.style.pointerEvents = "none";

    clon.style.pointerEvents = "none";

    clone
        .querySelectorAll(
            ".evento, .punto, .conector"
        )
        .forEach(el => {

            el.style.pointerEvents = "none";

        });

    actualizarViewport();

}

const contenedorMinimapa =
    document.getElementById("timeline-minimap");

if (contenedorMinimapa) {

    contenedorMinimapa.addEventListener(
        "click",
        (e) => {

            const rect =
                contenedorMinimapa
                    .getBoundingClientRect();

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

}

let arrastrandoMinimapa = false;

if (contenedorMinimapa) {

    contenedorMinimapa.addEventListener(
        "mousedown",
        (e) => {

            arrastrandoMinimapa = true;

            const rect =
                contenedorMinimapa
                    .getBoundingClientRect();

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

}

document.addEventListener(
    "mouseup",
    () => arrastrandoMinimapa = false
);

document.addEventListener(
    "mousemove",
    (e) => {

        if (!arrastrandoMinimapa) return;

        const rect =
            contenedorMinimapa
                .getBoundingClientRect();

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

timelineWrapper.addEventListener(
    "scroll",
    actualizarViewport
);

window.addEventListener(
    "resize",
    () => {

        reconstruirMinimapa();
        actualizarViewport();

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
            (e.colecciones || []).includes(coleccionActual)
    )
    .sort(
        (a, b) => {

            if (eraActual === "antigua") {
                return b.inicio - a.inicio;
            }

            return a.inicio - b.inicio;
        }
    );

/* direccion del eje temporal: -1 en Historia Antigua invierte
   la escala para que los años grandes queden a la izquierda
   y el año 0 quede a la derecha (estilo "antes de Cristo"). */
const direccion =
    eraActual === "antigua" ? -1 : 1;

mapaAnclas =
    construirEscala(eventos, direccion);

const timelineScroll =
    document.querySelector(
        ".timeline-scroll"
    );

/* ============================================
   PRECÁLCULO DE POSICIONES Y FILAS
   Se calcula todo en una pasada, en orden cronológico,
   antes de crear ningún elemento del DOM. Así podemos:
   - Subir de fila los eventos que se solapan de verdad
     en pantalla (como antes).
   - Poner EN FILA, uno junto a otro, los eventos
     puntuales que caen muy cerca en el tiempo, en vez de
     amontonarlos unos encima de otros.
   ============================================ */
const filas = [];
const layoutPorId = {};
let maxX = 0;

eventos.forEach(evento => {

    const ancho =
        calcularAncho(evento);

    const puntual =
        esPuntual(evento);

    let left =
        calcularLeft(evento);

    let nivel = 0;

    while (true) {

        if (!filas[nivel])
            filas[nivel] = [];

        const colisiones =
            filas[nivel].filter(colocado =>
                left < colocado.right + MARGEN_ENTRE_PUNTUALES &&
                colocado.left < left + ancho + MARGEN_ENTRE_PUNTUALES
            );

        if (colisiones.length === 0)
            break;

        const soloChocaConPuntuales =
            puntual &&
            colisiones.every(c => c.puntual);

        if (soloChocaConPuntuales) {

            /* En vez de subir de fila, lo empujamos justo a
               la derecha del último con el que choca: así
               los eventos puntuales cercanos en el tiempo
               quedan en fila, ordenados, uno al lado del
               otro, en vez de apilados. */
            left =
                Math.max(
                    ...colisiones.map(c => c.right)
                ) + MARGEN_ENTRE_PUNTUALES;

            continue;

        }

        nivel++;

    }

    filas[nivel].push({
        left,
        right: left + ancho,
        puntual
    });

    layoutPorId[evento.id] = {
        left,
        ancho,
        nivel
    };

    maxX = Math.max(
        maxX,
        left + ancho
    );

});

timelineScroll.style.width =
    (maxX + 250) + "px";
document.querySelector(".timeline-line")
    .style.width =
    (maxX + 250) + "px";
    const aniosMostrados = new Set();
    eventos.forEach((evento, i) => {

        const div = document.createElement("div");
        div.classList.add("evento");
        if (!esPuntual(evento)) {
            div.classList.add("periodo");
        }
        div.dataset.id = evento.id;

const {
    left,
    ancho,
    nivel
} = layoutPorId[evento.id];

div.style.left = left + "px";

const topEvento = 180 - nivel * 60;

        div.style.top =
            topEvento + "px";

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
        (esPuntual(evento)
            ? centroX
            : obtenerX(evento.inicio) + 10)
        + "px";

    marca.innerHTML = `
        <div class="anio">
            ${evento.inicio}
        </div>
    `;

    marcasTiempo.appendChild(
        marca
    );
}

        if (!esPuntual(evento)
            && evento.fin
            && !aniosMostrados.has(evento.fin)) {

    aniosMostrados.add(evento.fin);

    const marcaFin =
        document.createElement("div");

    marcaFin.classList.add(
        "marca-tiempo"
    );

    marcaFin.style.left =
        (obtenerX(evento.fin) - 10)
        + "px";

    marcaFin.innerHTML = `
        <div class="anio">
            ${evento.fin}
        </div>
    `;

    marcasTiempo.appendChild(
        marcaFin
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

                if (div.classList.contains("activo")) {

                    div.classList.remove("activo");

                    document
                        .getElementById("detalle-evento")
                        .classList.add("oculto");

                    return;

                }

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

            }
        );

        const xInicio =
            obtenerX(evento.inicio);

        const xFin =
            obtenerX(
                evento.fin || evento.inicio
            );

        if (!esPuntual(evento)) {

            const margenPunto = 10;

            const xPuntoInicio =
                xInicio + margenPunto;

            const xPuntoFin =
                xFin - margenPunto;

            const puntoInicio =
                document.createElement("div");
            puntoInicio.classList.add("punto");
            puntoInicio.style.left =
                (xPuntoInicio - 7) + "px";
            puntoInicio.style.top = "245px";
            timeline.appendChild(puntoInicio);

            const puntoFin =
                document.createElement("div");
            puntoFin.classList.add("punto");
            puntoFin.style.left =
                (xPuntoFin - 7) + "px";
            puntoFin.style.top = "245px";
            timeline.appendChild(puntoFin);

            const conectorInicio =
                document.createElement("div");
            conectorInicio.classList.add("conector");
            conectorInicio.style.left =
                xPuntoInicio + "px";
            conectorInicio.style.top =
                (topEvento + 48) + "px";
            conectorInicio.style.height =
                (257 - topEvento - 48) + "px";
            timeline.appendChild(conectorInicio);

            const conectorFin =
                document.createElement("div");
            conectorFin.classList.add("conector");
            conectorFin.style.left =
                xPuntoFin + "px";
            conectorFin.style.top =
                (topEvento + 48) + "px";
            conectorFin.style.height =
                (257 - topEvento - 48) + "px";
            timeline.appendChild(conectorFin);

            const marcadorInicio =
                document.createElement("div");
            marcadorInicio.classList.add(
                "marcador-periodo"
            );
            marcadorInicio.style.left =
                (xPuntoInicio - left) + "px";
            div.appendChild(marcadorInicio);

            const marcadorFin =
                document.createElement("div");
            marcadorFin.classList.add(
                "marcador-periodo"
            );
            marcadorFin.style.left =
                (xPuntoFin - left) + "px";
            div.appendChild(marcadorFin);

        } else {

            const punto =
                document.createElement("div");
            punto.classList.add("punto");
            punto.style.left =
                (centroX - 7) + "px";
            punto.style.top = "245px";
            timeline.appendChild(punto);

            const conector =
                document.createElement("div");
            conector.classList.add("conector");
            conector.style.left =
                centroX + "px";
            conector.style.top =
                (topEvento + 48) + "px";
            conector.style.height =
                (257 - topEvento - 48) + "px";
            timeline.appendChild(conector);

        }

        timeline.appendChild(
            div
        );

    });

    const inputBuscadorActivo =
        document.getElementById("buscador");

    if (inputBuscadorActivo) {
        aplicarResaltadoBusqueda(inputBuscadorActivo.value);
    }

    reconstruirMinimapa();

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
   EDITOR · COLECCIONES
======================================== */

document
.querySelectorAll(".coleccion-chip")
.forEach(chip=>{

    chip.addEventListener(
        "click",
        ()=>{

            chip.classList.toggle(
                "activa"
            );

        }
    );

});

/* ========================================
   EDITOR · REINOS
======================================== */

/* En eventos.json los reinos se guardan como objetos
   {nombre, escudo} con el nombre "bonito" (p.ej. "A'Drien"),
   pero los botones del editor usan slugs sencillos
   (p.ej. "adrien"). Esta tabla traduce entre ambos mundos. */
const REINOS = {
    adrien: "A'Drien",
    blavyr: "Blavyr",
    gallarion: "Gallarion",
    kalarch: "Kal'arch",
    rehgis: "Rehgis",
    reshkarch: "Reshk'arch",
    vaelekin: "Vaelekin",
    veanor: "Ve'anor"
};

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
   EDITOR · LISTAS SIMPLES
   (lugares, consecuencias, consecuencias destacadas)
   Las tres funcionan igual: un input + botón "Añadir" que
   mete un texto en un array, y una lista de chips con una
   "×" para quitarlo. crearListaEditable() monta ese
   comportamiento una vez por cada lista y devuelve la
   función de redibujado, para poder llamarla también desde
   rellenarFormularioEditor()/limpiarFormularioEditor().
======================================== */

function crearListaEditable({ idInput, idBoton, idLista, array }) {

    const input = document.getElementById(idInput);
    const boton = document.getElementById(idBoton);
    const lista = document.getElementById(idLista);

    function redibujar() {

        lista.innerHTML = "";

        array.forEach((valor, indice) => {

            const chip =
                document.createElement("div");

            chip.className = "chip-editable";

            chip.innerHTML = `
                <span></span>
                <button type="button" class="chip-quitar">×</button>
            `;

            chip.querySelector("span")
                .textContent = valor;

            chip.querySelector(".chip-quitar")
                .addEventListener("click", () => {
                    array.splice(indice, 1);
                    redibujar();
                });

            lista.appendChild(chip);

        });

    }

    function anadir() {

        const valor = input.value.trim();

        if (!valor) return;

        array.push(valor);
        input.value = "";

        redibujar();

    }

    boton.addEventListener("click", anadir);

    input.addEventListener("keydown", e => {

        if (e.key === "Enter") {
            e.preventDefault();
            anadir();
        }

    });

    return redibujar;

}

const lugaresSeleccionados = [];
const consecuenciasSeleccionadas = [];
const consecuenciasDestacadasSeleccionadas = [];

const redibujarLugares = crearListaEditable({
    idInput: "nuevo-lugar",
    idBoton: "anadir-lugar",
    idLista: "lista-lugares",
    array: lugaresSeleccionados
});

const redibujarConsecuencias = crearListaEditable({
    idInput: "nueva-consecuencia",
    idBoton: "anadir-consecuencia",
    idLista: "lista-consecuencias",
    array: consecuenciasSeleccionadas
});

const redibujarConsecuenciasDestacadas = crearListaEditable({
    idInput: "nueva-consecuencia-destacada",
    idBoton: "anadir-consecuencia-destacada",
    idLista: "lista-consecuencias-destacadas",
    array: consecuenciasDestacadasSeleccionadas
});

/* ========================================
   EDITOR · FIGURAS CLAVE (PERSONAJES)
   Igual que las listas simples, pero cada entrada tiene dos
   datos (nombre e imagen) en vez de uno solo.
======================================== */

const personajesSeleccionados = [];

function redibujarPersonajes() {

    const lista =
        document.getElementById("lista-personajes");

    lista.innerHTML = "";

    personajesSeleccionados.forEach((personaje, indice) => {

        const chip =
            document.createElement("div");

        chip.className = "chip-editable";

        chip.innerHTML = `
            <span></span>
            <button type="button" class="chip-quitar">×</button>
        `;

        chip.querySelector("span")
            .textContent = personaje.nombre;

        chip.querySelector(".chip-quitar")
            .addEventListener("click", () => {
                personajesSeleccionados.splice(indice, 1);
                redibujarPersonajes();
            });

        lista.appendChild(chip);

    });

}

document
.getElementById("anadir-personaje")
.addEventListener("click", () => {

    const nombreInput =
        document.getElementById("nuevo-personaje-nombre");

    const imagenInput =
        document.getElementById("nuevo-personaje-imagen");

    const nombre = nombreInput.value.trim();
    const imagen = imagenInput.value.trim();

    if (!nombre) return;

    personajesSeleccionados.push({ nombre, imagen });

    nombreInput.value = "";
    imagenInput.value = "";

    redibujarPersonajes();

});

/* ========================================
   EDITORES QUILL
======================================== */

/* Quill nunca guarda un string realmente vacío: un editor
   "sin escribir nada" produce "<p><br></p>", que para
   JavaScript es un texto no vacío (truthy). Esta función
   quita las etiquetas y comprueba si queda texto de verdad,
   para poder distinguir "no hay relato" de "hay un párrafo
   vacío". También sirve para eventos ya guardados antes de
   este arreglo, que podrían tener ese HTML vacío en el JSON. */
function textoTieneContenido(html) {

    if (!html)
        return false;

    /* Una imagen (u otro contenido incrustado) sin texto
       alrededor también cuenta como "hay contenido" */
    if (/<img|<iframe|<video/i.test(html))
        return true;

    const textoPlano =
        html
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim();

    return textoPlano.length > 0;

}

const editorDescripcion = new Quill(
    "#editor-descripcion",
    {
        theme: "snow",
        placeholder: "Escribe una descripción breve del evento...",
        modules: {
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline"],
                [{ align: [] }],
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
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline"],
                [{ align: [] }],
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
   RELLENAR / LIMPIAR EL FORMULARIO
   Se usan al abrir el editor: rellenarFormularioEditor()
   cuando se edita un evento existente, y
   limpiarFormularioEditor() cuando se crea uno nuevo.
======================================== */

function rellenarFormularioEditor(evento) {

    document.getElementById("ev-titulo")
        .value = evento.titulo || "";

    document.getElementById("ev-inicio")
        .value = evento.inicio ?? "";

    document.getElementById("ev-fin")
        .value = evento.fin ?? "";

    document.getElementById("ev-era")
        .value = evento.era || eraActual;

    document.getElementById("ev-tipo")
        .value = evento.tipo || "";

    document.getElementById("ev-color")
        .value = evento.color || "#4e0a09";

    /* Colecciones: marcamos como "activa" solo las que
       tenga el evento. */
    document
    .querySelectorAll(".coleccion-chip")
    .forEach(chip => {

        chip.classList.toggle(
            "activa",
            (evento.colecciones || []).includes(
                chip.dataset.coleccion
            )
        );

    });

    /* Reinos: el evento guarda {nombre, escudo}, así que
       traducimos el nombre de vuelta a su slug para poder
       marcar el chip correspondiente como activo. */
    reinosSeleccionados.length = 0;

    (evento.reinos || []).forEach(reino => {

        const nombre =
            typeof reino === "object"
                ? reino.nombre
                : reino;

        const slug =
            Object.keys(REINOS).find(
                clave =>
                    REINOS[clave].toLowerCase() ===
                    (nombre || "").toLowerCase()
            );

        if (slug)
            reinosSeleccionados.push(slug);

    });

    document
    .querySelectorAll(".editor-reino")
    .forEach(boton => {

        boton.classList.toggle(
            "activo",
            reinosSeleccionados.includes(
                boton.dataset.reino
            )
        );

    });

    /* Lugares, consecuencias y figuras clave */
    lugaresSeleccionados.length = 0;
    (evento.lugares || []).forEach(l =>
        lugaresSeleccionados.push(l)
    );
    redibujarLugares();

    consecuenciasSeleccionadas.length = 0;
    (evento.consecuencias || []).forEach(c =>
        consecuenciasSeleccionadas.push(c)
    );
    redibujarConsecuencias();

    consecuenciasDestacadasSeleccionadas.length = 0;
    (evento.consecuenciasDestacadas || []).forEach(c =>
        consecuenciasDestacadasSeleccionadas.push(c)
    );
    redibujarConsecuenciasDestacadas();

    personajesSeleccionados.length = 0;
    (evento.personajes || []).forEach(p =>
        personajesSeleccionados.push(
            typeof p === "object"
                ? { ...p }
                : { nombre: p, imagen: "" }
        )
    );
    redibujarPersonajes();

    /* Relato: la descripción breve (la que aparece bajo el
       título en el panel de detalle) va en el editor
       "Descripción"; el texto largo (el del popup "Leer
       relato completo") va en "Relato continuación". */
    editorDescripcion.setText("");
    editorDescripcion.clipboard.dangerouslyPasteHTML(
        evento.descripcion || ""
    );

    editorContinuacion.setText("");
    editorContinuacion.clipboard.dangerouslyPasteHTML(
        evento.textoCompleto || ""
    );

    /* Imagen: detectamos si es una URL externa o una ruta
       del proyecto y rellenamos el campo correspondiente. */
    const esURL =
        /^https?:\/\//.test(evento.imagen || "");

    document.getElementById("origen-imagen")
        .value = esURL ? "url" : "proyecto";

    document.getElementById("ev-imagen-proyecto")
        .value = esURL ? "" : (evento.imagen || "");

    document.getElementById("ev-imagen-url")
        .value = esURL ? (evento.imagen || "") : "";

    actualizarOrigenImagen();
    actualizarPreviewImagen();

}

function limpiarFormularioEditor() {

    document.getElementById("ev-titulo").value = "";
    document.getElementById("ev-inicio").value = "";
    document.getElementById("ev-fin").value = "";
    document.getElementById("ev-era").value = eraActual;
    document.getElementById("ev-tipo").value = "";
    document.getElementById("ev-color").value = "#4e0a09";

    document
    .querySelectorAll(".coleccion-chip")
    .forEach(chip => {

        chip.classList.toggle(
            "activa",
            chip.dataset.coleccion === "general"
        );

    });

    reinosSeleccionados.length = 0;

    document
    .querySelectorAll(".editor-reino")
    .forEach(boton =>
        boton.classList.remove("activo")
    );

    lugaresSeleccionados.length = 0;
    redibujarLugares();

    consecuenciasSeleccionadas.length = 0;
    redibujarConsecuencias();

    consecuenciasDestacadasSeleccionadas.length = 0;
    redibujarConsecuenciasDestacadas();

    personajesSeleccionados.length = 0;
    redibujarPersonajes();

    editorDescripcion.setText("");
    editorContinuacion.setText("");

    document.getElementById("ev-imagen-proyecto").value = "";
    document.getElementById("ev-imagen-url").value = "";
    document.getElementById("origen-imagen").value = "proyecto";

    actualizarOrigenImagen();

}

/* ========================================
   BOTÓN GUARDAR
======================================== */

document
    .querySelector(".editor-guardar")
    .addEventListener("click", () => {

        const esNuevo = !eventoEditando;

        const evento = eventoEditando || {};

        const titulo =
            document.getElementById("ev-titulo").value.trim();

        const inicio =
            document.getElementById("ev-inicio").value;

        if (!titulo || inicio === "") {

            alert(
                "El evento necesita al menos un título y un año de inicio."
            );

            return;

        }

        evento.titulo = titulo;

        evento.inicio =
            Number(inicio);

        evento.fin =
            Number(document.getElementById("ev-fin").value);

        evento.era =
            document.getElementById("ev-era").value;

        evento.tipo =
            document.getElementById("ev-tipo").value;

        evento.color =
            document.getElementById("ev-color").value;

        /* Relato */
        evento.descripcion =
            editorDescripcion.root.innerHTML;

        evento.textoCompleto =
            textoTieneContenido(editorContinuacion.root.innerHTML)
                ? editorContinuacion.root.innerHTML
                : "";

        /* Colecciones: las que estén marcadas como "activa".
           Si no hay ninguna marcada, cae en "general" para
           que el evento no desaparezca de todas las vistas. */
        evento.colecciones =
            [...document.querySelectorAll(".coleccion-chip.activa")]
                .map(chip => chip.dataset.coleccion);

        if (evento.colecciones.length === 0) {
            evento.colecciones = ["general"];
        }

        /* Reinos: traducimos cada slug a su nombre "bonito" */
        evento.reinos =
            reinosSeleccionados.map(slug => ({
                nombre: REINOS[slug],
                escudo: ""
            }));

        /* Lugares, consecuencias y figuras clave. Copiamos
           los arrays (con spread / map) en vez de asignarlos
           directamente, para que cada evento tenga su propia
           lista y no comparta referencia con el formulario. */
        evento.lugares = [...lugaresSeleccionados];
        evento.consecuencias = [...consecuenciasSeleccionadas];
        evento.consecuenciasDestacadas =
            [...consecuenciasDestacadasSeleccionadas];
        evento.personajes =
            personajesSeleccionados.map(p => ({ ...p }));

        /* Imagen: según el origen seleccionado. El origen
           "subida" no se guarda (es una vista previa local,
           un blob: URL que no sobrevive a un reload ni tiene
           sentido en el eventos.json exportado) — si el
           usuario quiere que la imagen persista, tiene que
           subir el archivo al proyecto y usar "Archivo del
           proyecto", o pegar una URL externa. */
        const origenSeleccionado =
            document.getElementById("origen-imagen").value;

        if (origenSeleccionado === "proyecto") {

            evento.imagen =
                document.getElementById("ev-imagen-proyecto").value.trim();

        } else if (origenSeleccionado === "url") {

            evento.imagen =
                document.getElementById("ev-imagen-url").value.trim();

        }

        /* Posición del encuadre: aquí es donde antes se
           perdía el ajuste que hacías arrastrando/haciendo
           zoom en el editor — se guardaba la ruta de la
           imagen, pero nunca el encuadre elegido. Solo tiene
           sentido guardarlo si la imagen llegó a cargar de
           verdad en el editor (naturalWidth > 0); si no hay
           imagen, o el origen es "subida" (no persistente),
           se limpia para que el detalle caiga en su valor
           por defecto (centrado). */
        if (evento.imagen && editorPanel.imagen.naturalWidth) {

            const fondoPanel =
                editorPanel.obtenerFondoCSS();

            evento.imagenPosX = fondoPanel.x;
            evento.imagenPosY = fondoPanel.y;

        } else {

            delete evento.imagenPosX;
            delete evento.imagenPosY;

        }

        if (evento.imagen && editorCard.imagen.naturalWidth) {

            const fondoCard =
                editorCard.obtenerFondoCSS();

            evento.cardPosX = fondoCard.x;
            evento.cardPosY = fondoCard.y;

        } else {

            delete evento.cardPosX;
            delete evento.cardPosY;

        }

        if (esNuevo) {

            evento.id = generarIdUnico();

            eventosGlobales.push(evento);

        }

        renderizarTimeline();

        /* Actualización en vivo: si el panel de detalle está
           abierto (o si acabamos de crear un evento nuevo),
           lo refrescamos con los datos recién guardados en
           vez de obligar a cerrar y volver a abrir la
           tarjeta. mostrarDetalle() ya se encarga de dejar
           eventoEditando apuntando a este evento. */
        mostrarDetalle(evento);

    });

/* ========================================
   BOTÓN EXPORTAR JSON
   Descarga eventosGlobales tal cual está en memoria, para
   que puedas subir el archivo a tu repositorio y que los
   cambios se queden guardados de verdad.
======================================== */

document
    .querySelector(".editor-exportar")
    .addEventListener("click", () => {

        const contenido =
            JSON.stringify(eventosGlobales, null, 4);

        const blob = new Blob(
            [contenido],
            { type: "application/json" }
        );

        const url =
            URL.createObjectURL(blob);

        const enlace =
            document.createElement("a");

        enlace.href = url;
        enlace.download = "eventos.json";

        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);

        URL.revokeObjectURL(url);

    });

/* ========================================
   BOTÓN IMPORTAR JSON
   Carga un eventos.json desde el disco y sustituye los
   eventos que hay en memoria. Útil para retomar un archivo
   que ya tenías exportado, o para pegar eventos escritos a
   mano. Antes de sustituir nada, se valida y se rellenan los
   campos que falten, para que un JSON incompleto no rompa el
   render de la cronología (ver generarPosiciones / el filtro
   de renderizarTimeline, que ya esperan estos campos).
======================================== */

function sanearEventoImportado(evento, idsUsados) {

    const saneado = { ...evento };

    if (
        typeof saneado.titulo !== "string" ||
        !saneado.titulo.trim()
    ) {
        return null;
    }

    if (
        typeof saneado.inicio !== "number" ||
        Number.isNaN(saneado.inicio)
    ) {
        return null;
    }

    if (
        !["antigua", "clasica", "actual"].includes(saneado.era)
    ) {
        saneado.era = "actual";
    }

    if (
        typeof saneado.fin !== "number" ||
        Number.isNaN(saneado.fin)
    ) {
        saneado.fin = saneado.inicio;
    }

    if (
        !Array.isArray(saneado.colecciones) ||
        saneado.colecciones.length === 0
    ) {
        saneado.colecciones = ["general"];
    }

    saneado.lugares =
        Array.isArray(saneado.lugares) ? saneado.lugares : [];

    saneado.reinos =
        Array.isArray(saneado.reinos) ? saneado.reinos : [];

    saneado.personajes =
        Array.isArray(saneado.personajes) ? saneado.personajes : [];

    saneado.consecuencias =
        Array.isArray(saneado.consecuencias) ? saneado.consecuencias : [];

    saneado.consecuenciasDestacadas =
        Array.isArray(saneado.consecuenciasDestacadas)
            ? saneado.consecuenciasDestacadas
            : [];

    saneado.color = saneado.color || "#4e0a09";

    /* Id: lo conservamos si existe y todavía no se ha usado
       dentro de este mismo archivo importado; si falta o está
       repetido, se genera uno nuevo para evitar que dos
       eventos distintos acaben compartiendo id. */
    if (
        typeof saneado.id !== "number" ||
        idsUsados.has(saneado.id)
    ) {
        let nuevoId = Date.now() + idsUsados.size;
        while (idsUsados.has(nuevoId)) nuevoId++;
        saneado.id = nuevoId;
    }

    idsUsados.add(saneado.id);

    return saneado;

}

document
    .querySelector(".editor-importar")
    .addEventListener("click", () => {

        document
            .getElementById("editor-import-file")
            .click();

    });

document
    .getElementById("editor-import-file")
    .addEventListener("change", (e) => {

        const archivo = e.target.files[0];

        e.target.value = "";

        if (!archivo)
            return;

        const lector = new FileReader();

        lector.onload = () => {

            let datos;

            try {

                datos = JSON.parse(lector.result);

            } catch (error) {

                alert(
                    "Ese archivo no es un JSON válido. Revisa el formato e inténtalo de nuevo."
                );

                return;

            }

            if (!Array.isArray(datos)) {

                alert(
                    "El JSON debe ser una lista de eventos (un array), como el que genera \"Exportar JSON\"."
                );

                return;

            }

            const confirmado = confirm(
                `Vas a importar ${datos.length} eventos. Esto sustituirá ` +
                `todos los eventos que tienes cargados ahora mismo (los ` +
                `que no hayas exportado se perderán). ¿Continuar?`
            );

            if (!confirmado)
                return;

            const idsUsados = new Set();

            const eventosSaneados =
                datos
                    .map(evento =>
                        sanearEventoImportado(evento, idsUsados)
                    )
                    .filter(evento => evento !== null);

            const descartados =
                datos.length - eventosSaneados.length;

            eventosGlobales = eventosSaneados;
            eventoEditando = null;

            document
                .getElementById("detalle-evento")
                .classList.add("oculto");

            renderizarTimeline();

            if (descartados > 0) {

                alert(
                    `Se importaron ${eventosSaneados.length} eventos. ` +
                    `${descartados} se descartaron por no tener al menos ` +
                    `un título y un año de inicio válidos.`
                );

            }

        };

        lector.onerror = () => {

            alert(
                "No se pudo leer el archivo. Inténtalo de nuevo."
            );

        };

        lector.readAsText(archivo);

    });

/* ========================================
   REDIMENSIONAR EL PANEL DEL EDITOR
   Arrastrando el tirador del borde izquierdo se puede
   ensanchar o estrechar el panel, entre un mínimo (para que
   los campos sigan siendo legibles) y un máximo (para que no
   se coma toda la pantalla). El ancho se guarda en
   localStorage para que se recuerde entre visitas.
======================================== */

(function () {

    const panel =
        document.getElementById("editor-evento");

    const tirador =
        document.getElementById("editor-resize-handle");

    if (!panel || !tirador)
        return;

    const CLAVE_ANCHO = "granSiniestraAnchoEditor";
    const ANCHO_MINIMO = 360;

    const anchoMaximo = () =>
        Math.min(900, window.innerWidth * 0.9);

    /* Restaura el último ancho usado, si había uno guardado */
    const anchoGuardado =
        Number(localStorage.getItem(CLAVE_ANCHO));

    if (anchoGuardado) {

        panel.style.width =
            Math.max(
                ANCHO_MINIMO,
                Math.min(anchoMaximo(), anchoGuardado)
            ) + "px";

    }

    let arrastrando = false;
    let anchoInicial = 0;
    let xInicial = 0;

    tirador.addEventListener("pointerdown", (e) => {

        arrastrando = true;
        xInicial = e.clientX;

        anchoInicial =
            panel.getBoundingClientRect().width;

        panel.classList.add("redimensionando");
        tirador.classList.add("arrastrando");

        tirador.setPointerCapture(e.pointerId);

        e.preventDefault();

    });

    tirador.addEventListener("pointermove", (e) => {

        if (!arrastrando)
            return;

        /* El tirador está en el borde izquierdo de un panel
           anclado a la derecha de la pantalla: arrastrar
           hacia la izquierda (delta negativo respecto al
           punto de partida) tiene que ENSANCHAR el panel. */
        const delta =
            xInicial - e.clientX;

        let nuevoAncho =
            anchoInicial + delta;

        nuevoAncho = Math.max(
            ANCHO_MINIMO,
            Math.min(anchoMaximo(), nuevoAncho)
        );

        panel.style.width =
            nuevoAncho + "px";

    });

    function terminarArrastre() {

        if (!arrastrando)
            return;

        arrastrando = false;

        panel.classList.remove("redimensionando");
        tirador.classList.remove("arrastrando");

        localStorage.setItem(
            CLAVE_ANCHO,
            Math.round(
                panel.getBoundingClientRect().width
            )
        );

    }

    tirador.addEventListener("pointerup", terminarArrastre);
    tirador.addEventListener("pointercancel", terminarArrastre);

})();


/* ========================================
   BÚSQUEDA
   Es GLOBAL: mira en todas las eras y colecciones a la vez,
   no solo en la que tienes abierta ahora mismo. Un resultado
   fuera de la vista actual se puede abrir directamente desde
   el desplegable — eso cambia de pestaña por ti, así que no
   hace falta adivinar antes dónde vive cada cosa.
======================================== */

const NOMBRES_ERA_BUSQUEDA = {
    antigua: "Historia Antigua",
    clasica: "Historia Clásica",
    actual: "Actualidad"
};

function nombreColeccionBusqueda(slug) {

    if (!slug || slug === "general")
        return "General";

    return REINOS[slug] || slug;

}

/* Quita etiquetas HTML y deja solo el texto legible, para
   poder buscar dentro de "descripción" y "relato
   continuación" sin que las etiquetas cuenten como texto. */
function textoPlanoDe(html) {

    if (!html)
        return "";

    return html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}

function escaparHTML(str) {

    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;

}

/* Envuelve en <mark> cada aparición del término dentro del
   texto, escapando el resto para no introducir HTML sin
   querer. */
function resaltarTermino(texto, termino) {

    if (!termino)
        return escaparHTML(texto);

    const escapadoRegex =
        termino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(`(${escapadoRegex})`, "gi");

    return texto
        .split(regex)
        .map((parte, i) =>
            i % 2 === 1
                ? `<mark>${escaparHTML(parte)}</mark>`
                : escaparHTML(parte)
        )
        .join("");

}

/* Recorta un fragmento de texto centrado en la primera
   aparición del término, para mostrar contexto sin volcar
   el relato entero en el resultado. */
function extraerFragmentoBusqueda(texto, termino) {

    const indice =
        texto.toLowerCase().indexOf(termino);

    if (indice === -1)
        return texto.slice(0, 120);

    const inicio = Math.max(0, indice - 40);
    const fin = Math.min(texto.length, indice + termino.length + 60);

    let fragmento = texto.slice(inicio, fin);

    if (inicio > 0) fragmento = "…" + fragmento;
    if (fin < texto.length) fragmento = fragmento + "…";

    return fragmento;

}

function buscarEventos(query) {

    const termino = query.trim().toLowerCase();

    if (termino.length < 2)
        return [];

    const resultados = [];

    eventosGlobales.forEach(evento => {

        const titulo = evento.titulo || "";
        const descripcion = textoPlanoDe(evento.descripcion);
        const continuacion = textoPlanoDe(evento.textoCompleto);

        const enTitulo = titulo.toLowerCase().includes(termino);
        const enDescripcion = descripcion.toLowerCase().includes(termino);
        const enContinuacion = continuacion.toLowerCase().includes(termino);

        if (!enTitulo && !enDescripcion && !enContinuacion)
            return;

        let fuente = "titulo";
        let textoFuente = "";

        if (!enTitulo) {

            if (enDescripcion) {
                fuente = "descripcion";
                textoFuente = descripcion;
            } else {
                fuente = "continuacion";
                textoFuente = continuacion;
            }

        }

        resultados.push({
            evento,
            fuente,
            fragmento:
                fuente === "titulo"
                    ? ""
                    : extraerFragmentoBusqueda(textoFuente, termino)
        });

    });

    /* Los que coinciden en el título primero — es la
       coincidencia más directa. */
    resultados.sort((a, b) => {
        if (a.fuente === "titulo" && b.fuente !== "titulo") return -1;
        if (a.fuente !== "titulo" && b.fuente === "titulo") return 1;
        return 0;
    });

    return resultados.slice(0, 15);

}

function mostrarResultadosBusqueda(resultados, termino) {

    const contenedor =
        document.getElementById("resultados-busqueda");

    if (resultados.length === 0) {

        contenedor.innerHTML = `
            <div class="resultado-vacio">
                Sin resultados para «${escaparHTML(termino)}»
            </div>
        `;

        contenedor.classList.remove("oculto");
        return;

    }

    contenedor.innerHTML =
        resultados.map(r => `
            <button class="resultado-busqueda" data-id="${r.evento.id}">
                <div class="resultado-cabecera">
                    <span class="resultado-titulo">
                        ${resaltarTermino(r.evento.titulo || "", termino)}
                    </span>
                    <span class="resultado-tag">
                        ${NOMBRES_ERA_BUSQUEDA[r.evento.era] || r.evento.era}
                        ·
                        ${nombreColeccionBusqueda((r.evento.colecciones || [])[0])}
                    </span>
                </div>
                ${
                    r.fragmento
                        ? `<div class="resultado-fragmento">${resaltarTermino(r.fragmento, termino)}</div>`
                        : ""
                }
            </button>
        `).join("");

    contenedor.classList.remove("oculto");

    contenedor.querySelectorAll(".resultado-busqueda").forEach(boton => {

        boton.addEventListener("click", () => {

            const evento =
                eventosGlobales.find(
                    e => e.id === Number(boton.dataset.id)
                );

            if (evento) irAEvento(evento);

            contenedor.classList.add("oculto");

            const inputBuscador =
                document.getElementById("buscador");

            inputBuscador.value = "";

            aplicarResaltadoBusqueda("");

        });

    });

}

/* Cambia de era/colección (si hace falta) para que el evento
   pase a estar visible, sincroniza el estado visual de las
   pestañas correspondientes, y abre su detalle directamente. */
function irAEvento(evento) {

    eraActual = evento.era;

    const coleccion =
        (evento.colecciones || []).includes("general")
            ? "general"
            : (evento.colecciones || [])[0] || "general";

    coleccionActual = coleccion;

    document
        .querySelectorAll(".era-btn")
        .forEach(b =>
            b.classList.toggle(
                "activo",
                b.dataset.era === eraActual
            )
        );

    if (coleccion === "general") {

        casaActiva = null;

        document
            .querySelectorAll(".casa-btn")
            .forEach(b => b.classList.remove("activa"));

        cronologiaGeneralAbierta = true;

        erasGeneral.classList.remove("oculto");

        document
            .getElementById("flecha-cronologia")
            .classList.remove("abierta");

    } else {

        casaActiva = coleccion;

        document
            .querySelectorAll(".casa-btn")
            .forEach(b =>
                b.classList.toggle(
                    "activa",
                    b.dataset.casa === coleccion
                )
            );

        cronologiaGeneralAbierta = false;

        erasGeneral.classList.add("oculto");

        document
            .getElementById("flecha-cronologia")
            .classList.add("abierta");

    }

    renderizarTimeline();

    /* Esperamos al siguiente frame para que la tarjeta ya
       exista en el DOM antes de intentar centrarla. */
    requestAnimationFrame(() => {

        const tarjeta =
            timeline.querySelector(
                `.evento[data-id="${evento.id}"]`
            );

        if (tarjeta) {

            timelineWrapper.scrollLeft =
                tarjeta.offsetLeft
                - (timelineWrapper.clientWidth / 2)
                + (tarjeta.offsetWidth / 2);

        }

        mostrarDetalle(evento);

    });

}

/* Resalta (o difumina) las tarjetas YA visibles en la
   cronología actual según coincidan o no con la búsqueda —
   complementa al desplegable, que es el que de verdad
   permite saltar a resultados de otras eras/colecciones. */
function aplicarResaltadoBusqueda(query) {

    const termino = query.trim().toLowerCase();

    document.querySelectorAll(".evento").forEach(div => {

        if (!termino) {

            div.classList.remove(
                "buscado-coincide",
                "buscado-difuminado"
            );

            return;

        }

        const evento =
            eventosGlobales.find(
                e => String(e.id) === div.dataset.id
            );

        if (!evento)
            return;

        const coincide =
            (evento.titulo || "").toLowerCase().includes(termino) ||
            textoPlanoDe(evento.descripcion).toLowerCase().includes(termino) ||
            textoPlanoDe(evento.textoCompleto).toLowerCase().includes(termino);

        div.classList.toggle("buscado-coincide", coincide);
        div.classList.toggle("buscado-difuminado", !coincide);

    });

}

const inputBuscador = document.getElementById("buscador");
const resultadosBusqueda = document.getElementById("resultados-busqueda");
const btnClear = document.getElementById("buscador-clear");
const wrapperBuscador = inputBuscador
    ? inputBuscador.closest(".buscador-wrapper")
    : null;

function toggleClearBtn() {

    if (!wrapperBuscador) return;

    if (inputBuscador.value.length > 0) {

        wrapperBuscador.classList.add("con-texto");

    } else {

        wrapperBuscador.classList.remove("con-texto");

    }

}

if (btnClear) {

    btnClear.addEventListener("click", () => {

        inputBuscador.value = "";
        toggleClearBtn();
        aplicarResaltadoBusqueda("");
        resultadosBusqueda.classList.add("oculto");
        inputBuscador.focus();

    });

}

inputBuscador.addEventListener("input", () => {

    const termino = inputBuscador.value;

    toggleClearBtn();
    aplicarResaltadoBusqueda(termino);

    if (termino.trim().length < 2) {
        resultadosBusqueda.classList.add("oculto");
        return;
    }

    mostrarResultadosBusqueda(
        buscarEventos(termino),
        termino.trim()
    );

});

inputBuscador.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        inputBuscador.value = "";
        toggleClearBtn();
        aplicarResaltadoBusqueda("");
        resultadosBusqueda.classList.add("oculto");
        inputBuscador.blur();

    }

});

document.addEventListener("click", (e) => {

    if (!e.target.closest(".cronologia-busqueda")) {
        resultadosBusqueda.classList.add("oculto");
    }

});
