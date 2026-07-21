/* ========================================
   EDITOR DE IMÁGENES
   Gran Siniestra
======================================== */

/* ========================================
   CONFIGURACIÓN
======================================== */

const ZOOM_MAXIMO = 8;

class ImageEditor{

    constructor(config){

        this.preview =
            document.querySelector(config.preview);

        this.imagen =
            document.querySelector(config.imagen);

        this.zoom =
            document.querySelector(config.zoom);

        this.reset =
            document.querySelector(config.reset);

        this.estado = {

            posX:0,
            posY:0,
            scale:1

        };

        this.posX = 0;
        this.posY = 0;
        this.scale = 1;

        this.arrastrando = false;

        this.inicioX = 0;
        this.inicioY = 0;

        this.inicializar();

    }

inicializar(){

    console.log(
        "Editor creado:",
        this.preview
    );

    this.preview.addEventListener(
        "mousedown",
        this.iniciarDrag.bind(this)
    );

    document.addEventListener(
        "mousemove",
        this.moverDrag.bind(this)
    );

    document.addEventListener(
        "mouseup",
        this.finalizarDrag.bind(this)
    );

this.zoom.addEventListener(
    "input",
    ()=>{

        const escalaAnterior =
            this.scale;

        this.scale =
            Number(this.zoom.value);

        const factor =
            this.scale / escalaAnterior;

        const anchoMarco =
            this.preview.clientWidth;

        const altoMarco =
            this.preview.clientHeight;

        this.posX =
            (this.posX - anchoMarco / 2)
            * factor
            + anchoMarco / 2;

        this.posY =
            (this.posY - altoMarco / 2)
            * factor
            + altoMarco / 2;

        this.actualizarTransform();

    }
);

}

iniciarDrag(e){

    e.preventDefault();

    this.arrastrando = true;

    this.inicioX = e.clientX;
    this.inicioY = e.clientY;

}

moverDrag(e){

    if(!this.arrastrando)
        return;

    const dx =
        e.clientX - this.inicioX;

    const dy =
        e.clientY - this.inicioY;

    this.inicioX = e.clientX;
    this.inicioY = e.clientY;

this.posX += dx;
this.posY += dy;

    this.actualizarTransform();

}

finalizarDrag(){

    this.arrastrando = false;

}

actualizarTransform(){

    this.limitarMovimiento();

    this.estado.posX =
        this.posX;

    this.estado.posY =
        this.posY;

    this.estado.scale =
        this.scale;

    this.imagen.style.transform = `
        translate(
            ${this.posX}px,
            ${this.posY}px
        )
        scale(${this.scale})
    `;

}

limitarMovimiento(){

    const anchoMarco =
        this.preview.clientWidth;

    const altoMarco =
        this.preview.clientHeight;

    const anchoImagen =
        this.imagen.naturalWidth * this.scale;

    const altoImagen =
        this.imagen.naturalHeight * this.scale;

    const minX =
        Math.min(
            0,
            anchoMarco - anchoImagen
        );

    const minY =
        Math.min(
            0,
            altoMarco - altoImagen
        );

    this.posX = Math.max(
        minX,
        Math.min(
            0,
            this.posX
        )
    );

    this.posY = Math.max(
        minY,
        Math.min(
            0,
            this.posY
        )
    );

}

centrarImagen(){

    const anchoMarco =
        this.preview.clientWidth;

    const altoMarco =
        this.preview.clientHeight;

    const anchoNatural =
        this.imagen.naturalWidth;

    const altoNatural =
        this.imagen.naturalHeight;

    const escalaBase =
        Math.max(
            anchoMarco / anchoNatural,
            altoMarco / altoNatural
        );

this.scale = escalaBase;

/* El mínimo del slider será el zoom mínimo calculado */
this.zoom.min = escalaBase;

/* Permitimos hacer hasta 4 veces más zoom que el mínimo */
this.zoom.max =
    escalaBase * ZOOM_MAXIMO;

/* Paso más fino */
this.zoom.step = 0.01;

/* El slider empieza exactamente en el zoom mínimo */
this.zoom.value = escalaBase;

    this.posX =
        (anchoMarco - anchoNatural * escalaBase) / 2;

    this.posY =
        (altoMarco - altoNatural * escalaBase) / 2;

    this.actualizarTransform();

}

cargarEstado(posX,posY,scale){

    if(
        posX === undefined ||
        posY === undefined ||
        scale === undefined
    ){
        return;
    }

    this.posX = posX;
    this.posY = posY;
    this.scale = scale;

    this.zoom.value = scale;

    this.actualizarTransform();

}

}

const editorPanel =
new ImageEditor({

    preview:
        ".preview-panel",

    imagen:
        ".preview-panel-imagen",

    zoom:
        "#zoom-panel",

    reset:
        ".preview-panel .preview-reset"

});

const editorCard =
new ImageEditor({

    preview:
        ".preview-card",

    imagen:
        ".preview-card-imagen",

    zoom:
        "#zoom-card",

    reset:
        ".preview-card .preview-reset"

});

/* ========================================
   PREVIEW DE IMAGEN
======================================== */

const inputProyecto =
document.getElementById(
    "ev-imagen-proyecto"
);

const inputURL =
document.getElementById(
    "ev-imagen-url"
);

const inputSubida =
document.getElementById(
    "ev-imagen-subida"
);

function actualizarPreviewImagen(){

    let ruta = "";

    switch(origenImagen.value){

        case "proyecto":

            ruta =
                inputProyecto.value.trim();

            break;

        case "url":

            ruta =
                inputURL.value.trim();

            break;

        case "subida":

            if(
                inputSubida.files.length
            ){

                ruta =
                    URL.createObjectURL(
                        inputSubida.files[0]
                    );

            }

            break;

    }

editorPanel.imagen.onload = ()=>{

    if(editorPanel.estado.scale === 1){

        editorPanel.centrarImagen();

    }else{

        editorPanel.cargarEstado(

            editorPanel.estado.posX,
            editorPanel.estado.posY,
            editorPanel.estado.scale

        );

    }

};

editorCard.imagen.onload = ()=>{

    if(editorCard.estado.scale === 1){

        editorCard.centrarImagen();

    }else{

        editorCard.cargarEstado(

            editorCard.estado.posX,
            editorCard.estado.posY,
            editorCard.estado.scale

        );

    }

};

editorPanel.imagen.src = ruta;
editorCard.imagen.src = ruta;

}

inputProyecto.addEventListener(
    "input",
    actualizarPreviewImagen
);

inputURL.addEventListener(
    "input",
    actualizarPreviewImagen
);

inputSubida.addEventListener(
    "change",
    actualizarPreviewImagen
);