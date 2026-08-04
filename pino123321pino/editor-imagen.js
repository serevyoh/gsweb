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

        this.posX = 0;
        this.posY = 0;
        this.scale = 1;

        /* El zoom mínimo (la imagen justo ajustada al recuadro,
           el equivalente a background-size:cover) y el zoom
           relativo actual (scale / escalaBase). Se guardan para
           poder reconstruir el mismo encuadre en un contenedor
           distinto al del editor (el avatar circular). */
        this.escalaBase = 1;
        this.escalaRelativa = 1;

        /* El último encuadre válido (en %), que se conserva
           aunque el apartado "Imagen" esté oculto (con
           display:none los clientWidth/clientHeight del
           recuadro valen 0 y no se pueden recalcular). */
        this.porcentajeX = "50%";
        this.porcentajeY = "50%";

        /* Cuando la imagen carga o se pide cargar un encuadre
           mientras el apartado está oculto, se guarda aquí
           que falta por aplicar; al abrir el apartado se
           vuelve a llamar a aplicarPosicionPendiente(). */
        this.posPendiente = false;

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

    this.reset.addEventListener(
        "click",
        () => this.centrarImagen()
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

    this.imagen.style.transform = `
        translate(
            ${this.posX}px,
            ${this.posY}px
        )
        scale(${this.scale})
    `;

    /* Cada vez que cambia el encuadre se recuerda el
       porcentaje resultante, para poder guardarlo sin depender
       de que el recuadro esté visible en ese momento. */
    this.guardarPorcentajes();

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

    /* Si el apartado está oculto el recuadro no tiene tamaño
       (clientWidth/clientHeight valen 0) y no se puede calcular
       el encuadre: se deja el centro como valor por defecto y
       se aplica cuando el apartado vuelva a ser visible. */
    if (
        anchoMarco <= 0 ||
        altoMarco <= 0
    ) {

        this.porcentajeX = "50%";
        this.porcentajeY = "50%";

        this.posPendiente = true;

        return;

    }

    const anchoNatural =
        this.imagen.naturalWidth;

    const altoNatural =
        this.imagen.naturalHeight;

    const escalaBase =
        Math.max(
            anchoMarco / anchoNatural,
            altoMarco / altoNatural
        );

this.escalaBase = escalaBase;

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

/* Convierte la posición/zoom actuales del editor en el
   formato que usa CSS (background-position en %) para poder
   guardarlo y reutilizarlo en CUALQUIER contenedor, no solo
   en este editor — la tarjeta y el panel de detalle tienen
   proporciones distintas al recuadro de este editor, así que
   guardar píxeles concretos no serviría de nada fuera de
   aquí. El porcentaje, en cambio, representa "qué punto de
   la imagen queda anclado" y se traduce razonablemente bien
   a cualquier proporción de contenedor.

   El cálculo necesita el tamaño real del recuadro, que vale 0
   cuando el apartado "Imagen" está oculto (display:none). En
   ese caso se devuelve el último encuadre válido que ya se
   había calculado, en vez de recalcular con un tamaño de 0
   (que sería lo que rompía la posición al guardar desde otra
   sección). */
guardarPorcentajes(){

    const anchoMarco =
        this.preview.clientWidth;

    const altoMarco =
        this.preview.clientHeight;

    if (
        anchoMarco <= 0 ||
        altoMarco <= 0
    ) {

        return {
            x: this.porcentajeX,
            y: this.porcentajeY
        };

    }

    const anchoImagen =
        this.imagen.naturalWidth * this.scale;

    const altoImagen =
        this.imagen.naturalHeight * this.scale;

    const excesoX = anchoImagen - anchoMarco;
    const excesoY = altoImagen - altoMarco;

    const porcentajeX =
        excesoX > .5
            ? (-this.posX / excesoX) * 100
            : 50;

    const porcentajeY =
        excesoY > .5
            ? (-this.posY / excesoY) * 100
            : 50;

    const resultado = {
        x: Math.max(0, Math.min(100, porcentajeX)).toFixed(1) + "%",
        y: Math.max(0, Math.min(100, porcentajeY)).toFixed(1) + "%"
    };

    this.porcentajeX = resultado.x;
    this.porcentajeY = resultado.y;

    return resultado;

}

obtenerFondoCSS(){

    return this.guardarPorcentajes();

}

/* Zoom relativo al cover: 1 = la imagen justa para llenar el
   recuadro. Se guarda junto a la posición en % para poder
   aplicar el mismo encuadre en el avatar circular, que tiene
   el mismo tamaño que el recuadro de este editor. */
obtenerEscalaRelativa(){

    return this.escalaBase
        ? this.scale / this.escalaBase
        : 1;

}

/* La operación inversa: a partir de un porcentaje guardado,
   recoloca la imagen dentro de ESTE editor (con las
   dimensiones que tenga en este momento). Se usa al abrir
   "Editar evento" en un evento que ya tenía una posición
   guardada. */
cargarFondoCSS(porcentajeX, porcentajeY, escalaRelativa){

    if (
        porcentajeX === undefined ||
        porcentajeY === undefined
    ){

        this.escalaRelativa = 1;
        this.centrarImagen();
        return;

    }

    this.porcentajeX = String(porcentajeX);
    this.porcentajeY = String(porcentajeY);

    this.escalaRelativa =
        (typeof escalaRelativa === "number" && escalaRelativa > 0)
            ? escalaRelativa
            : 1;

    this.aplicarTransformDesdePorcentaje();

}

/* Traduce el porcentaje guardado a la posición (en píxeles)
   dentro del recuadro actual. Si el recuadro está oculto o la
   imagen todavía no ha cargado, se queda pendiente y se aplica
   en cuanto el apartado sea visible (aplicarPosicionPendiente). */
aplicarTransformDesdePorcentaje(){

    const anchoMarco =
        this.preview.clientWidth;

    const altoMarco =
        this.preview.clientHeight;

    if (
        anchoMarco <= 0 ||
        altoMarco <= 0 ||
        !this.imagen.naturalWidth
    ) {

        this.posPendiente = true;

        return;

    }

    this.posPendiente = false;

    /* Se capturan los porcentajes guardados ANTES de centrar,
       porque centrarImagen() recalcula y sobrescribiría el
       valor (lo deja en el centro). */
    const px = parseFloat(this.porcentajeX) || 50;
    const py = parseFloat(this.porcentajeY) || 50;

    /* Se parte del centro (zoom base) y desde ahí se desplaza
       según el porcentaje guardado. */
    this.centrarImagen();

    /* Si se guardó un zoom relativo (recuadro circular del
       avatar), se aplica al zoom base antes de calcular la
       posición, para que el porcentaje vuelva a encajar. */
    const escalaRelativa =
        this.escalaRelativa || 1;

    if (escalaRelativa !== 1){

        this.scale =
            this.scale * escalaRelativa;

        this.zoom.value = this.scale;

    }

    const anchoImagen =
        this.imagen.naturalWidth * this.scale;

    const altoImagen =
        this.imagen.naturalHeight * this.scale;

    const excesoX = anchoImagen - anchoMarco;
    const excesoY = altoImagen - altoMarco;

    this.posX = excesoX > 0 ? -(excesoX * px / 100) : 0;
    this.posY = excesoY > 0 ? -(excesoY * py / 100) : 0;

    this.actualizarTransform();

}

/* Se llama cada vez que se abre un apartado del editor: si
   quedó pendiente un encuadre por aplicar (porque la imagen
   cargó con el apartado oculto), se aplica ahora que el
   recuadro ya tiene tamaño real. */
aplicarPosicionPendiente(){

    if (!this.posPendiente)
        return;

    this.aplicarTransformDesdePorcentaje();

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

    if(
        eventoEditando &&
        eventoEditando.imagenPosX !== undefined
    ){

        editorPanel.cargarFondoCSS(
            eventoEditando.imagenPosX,
            eventoEditando.imagenPosY
        );

    }else{

        editorPanel.centrarImagen();

    }

};

editorCard.imagen.onload = ()=>{

    if(
        eventoEditando &&
        eventoEditando.cardPosX !== undefined
    ){

        editorCard.cargarFondoCSS(
            eventoEditando.cardPosX,
            eventoEditando.cardPosY
        );

    }else{

        editorCard.centrarImagen();

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