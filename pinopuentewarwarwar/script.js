let datos;
const datosBase = {

    operacion: {

    nombre: "Asalto a Puerto Negro",

    objetivo:
        "Capturar la fortaleza y asegurar el puerto.",

    estado:
        "Preparación",

    comandante:
        "Lord Adrastus Valdyr",

    mapa:
        "img/mapas/1.jpg",

    galeria: [

        "img/mapas/1.jpg",

        "img/mapas/2.jpg",

        "img/mapas/3.jpg"

    ]

},

escuadrones: [

    {
        id: 1,
        nombre: "Escuadrón I",
        especialidad: "Flanco Izquierdo",
        capitan: "Adrastus Valdyr",
        efectivos: 266,
        frase: "Tomaremos la muralla antes del amanecer.",
        imagen: "img/personajes/placeholder.jpg"
    },

    {
        id: 2,
        nombre: "Escuadrón II",
        especialidad: "Ataque Principal",
        capitan: "Roland Voss",
        efectivos: 412,
        frase: "",
        imagen: "img/personajes/placeholder.jpg"
    },

    {
    id: 3,
    nombre: "Escuadrón III",
    especialidad: "Reserva",
    capitan: "Marcus Drenn",
    efectivos: 187,
    frase: "Esperaremos la señal.",
    imagen: "img/personajes/placeholder.jpg"
    }

],

puntos: [

    {
        id: 1,
        x: 25,
        y: 40,
        titulo: "Escuadrón I",
        descripcion: "Flanco izquierdo"
    },

    {
        id: 2,
        x: 70,
        y: 55,
        titulo: "Escuadrón II",
        descripcion: "Ataque principal"
    }

],

rutas: [

]

};

const datosGuardados =
    localStorage.getItem(
        "operacionMilitar"
    );

if (datosGuardados) {

    datos =
        JSON.parse(
            datosGuardados
        );

    console.log(
        "Datos cargados desde localStorage"
    );

} else {

    datos = datosBase;

    console.log(
        "Datos cargados desde datosBase"
    );

}

console.log("Datos cargados");
console.log(datos.operacion);
console.log(datos.escuadrones);
console.log(datos.puntos);
document.getElementById("operationTitle").textContent =
    datos.operacion.nombre

document.getElementById("sidebarOperationName").textContent =
    datos.operacion.nombre;

document.getElementById("operationObjective").textContent =
    datos.operacion.objetivo;

document.getElementById("operationStatus").textContent =
    datos.operacion.estado;

document.getElementById("operationCommander").textContent =
    datos.operacion.comandante;

document.getElementById("battleMap").style.backgroundImage =
    `url(${datos.operacion.mapa})`;

let currentGalleryIndex = 0;

document.getElementById("galleryImage").style.backgroundImage =
    `url(${datos.operacion.galeria[currentGalleryIndex]})`;

const galleryDots =
    document.getElementById("galleryDots");

datos.operacion.galeria.forEach((imagen, index) => {

    galleryDots.innerHTML += `

    <div
        class="gallery-dot ${index === 0 ? "active" : ""}"
        data-index="${index}">
    </div>

    `;

});
function updateGallery() {

    document.getElementById("galleryImage")
        .style.backgroundImage =
        `url(${datos.operacion.galeria[currentGalleryIndex]})`;

    document
        .querySelectorAll(".gallery-dot")
        .forEach((dot, index) => {

            dot.classList.toggle(
                "active",
                index === currentGalleryIndex
            );

        });

}
document
    .getElementById("galleryPrev")
    .addEventListener("click", () => {

        currentGalleryIndex--;

        if (currentGalleryIndex < 0) {

            currentGalleryIndex =
                datos.operacion.galeria.length - 1;

        }

        updateGallery();

    });
document
    .getElementById("galleryNext")
    .addEventListener("click", () => {

        currentGalleryIndex++;

        if (
            currentGalleryIndex >=
            datos.operacion.galeria.length
        ) {

            currentGalleryIndex = 0;

        }

        updateGallery();

    });
function renderSquads(){

    squadContainer.innerHTML = "";

    datos.escuadrones.forEach(
        escuadron => {

            squadContainer.innerHTML += `

            <div
                class="squad-card"
                data-squad-id="${escuadron.id}">

                <div class="squad-photo">

                    <img src="${escuadron.imagen}">

                </div>

                <div class="squad-info">

                    <h3>${escuadron.nombre}</h3>

                    <div class="squad-role">
                        ${escuadron.especialidad}
                    </div>

                    <div class="squad-captain">
                        Capitán ${escuadron.capitan}
                    </div>

                    ${
                        escuadron.frase
                        ?
                        `<div class="squad-quote">
                            "${escuadron.frase}"
                        </div>`
                        :
                        ``
                    }

                </div>

                <div class="squad-strength">

                    <div class="squad-icon">
                        ⚔
                    </div>

                    <div class="squad-number">
                        ${escuadron.efectivos}
                    </div>

                </div>

            </div>

            `;

        }
    );

}

    const squadContainer =
    document.getElementById("squadContainer");

renderSquads();
setupSquadHighlightLinks();

const mapPointsContainer =
    document.getElementById("mapPointsContainer");

function renderMapPoints(){

    mapPointsContainer.innerHTML = "";

    datos.puntos.forEach(punto => {

        mapPointsContainer.innerHTML += `

        <div
            class="map-marker"
            data-point-id="${punto.id}"
            data-squad-id="${punto.id}"
            data-title="${
                datos.escuadrones.find(
                    e => e.id === punto.squadId
                )?.nombre || ""
            }"

            data-description="${
                datos.escuadrones.find(
                    e => e.id === punto.squadId
                )?.especialidad || ""
            }"
            style="
                left:${punto.x}%;
                top:${punto.y}%;
            "
        >
            ${punto.id}
        </div>

        <div
            class="map-label"
            style="
                left:${punto.x - 10}%;
                top:${punto.y - 12}%;
            "
        >

            <div class="label-title">
                ${
                    datos.escuadrones.find(
                        e => e.id === punto.squadId
                    )?.nombre || "Sin nombre"
                }
            </div>

            <div class="label-subtitle">
                ${
                    datos.escuadrones.find(
                        e => e.id === punto.squadId
                    )?.especialidad || ""
                }
            </div>

        </div>

        `;

        });

    setTimeout(() => {

        document
            .querySelectorAll(
                ".map-marker"
            )
            .forEach(marker => {

                marker.addEventListener(
                    "click",
                    () => {
                        if(addingRoute){

    const pointId =
        Number(
            marker.dataset.pointId
        );

    if(routeStartPoint === null){

        routeStartPoint =
            pointId;

        alert(
            "Selecciona el destino"
        );

        return;

    }

    alert(
        "Ruta creada (todavía no visible)"
    );

    addingRoute = false;

    routeStartPoint = null;

    return;

}
                        if (
    adminPanel.classList.contains(
        "active"
    )
){

    selectedPointId =
        Number(
            marker.dataset.pointId
        );

    const punto =
        datos.puntos.find(
            p =>
            p.id ===
            selectedPointId
        );

    document
        .getElementById(
            "positionSquad"
        )
        .value =
        punto?.squadId || "";

    document
        .getElementById(
            "positionNotes"
        )
        .value =
        punto?.observaciones || "";

    document
        .getElementById(
            "positionOrders"
        )
        .value =
        punto?.ordenes || "";

    document
        .getElementById(
            "positionEditor"
        )
        .classList
        .add("active");

}else{

    document
        .getElementById(
            "popupTitle"
        )
        .textContent =
        marker.dataset.title;

    const punto =
    datos.puntos.find(
        p =>
        p.id ===
        Number(
            marker.dataset.pointId
        )
    );

document
    .getElementById(
        "popupTitle"
    )
    .textContent =
    marker.dataset.title;

document
    .getElementById(
        "popupSubtitle"
    )
    .textContent =
    marker.dataset.description;

document
    .getElementById(
        "popupNotes"
    )
    .textContent =
    punto?.observaciones ||
    "Sin observaciones";

document
    .getElementById(
        "popupOrders"
    )
    .textContent =
    punto?.ordenes ||
    "Sin órdenes";

    const escuadron =
    datos.escuadrones.find(
        e =>
        e.id === punto?.squadId
    );

document
    .getElementById(
        "popupCaptain"
    )
    .textContent =
    escuadron?.capitan ||
    "Sin capitán";

document
    .getElementById(
        "popupStrength"
    )
    .textContent =
    escuadron?.efectivos ||
    "-";

document
    .getElementById(
        "popupQuote"
    )
    .textContent =
    escuadron?.frase ||
    "";

document
    .getElementById(
        "popupOverlay"
    )
    .classList
    .add("active");

    document
        .getElementById(
            "popupOverlay"
        )
        .classList
        .add("active");

}

                    }
                );

            });

    }, 0);

}

renderMapPoints();

document
    .getElementById("popupClose")
    .addEventListener("click", () => {

        document
            .getElementById("popupOverlay")
            .classList
            .remove("active");

        document
            .getElementById("popupImage")
            .style.display =
            "none";

        restaurarPopup();

    });

document
    .getElementById("popupOverlay")
    .addEventListener("click", (event) => {

        if (
            event.target.id !==
            "popupOverlay"
        ) {
            return;
        }

        document
            .getElementById("popupOverlay")
            .classList
            .remove("active");

        document
            .getElementById("popupImage")
            .style.display =
            "none";

        document
            .querySelector(
                ".popup-window"
            )
            .classList
            .remove("image-mode");

restaurarPopup();

    });
document
    .getElementById("galleryImage")
    .addEventListener("click", () => {

        document
            .getElementById("popupTitle")
            .textContent =
            "Imagen táctica";

document
    .querySelectorAll(
        ".popup-section"
    )
    .forEach(section => {

        section.style.display =
            "none";

    });

document
    .querySelector(
        ".popup-meta"
    )
    .style.display =
    "none";

document
    .getElementById(
        "popupQuote"
    )
    .style.display =
    "none";

    document
        .getElementById(
            "popupSubtitle"
        )
        .style.display =
        "none";
        document
    .getElementById("popupTitle")
    .style.display =
    "none";

document
    .getElementById("popupClose")
    .style.display =
    "none";

    document
    .querySelector(
        ".popup-window"
    )
    .classList
    .add("image-mode");

        const popupImage =
            document.getElementById("popupImage");

        popupImage.src =
            datos.operacion.galeria[currentGalleryIndex];

        popupImage.style.display =
            "block";

        document
            .getElementById("popupOverlay")
            .classList
            .add("active");

    });
    
    document.addEventListener("keydown", event => {

        if (event.key !== "Escape") {
            return;
        }

        document
            .getElementById("popupOverlay")
            .classList
            .remove("active");

        document
            .getElementById("popupImage")
            .style.display =
            "none";

        restaurarPopup();

    });

function setupSquadHighlightLinks(){

    document
        .querySelectorAll(".squad-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const squadId =
                        card.dataset.squadId;

                    const marker =
                        document.querySelector(
                            `[data-point-id="${squadId}"]`
                        );

                    if (!marker) {
                        return;
                    }

                    marker.classList.add(
                        "tactical-highlight"
                    );

                    setTimeout(() => {

                        marker.classList.remove(
                            "tactical-highlight"
                        );

                    }, 2000);

                }
            );

        });

}
    document
    .querySelectorAll(".map-marker")
    .forEach(marker => {

        marker.addEventListener("click", () => {

            const squadId =
                marker.dataset.squadId;

            const squadCard =
                document.querySelector(
                    `[data-squad-id="${squadId}"]`
                );

            if (!squadCard) {
                return;
            }

            squadCard.classList.add(
                "squad-highlight"
            );

            setTimeout(() => {

                squadCard.classList.remove(
                    "squad-highlight"
                );

            }, 2000);

        });

    });

    document
    .getElementById("exportJsonBtn")
    .addEventListener("click", exportarJSON);

function exportarJSON(){

    const json =
        JSON.stringify(
            datos,
            null,
            4
        );

    const blob =
        new Blob(
            [json],
            {
                type:
                "application/json"
            }
        );

    const enlace =
        document.createElement("a");

    enlace.href =
        URL.createObjectURL(blob);

    enlace.download =
        "operacion.json";

    enlace.click();

}

document
    .getElementById("saveLocalBtn")
    .addEventListener(
        "click",
        guardarLocal
    );

function guardarLocal(){

    localStorage.setItem(
        "operacionMilitar",
        JSON.stringify(datos)
    );

    alert(
        "Datos guardados en localStorage"
    );

}

const adminPanel =
    document.getElementById(
        "adminPanel"
    );

document
    .getElementById(
        "toggleAdminBtn"
    )
    .addEventListener(
        "click",
        () => {

            adminPanel.classList.toggle(
                "active"
            );

            const tools =
                document.getElementById(
                    "positionTools"
                );

            if(
                adminPanel.classList.contains(
                    "active"
                )
            ){

                tools.style.display =
                    "block";

            }else{

                tools.style.display =
                    "none";

                document
                    .getElementById(
                        "positionEditor"
                    )
                    .classList
                    .remove("active");

            }

        }
    );
    document
    .getElementById(
        "adminOperationName"
    )
    .value =
    datos.operacion.nombre;
    document
    .getElementById(
        "adminObjective"
    )
    .value =
    datos.operacion.objetivo;

document
    .getElementById(
        "adminStatus"
    )
    .value =
    datos.operacion.estado;

document
    .getElementById(
        "adminCommander"
    )
    .value =
    datos.operacion.comandante;

    document
    .getElementById(
        "adminSaveBtn"
    )
    .addEventListener(
        "click",
        () => {

            const nuevoNombre =
                document
                .getElementById(
                    "adminOperationName"
                )
                .value;
                const nuevoObjetivo =
    document
    .getElementById(
        "adminObjective"
    )
    .value;

const nuevoEstado =
    document
    .getElementById(
        "adminStatus"
    )
    .value;

const nuevoComandante =
    document
    .getElementById(
        "adminCommander"
    )
    .value;

            datos.operacion.nombre =
                nuevoNombre;
            datos.operacion.objetivo =
                nuevoObjetivo;

            datos.operacion.estado =
                nuevoEstado;

            datos.operacion.comandante =
                nuevoComandante;

            document
                .getElementById(
                    "operationTitle"
                )
                .textContent =
                nuevoNombre;

            document
                .getElementById(
                    "sidebarOperationName"
                )
                .textContent =
                nuevoNombre;
                document
                .getElementById(
                    "operationObjective"
                )
                .textContent =
                nuevoObjetivo;

            document
                .getElementById(
                    "operationStatus"
                )
                .textContent =
                nuevoEstado;

            document
                .getElementById(
                    "operationCommander"
                )
                .textContent =
                nuevoComandante;

            guardarLocal();

        }
    );

    const adminSquadList =
    document.getElementById(
        "adminSquadList"
    );

function renderAdminSquads(){

    adminSquadList.innerHTML = "";

    datos.escuadrones.forEach(
        escuadron => {

            adminSquadList.innerHTML += `

            <button
                class="admin-squad-btn"
                data-id="${escuadron.id}"
            >

                ${escuadron.nombre}

            </button>

            `;

        }
    );
}

function setupSquadButtons(){

    document
        .querySelectorAll(
            ".admin-squad-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectedSquadId =
                        Number(
                            button.dataset.id
                        );

                    const escuadron =
                        datos.escuadrones.find(
                            e =>
                            e.id ===
                            selectedSquadId
                        );

                    document
                        .getElementById(
                            "adminSquadEditor"
                        )
                        .classList
                        .add("active");

                    document
                        .getElementById(
                            "adminSquadName"
                        )
                        .value =
                        escuadron.nombre;

                    document
                        .getElementById(
                            "adminSquadRole"
                        )
                        .value =
                        escuadron.especialidad;

                    document
                        .getElementById(
                            "adminSquadCaptain"
                        )
                        .value =
                        escuadron.capitan;

                    document
                        .getElementById(
                            "adminSquadStrength"
                        )
                        .value =
                        escuadron.efectivos;

                    document
                        .getElementById(
                            "adminSquadQuote"
                        )
                        .value =
                        escuadron.frase;

                }
            );

        });

}

let selectedSquadId = null;

renderAdminSquads();
setupSquadButtons();
document
    .getElementById(
        "adminSquadSaveBtn"
    )
    .addEventListener(
        "click",
        guardarEscuadron
    );

function guardarEscuadron(){

    const escuadron =
        datos.escuadrones.find(
            e =>
            e.id === selectedSquadId
        );

    if (!escuadron) {
        return;
    }

    escuadron.nombre =
        document
        .getElementById(
            "adminSquadName"
        )
        .value;

    escuadron.especialidad =
        document
        .getElementById(
            "adminSquadRole"
        )
        .value;

    escuadron.capitan =
        document
        .getElementById(
            "adminSquadCaptain"
        )
        .value;

    escuadron.efectivos =
        Number(
            document
            .getElementById(
                "adminSquadStrength"
            )
            .value
        );

    escuadron.frase =
        document
        .getElementById(
            "adminSquadQuote"
        )
        .value;

    renderSquads();
    setupSquadHighlightLinks();
    renderMapPoints();
    renderAdminSquads();
    setupSquadButtons();
    guardarLocal();
}

document
    .getElementById(
        "addSquadBtn"
    )
    .addEventListener(
        "click",
        crearEscuadron
    );

function crearEscuadron(){

    const nuevoId =

        datos.escuadrones.length > 0

        ?

        Math.max(
            ...datos.escuadrones.map(
                e => e.id
            )
        ) + 1

        :

        1;

    datos.escuadrones.push({

        id: nuevoId,

        nombre:
            "Nuevo Escuadrón",

        especialidad:
            "",

        capitan:
            "",

        efectivos:
            0,

        frase:
            "",

        imagen:
            "img/personajes/placeholder.jpg"

    });

    renderSquads();
    setupSquadHighlightLinks();

    renderAdminSquads();
    setupSquadButtons();

    guardarLocal();

}

document
    .getElementById(
        "deleteSquadBtn"
    )
    .addEventListener(
        "click",
        eliminarEscuadron
    );

function eliminarEscuadron(){

    if(
        selectedSquadId === null
    ){
        return;
    }

    const confirmar =
        confirm(
            "¿Eliminar este escuadrón?"
        );

    if(!confirmar){
        return;
    }

    datos.escuadrones =
        datos.escuadrones.filter(
            escuadron =>
            escuadron.id !==
            selectedSquadId
        );

    selectedSquadId = null;

    renderSquads();
    setupSquadHighlightLinks();

    renderAdminSquads();
    setupSquadButtons();

    document
        .getElementById(
            "adminSquadEditor"
        )
        .classList
        .remove("active");

    guardarLocal();

}

document
    .getElementById(
        "positionMenuBtn"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "positionMenu"
                )
                .classList
                .toggle("active");

        }
    );
    let addingPosition = false;
    let selectedPointId = null;
    let addingRoute = false;
    let routeStartPoint = null;

document
    .getElementById(
        "addPositionBtn"
    )
    .addEventListener(
        "click",
        () => {

            addingPosition = true;

            document
                .getElementById(
                    "positionHint"
                )
                .classList
                .add("active");

            document
                .getElementById(
                    "battleMap"
                )
                .style.cursor =
                "crosshair";

        }
    );

document
    .getElementById(
        "addRouteBtn"
    )
    .addEventListener(
        "click",
        () => {

            addingRoute = true;

            routeStartPoint = null;

            alert(
                "Selecciona el punto de origen"
            );

        }
    );

    document
    .getElementById(
        "battleMap"
    )
    .addEventListener(
        "click",
        crearPosicion
    );

    function crearPosicion(event){

    if(!addingPosition){
        return;
    }

    const mapa =
        document.getElementById(
            "battleMap"
        );

    const rect =
        mapa.getBoundingClientRect();

    const x =
        (
            (event.clientX - rect.left)
            / rect.width
        ) * 100;

    const y =
        (
            (event.clientY - rect.top)
            / rect.height
        ) * 100;

    const nuevoId =

        datos.puntos.length > 0

        ?

        Math.max(
            ...datos.puntos.map(
                p => p.id
            )
        ) + 1

        :

        1;

    datos.puntos.push({

        id: nuevoId,

        x: x,

        y: y,

        squadId: null,

        observaciones: "",

        ordenes: ""

    });

    renderMapPoints();

    guardarLocal();

    addingPosition = false;

    document
    .getElementById(
        "positionHint"
    )
    .classList
    .remove("active");

    document
    .getElementById(
        "battleMap"
    )
    .style.cursor =
    "default";

}

function cargarEscuadronesSelect(){

    const select =
        document.getElementById(
            "positionSquad"
        );

    select.innerHTML = "";

    datos.escuadrones.forEach(
        escuadron => {

            select.innerHTML += `

            <option
                value="${escuadron.id}"
            >
                ${escuadron.nombre}
            </option>

            `;

        }
    );

}

cargarEscuadronesSelect();

document
    .getElementById(
        "savePositionBtn"
    )
    .addEventListener(
        "click",
        guardarPosicion
    );

function guardarPosicion(){

    const punto =
        datos.puntos.find(
            p =>
            p.id ===
            selectedPointId
        );

    if(!punto){
        return;
    }

    punto.squadId =
        Number(
            document
                .getElementById(
                    "positionSquad"
                )
                .value
        );
    
    punto.observaciones =
    document
        .getElementById(
            "positionNotes"
        )
        .value;

    punto.ordenes =
        document
            .getElementById(
                "positionOrders"
            )
            .value;

    renderMapPoints();

    guardarLocal();

}

function restaurarPopup(){

    document
        .querySelectorAll(
            ".popup-section"
        )
        .forEach(section => {

            section.style.display =
                "block";

        });

    document
        .getElementById(
            "popupSubtitle"
        )
        .style.display =
        "block";

    document
        .getElementById(
            "popupTitle"
        )
        .style.display =
        "block";

    document
        .getElementById(
            "popupClose"
        )
        .style.display =
        "inline-block";

    document
        .querySelector(
            ".popup-window"
        )
        .classList
        .remove("image-mode");

    document
        .querySelector(
            ".popup-meta"
        )
        .style.display =
        "grid";

    document
        .getElementById(
            "popupQuote"
        )
        .style.display =
        "block";
        
}