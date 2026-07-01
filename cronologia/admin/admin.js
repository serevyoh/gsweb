const modoRelato =
    document.getElementById(
        "modoRelato"
    );

modoRelato.addEventListener(
    "change",
    cambiarModoRelato
);

function cambiarModoRelato() {

    const html =
        document.getElementById(
            "bloqueHtml"
        );

    const integrado =
        document.getElementById(
            "bloqueIntegrado"
        );

    if (
        modoRelato.value
        ===
        "html"
    ) {

        html.classList.remove(
            "oculto"
        );

        integrado.classList.add(
            "oculto"
        );

    }

    else {

        html.classList.add(
            "oculto"
        );

        integrado.classList.remove(
            "oculto"
        );

    }
}
function crearInputSimple(
    contenedorId
) {

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "item-dinamico";

    div.innerHTML = `
        <input type="text">
    `;

    document
        .getElementById(
            contenedorId
        )
        .appendChild(div);
}

function crearReino() {

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "item-dinamico";

    div.innerHTML = `
        <input
            placeholder="Nombre">

        <input
            placeholder="Escudo">
    `;

    document
        .getElementById(
            "reinos"
        )
        .appendChild(div);
}

function crearPersonaje() {

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "item-dinamico";

    div.innerHTML = `
        <input
            placeholder="Nombre">

        <input
            placeholder="Imagen">
    `;

    document
        .getElementById(
            "personajes"
        )
        .appendChild(div);
}
function cargarLugares(lista) {

    document
        .getElementById(
            "lugares"
        )
        .innerHTML = "";

    lista.forEach(lugar => {

        crearInputSimple(
            "lugares"
        );

        const inputs =
            document.querySelectorAll(
                "#lugares input"
            );

        inputs[
            inputs.length - 1
        ].value = lugar;

    });
}

function cargarConsecuencias(lista) {

    document
        .getElementById(
            "consecuencias"
        )
        .innerHTML = "";

    lista.forEach(c => {

        crearInputSimple(
            "consecuencias"
        );

        const inputs =
            document.querySelectorAll(
                "#consecuencias input"
            );

        inputs[
            inputs.length - 1
        ].value = c;

    });
}

function cargarConsecuenciasDestacadas(lista) {

    document
        .getElementById(
            "consecuenciasDestacadas"
        )
        .innerHTML = "";

    lista.forEach(c => {

        crearInputSimple(
            "consecuenciasDestacadas"
        );

        const inputs =
            document.querySelectorAll(
                "#consecuenciasDestacadas input"
            );

        inputs[
            inputs.length - 1
        ].value = c;

    });
}

function cargarReinos(lista) {

    document
        .getElementById(
            "reinos"
        )
        .innerHTML = "";

    lista.forEach(reino => {

        crearReino();

        const ultimo =
            document
                .querySelector(
                    "#reinos .item-dinamico:last-child"
                );

        const inputs =
            ultimo.querySelectorAll(
                "input"
            );

        inputs[0].value =
            reino.nombre || "";

        inputs[1].value =
            reino.escudo || "";

    });
}

function cargarPersonajes(lista) {

    document
        .getElementById(
            "personajes"
        )
        .innerHTML = "";

    lista.forEach(personaje => {

        crearPersonaje();

        const ultimo =
            document
                .querySelector(
                    "#personajes .item-dinamico:last-child"
                );

        const inputs =
            ultimo.querySelectorAll(
                "input"
            );

        inputs[0].value =
            personaje.nombre || "";

        inputs[1].value =
            personaje.imagen || "";

    });
}
document
    .getElementById(
        "addLugar"
    )
    .onclick =
    () =>
    crearInputSimple(
        "lugares"
    );

document
    .getElementById(
        "addConsecuencia"
    )
    .onclick =
    () =>
    crearInputSimple(
        "consecuencias"
    );

document
    .getElementById(
        "addConsecuenciaDestacada"
    )
    .onclick =
    () =>
    crearInputSimple(
        "consecuenciasDestacadas"
    );

document
    .getElementById(
        "addReino"
    )
    .onclick =
    crearReino;

document
    .getElementById(
        "addPersonaje"
    )
    .onclick =
    crearPersonaje;

const botonGenerar =
    document.getElementById(
        "generar"
    );

const resultado =
    document.getElementById(
        "resultado"
    );

botonGenerar.addEventListener(
    "click",
    () => {

        const evento = {

            id: Date.now(),

            era:
                document
                    .getElementById(
                        "era"
                    )
                    .value,

            titulo:
                document
                    .getElementById(
                        "titulo"
                    )
                    .value,

            inicio:
                Number(
                    document
                        .getElementById(
                            "inicio"
                        )
                        .value
                ),

            fin:
                Number(
                    document
                        .getElementById(
                            "fin"
                        )
                        .value
                ),

            tipo:
                document
                    .getElementById(
                        "tipo"
                    )
                    .value,

            color:
                document
                    .getElementById(
                        "color"
                    )
                    .value,

            imagen:
                document
                    .getElementById(
                        "imagen"
                    )
                    .value,

            descripcion:
                document
                    .getElementById(
                        "descripcion"
                    )
                    .value,

...(modoRelato.value === "html"
    ? {
        textoArchivo:
        document
            .getElementById(
                "textoArchivo"
            )
            .value
    }
    : {
        textoCompleto:
        document
            .getElementById(
                "editorRelato"
            )
            .innerHTML
    }),
            lugares:
    Array.from(
        document.querySelectorAll(
            "#lugares input"
        )
    )
    .map(i => i.value)
    .filter(v => v),

consecuencias:
    Array.from(
        document.querySelectorAll(
            "#consecuencias input"
        )
    )
    .map(i => i.value)
    .filter(v => v),

consecuenciasDestacadas:
    Array.from(
        document.querySelectorAll(
            "#consecuenciasDestacadas input"
        )
    )
    .map(i => i.value)
    .filter(v => v),

reinos:
    Array.from(
        document.querySelectorAll(
            "#reinos .item-dinamico"
        )
    )
    .map(div => {

        const inputs =
            div.querySelectorAll(
                "input"
            );

        return {

            nombre:
                inputs[0].value,

            escudo:
                inputs[1].value

        };

    })
    .filter(r => r.nombre),

personajes:
    Array.from(
        document.querySelectorAll(
            "#personajes .item-dinamico"
        )
    )
    .map(div => {

        const inputs =
            div.querySelectorAll(
                "input"
            );

        return {

            nombre:
                inputs[0].value,

            imagen:
                inputs[1].value

        };

    })
    .filter(p => p.nombre)
        };

        resultado.value =
            JSON.stringify(
                evento,
                null,
                4
            );

    }
);
function importarEvento() {

    const texto =
        document
            .getElementById(
                "importador"
            )
            .value;

    const evento =
        JSON.parse(texto);

    document
        .getElementById(
            "titulo"
        )
        .value =
        evento.titulo || "";

    document
        .getElementById(
            "era"
        )
        .value =
        evento.era || "actual";

    document
        .getElementById(
            "inicio"
        )
        .value =
        evento.inicio || "";

    document
        .getElementById(
            "fin"
        )
        .value =
        evento.fin || "";

    document
        .getElementById(
            "tipo"
        )
        .value =
        evento.tipo || "";

    document
        .getElementById(
            "color"
        )
        .value =
        evento.color || "#7a1f1f";

    document
        .getElementById(
            "imagen"
        )
        .value =
        evento.imagen || "";

    document
        .getElementById(
            "descripcion"
        )
        .value =
        evento.descripcion || "";

    if (evento.textoArchivo) {

    document
        .getElementById(
            "modoRelato"
        )
        .value = "html";

    cambiarModoRelato();

    document
        .getElementById(
            "textoArchivo"
        )
        .value =
        evento.textoArchivo;

}

else if (
    evento.textoCompleto
) {

    document
        .getElementById(
            "modoRelato"
        )
        .value =
        "integrado";

    cambiarModoRelato();

    document
    .getElementById(
        "editorRelato"
    )
    .innerHTML =
    evento.textoCompleto;

}

    cargarLugares(
        evento.lugares || []
    );

    cargarConsecuencias(
        evento.consecuencias || []
    );

    cargarConsecuenciasDestacadas(
        evento.consecuenciasDestacadas || []
    );

    cargarReinos(
        evento.reinos || []
    );

    cargarPersonajes(
        evento.personajes || []
    );
}
document
    .getElementById(
        "importar"
    )
    .addEventListener(
        "click",
        importarEvento
    );
    function formato(tipo) {

    document.execCommand(
        tipo,
        false,
        null
    );
}

function tituloH2() {

    document.execCommand(
        "formatBlock",
        false,
        "h2"
    );
}

function centrarTexto() {

    document.execCommand(
        "justifyCenter",
        false,
        null
    );
}

function insertarSeparador() {

    document.execCommand(
        "insertHorizontalRule",
        false,
        null
    );
}
function tituloH1() {

    document.execCommand(
        "formatBlock",
        false,
        "h1"
    );
}

function tituloH3() {

    document.execCommand(
        "formatBlock",
        false,
        "h3"
    );
}

function insertarCita() {

    document.execCommand(
        "formatBlock",
        false,
        "blockquote"
    );
}

function insertarLista() {

    document.execCommand(
        "insertUnorderedList",
        false,
        null
    );
}

function insertarTituloRelato() {

    const texto =
        window.getSelection()
        .toString();

    if (!texto) return;

    document.execCommand(
        "insertHTML",
        false,
        `<div class="relato-titulo">
            ${texto}
        </div>`
    );
}

function insertarFraseFinal() {

    const texto =
        window.getSelection()
        .toString();

    if (!texto) return;

    document.execCommand(
        "insertHTML",
        false,
        `<div class="frase-final">
            ${texto}
        </div>`
    );
}