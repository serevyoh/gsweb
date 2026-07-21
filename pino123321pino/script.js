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

    /* Reinos: sincronizamos el array que usa el editor con
       los reinos guardados en el evento. */
    reinosSeleccionados.length = 0;

    (evento.reinos || []).forEach(reino =>
        reinosSeleccionados.push(reino)
    );

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

        /* Relato */
        evento.descripcion =
            editorDescripcion.root.innerHTML;

        evento.textoCompleto =
            editorContinuacion.root.innerHTML;

        /* Colecciones: las que estén marcadas como "activa".
           Si no hay ninguna marcada, cae en "general" para
           que el evento no desaparezca de todas las vistas. */
        evento.colecciones =
            [...document.querySelectorAll(".coleccion-chip.activa")]
                .map(chip => chip.dataset.coleccion);

        if (evento.colecciones.length === 0) {
            evento.colecciones = ["general"];
        }

        /* Reinos */
        evento.reinos = [...reinosSeleccionados];

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

        if (esNuevo) {

            evento.id = Date.now();

            evento.lugares = [];
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