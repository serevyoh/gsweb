let eraActual = "actual";
let eventosGlobales = [];
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
const espacioHito = 120;
let minAnioActual = 0;
function obtenerX(anio) {
    return (
        anio - minAnioActual
    ) * espacioHito;
}
function generarPosiciones(eventos) {

    const posiciones = {};

    if (eventos.length === 0)
        return posiciones;

    posiciones[eventos[0].id] = 350;

    let xActual = 350;

    for (
        let i = 1;
        i < eventos.length;
        i++
    ) {

        const anterior =
            eventos[i - 1];

        const actual =
            eventos[i];

        const diferencia =
            Math.abs(
                actual.inicio -
                anterior.inicio
            );

        const distancia =
            180 +
            Math.sqrt(
                diferencia
            ) * 100;

        xActual += distancia;

        posiciones[
            actual.id
        ] = xActual;
    }
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

        renderizarTimeline();

    });

function mostrarDetalle(evento) {

    const panel =
        document.getElementById("detalle-evento");

    panel.classList.remove("oculto");

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
        e => e.era === eraActual
    )
    .sort(
        (a, b) => {

            if (eraActual === "antigua") {
                return b.inicio - a.inicio;
            }

            return a.inicio - b.inicio;
        }
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

    let ancho;

    if (
        evento.fin &&
        evento.fin !== evento.inicio
    ) {

        const duracion =
            evento.fin - evento.inicio;

        ancho = Math.min(
            900,
            Math.max(
                220,
                220 + duracion * 2
            )
        );

    } else {

        ancho = 220;
    }

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
minAnioActual = minAnio;

console.log(
    "Rango:",
    minAnio,
    maxAnio
);
    const aniosMostrados = new Set();
const niveles = [
    180,
    120,
    60,
    0,
    -60
];

const finNivel = [
    -999999,
    -999999,
    -999999,
    -999999,
    -999999
];
    eventos.forEach((evento, i) => {

    console.log("Procesando:", evento.titulo);

        const div = document.createElement("div");
        div.classList.add("evento");

        div.style.left =
            posiciones[evento.id]
            + "px";

console.log(
    evento.titulo,
    evento.inicio,
    posiciones[evento.id]
);

        let nivel = 0;

for (
    let n = 0;
    n < niveles.length;
    n++
) {

    if (
        posiciones[evento.id]
        >
        finNivel[n]
    ) {

        nivel = n;
        break;

    }
}

        const topEvento =
            niveles[nivel];

        console.log(
    evento.titulo,
    "nivel:",
    nivel,
    "top:",
    topEvento
);

        div.style.top =
            topEvento + "px";

        let ancho;
           if (
    evento.fin &&
    evento.fin !== evento.inicio
) {

    const duracion =
        evento.fin - evento.inicio;

    ancho = Math.min(
        900,
        Math.max(
            220,
            220 + duracion * 2
        )
    );

} else {

    ancho = 220;

}

        evento._finVisual =
        posiciones[evento.id]
        + ancho;
        finNivel[nivel] =
    evento._finVisual;

        div.style.width =
            ancho + "px";

        const centroX =
        posiciones[evento.id]
        + ancho / 2;

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