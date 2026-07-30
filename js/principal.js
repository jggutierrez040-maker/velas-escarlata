/* =====================================================
   VELAS ESCARLATA
   Transición de la introducción a la página principal
   ===================================================== */

"use strict";

const botonDescubrir = document.querySelector(".boton-descubrir");
const introduccion = document.querySelector(".introduccion");
const ambiente = document.querySelector(".ambiente");
const escenasRelato = Array.from(document.querySelectorAll(".escena-relato"));
const mensajesRelato = Array.from(document.querySelectorAll(".mensaje-relato"));
const indicadoresRelato = Array.from(document.querySelectorAll(".indicador-relato"));
const introduccionFinal = document.querySelector(".introduccion-final");
const botonOmitirRelato = document.querySelector(".boton-omitir-relato");
const botonRepetirRelato = document.querySelector(".boton-repetir-relato");
const paginaPrincipal = document.querySelector("#pagina-principal");
const cabeceraPrincipal = document.querySelector(".cabecera-principal");
const botonMenu = document.querySelector(".boton-menu");
const navegacionPrincipal = document.querySelector(".navegacion-principal");
const enlaceSaltar = document.querySelector(".enlace-saltar");
const inicioPrincipal = document.querySelector("#inicio");
const tituloInicioPrincipal = document.querySelector("#titulo-bienvenida");

/* Secuencia visual que presenta cuatro momentos antes de revelar la marca. */
const DURACION_ESCENA_RELATO = 3150;
let temporizadoresRelato = [];

const limpiarTemporizadoresRelato = () => {
    temporizadoresRelato.forEach((temporizador) => {
        window.clearTimeout(temporizador);
    });
    temporizadoresRelato = [];
};

const activarEscenaRelato = (indiceActivo) => {
    escenasRelato.forEach((escena, indice) => {
        escena.classList.toggle("activa", indice === indiceActivo);
    });

    mensajesRelato.forEach((mensaje, indice) => {
        mensaje.classList.toggle("activo", indice === indiceActivo);
    });

    indicadoresRelato.forEach((indicador, indice) => {
        indicador.classList.toggle("completado", indice < indiceActivo);
        indicador.classList.toggle("activo", indice === indiceActivo);
    });

    if (introduccion) {
        introduccion.dataset.escenaActiva = String(indiceActivo + 1);
    }
};

const mostrarFinalRelato = () => {
    if (!introduccion || !introduccionFinal || !botonDescubrir) {
        return;
    }

    limpiarTemporizadoresRelato();
    introduccion.classList.add("relato-finalizado");
    introduccionFinal.setAttribute("aria-hidden", "false");
    botonDescubrir.disabled = false;

    if (botonRepetirRelato) {
        botonRepetirRelato.disabled = false;
    }

    if (botonOmitirRelato) {
        botonOmitirRelato.hidden = true;
    }

    indicadoresRelato.forEach((indicador) => {
        indicador.classList.remove("activo");
        indicador.classList.add("completado");
    });
};

const iniciarRelato = () => {
    if (
        !introduccion
        || escenasRelato.length === 0
        || escenasRelato.length !== mensajesRelato.length
    ) {
        mostrarFinalRelato();
        return;
    }

    limpiarTemporizadoresRelato();
    introduccion.classList.remove("relato-finalizado");

    if (introduccionFinal) {
        introduccionFinal.setAttribute("aria-hidden", "true");
    }

    if (botonDescubrir) {
        botonDescubrir.disabled = true;
    }

    if (botonRepetirRelato) {
        botonRepetirRelato.disabled = true;
    }

    if (botonOmitirRelato) {
        botonOmitirRelato.hidden = false;
    }

    activarEscenaRelato(0);

    escenasRelato.slice(1).forEach((escena, indice) => {
        const indiceEscena = indice + 1;
        temporizadoresRelato.push(window.setTimeout(() => {
            activarEscenaRelato(indiceEscena);
        }, DURACION_ESCENA_RELATO * indiceEscena));
    });

    temporizadoresRelato.push(window.setTimeout(
        mostrarFinalRelato,
        DURACION_ESCENA_RELATO * escenasRelato.length
    ));
};

if (
    introduccion
    && escenasRelato.length > 0
    && introduccionFinal
    && botonDescubrir
) {
    const reducirMovimientoRelato = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    let relatoIniciado = false;
    const comenzarRelato = () => {
        if (relatoIniciado) {
            return;
        }

        relatoIniciado = true;

        if (reducirMovimientoRelato) {
            mostrarFinalRelato();
        } else {
            iniciarRelato();
        }
    };
    const primeraImagenRelato = escenasRelato[0].querySelector("img");

    if (!primeraImagenRelato || primeraImagenRelato.complete) {
        comenzarRelato();
    } else {
        primeraImagenRelato.addEventListener("load", comenzarRelato, { once: true });
        window.setTimeout(comenzarRelato, 1400);
    }

    botonOmitirRelato?.addEventListener("click", mostrarFinalRelato);
    botonRepetirRelato?.addEventListener("click", iniciarRelato);
}

/* Construcción, búsqueda y carga progresiva del catálogo completo. */
const cuadriculaProductos = document.querySelector(".cuadricula-productos");
const campoBusquedaProductos = document.querySelector("#busqueda-productos");
const filtroCategoria = document.querySelector("#filtro-categoria");
const ordenCatalogo = document.querySelector("#orden-catalogo");
const contadorProductos = document.querySelector(".contador-productos");
const botonLimpiarHerramientas = document.querySelector(".boton-limpiar-herramientas");
const estadoCatalogo = document.querySelector(".estado-catalogo");
const botonRestablecerCatalogo = document.querySelector(".boton-restablecer-catalogo");
const accionesCargaCatalogo = document.querySelector(".acciones-carga-catalogo");
const botonMostrarMas = document.querySelector(".boton-mostrar-mas");
const botonMostrarMenos = document.querySelector(".boton-mostrar-menos");
const catalogoCompleto = window.CATALOGO_VELAS_ESCARLATA || [];
const CANTIDAD_POR_PAGINA = 9;
let cantidadVisible = CANTIDAD_POR_PAGINA;

/* Año automático del pie de página. */
const anioActual = document.querySelector("#anio-actual");

if (anioActual) {
    anioActual.textContent = new Date().getFullYear();
}

const normalizarTexto = (texto) => texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const escaparHTML = (texto) => texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

let obtenerNombresSeleccionadosCatalogo = () => new Set();

const actualizarEstadosSeleccionCatalogo = () => {
    const nombresSeleccionados = obtenerNombresSeleccionadosCatalogo();

    document.querySelectorAll(".tarjeta-producto").forEach((tarjeta) => {
        const estaSeleccionado = nombresSeleccionados.has(
            tarjeta.dataset.producto
        );
        const indicador = tarjeta.querySelector(".estado-producto-seleccion");

        tarjeta.classList.toggle("en-seleccion", estaSeleccionado);

        if (indicador) {
            indicador.hidden = !estaSeleccionado;
        }
    });
};

const crearTarjetaProducto = (producto, indice) => {
    const descripcion = producto.descripcion
        || `Una pieza decorativa artesanal de nuestra colección ${producto.categoria.toLowerCase()}.`;

    return `
        <article
            class="tarjeta-producto"
            data-producto="${escaparHTML(producto.nombre)}"
            data-descripcion="${escaparHTML(descripcion)}"
        >
            <figure class="imagen-producto">
                <img
                    src="imagenes/productos/${escaparHTML(producto.archivo)}"
                    alt="Vela artesanal modelo ${escaparHTML(producto.nombre)}"
                    loading="lazy"
                    decoding="async"
                >
                <span class="estado-producto-seleccion" hidden>
                    <span aria-hidden="true">✓</span>
                    En selección
                </span>
                <span class="numero-producto" aria-hidden="true">
                    ${String(indice + 1).padStart(2, "0")}
                </span>
            </figure>

            <div class="informacion-producto">
                <p class="categoria-producto">${escaparHTML(producto.categoria)}</p>
                <h3>${escaparHTML(producto.nombre)}</h3>
                <p class="descripcion-tarjeta">Pieza decorativa artesanal</p>
                <button class="boton-ver-producto" type="button">
                    Ver detalles <span aria-hidden="true">→</span>
                </button>
            </div>
        </article>
    `;
};

const renderizarCatalogo = () => {
    if (
        !cuadriculaProductos
        || !campoBusquedaProductos
        || !filtroCategoria
        || !ordenCatalogo
        || catalogoCompleto.length === 0
    ) {
        return;
    }

    const termino = normalizarTexto(campoBusquedaProductos.value.trim());
    const categoriaSeleccionada = filtroCategoria.value;
    const ordenSeleccionado = ordenCatalogo.value;
    const productosFiltrados = catalogoCompleto.filter((producto) => {
        const contenido = normalizarTexto(`${producto.nombre} ${producto.categoria}`);
        const coincideBusqueda = contenido.includes(termino);
        const coincideCategoria = !categoriaSeleccionada
            || producto.categoria === categoriaSeleccionada;

        return coincideBusqueda && coincideCategoria;
    });
    const productosOrdenados = [...productosFiltrados];

    if (ordenSeleccionado === "az" || ordenSeleccionado === "za") {
        productosOrdenados.sort((productoA, productoB) => {
            const comparacion = productoA.nombre.localeCompare(
                productoB.nombre,
                "es",
                { sensitivity: "base" }
            );

            return ordenSeleccionado === "az" ? comparacion : -comparacion;
        });
    }

    const productosVisibles = termino
        ? productosOrdenados
        : productosOrdenados.slice(0, cantidadVisible);

    cuadriculaProductos.innerHTML = productosVisibles
        .map((producto) => crearTarjetaProducto(producto, catalogoCompleto.indexOf(producto)))
        .join("");
    actualizarEstadosSeleccionCatalogo();

    if (termino) {
        contadorProductos.textContent = productosFiltrados.length === 1
            ? "1 pieza encontrada"
            : `${productosFiltrados.length} piezas encontradas`;
    } else {
        contadorProductos.textContent = `Mostrando ${productosVisibles.length} de ${productosFiltrados.length} piezas`;
    }

    estadoCatalogo.hidden = productosFiltrados.length > 0;
    botonMostrarMas.hidden = Boolean(termino)
        || productosVisibles.length >= productosFiltrados.length;
    botonMostrarMenos.hidden = Boolean(termino)
        || cantidadVisible <= CANTIDAD_POR_PAGINA
        || productosVisibles.length <= CANTIDAD_POR_PAGINA;
    accionesCargaCatalogo.hidden = botonMostrarMas.hidden
        && botonMostrarMenos.hidden;
    botonLimpiarHerramientas.hidden = !(
        termino
        || categoriaSeleccionada
        || ordenSeleccionado !== "original"
    );
};

if (
    cuadriculaProductos
    && campoBusquedaProductos
    && filtroCategoria
    && ordenCatalogo
    && contadorProductos
    && botonLimpiarHerramientas
    && estadoCatalogo
    && botonRestablecerCatalogo
    && accionesCargaCatalogo
    && botonMostrarMas
    && botonMostrarMenos
    && catalogoCompleto.length > 0
) {
    const categorias = [...new Set(
        catalogoCompleto.map((producto) => producto.categoria)
    )].sort((categoriaA, categoriaB) => categoriaA.localeCompare(
        categoriaB,
        "es"
    ));

    categorias.forEach((categoria) => {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        filtroCategoria.append(opcion);
    });

    const restablecerHerramientasCatalogo = () => {
        campoBusquedaProductos.value = "";
        filtroCategoria.value = "";
        ordenCatalogo.value = "original";
        cantidadVisible = CANTIDAD_POR_PAGINA;
        renderizarCatalogo();
        campoBusquedaProductos.focus();
    };

    renderizarCatalogo();

    campoBusquedaProductos.addEventListener("input", () => {
        cantidadVisible = CANTIDAD_POR_PAGINA;
        renderizarCatalogo();
    });

    filtroCategoria.addEventListener("change", () => {
        cantidadVisible = CANTIDAD_POR_PAGINA;
        renderizarCatalogo();
    });

    ordenCatalogo.addEventListener("change", () => {
        cantidadVisible = CANTIDAD_POR_PAGINA;
        renderizarCatalogo();
    });

    botonMostrarMas.addEventListener("click", () => {
        cantidadVisible += CANTIDAD_POR_PAGINA;
        renderizarCatalogo();
    });

    botonMostrarMenos.addEventListener("click", () => {
        cantidadVisible = CANTIDAD_POR_PAGINA;
        renderizarCatalogo();

        window.requestAnimationFrame(() => {
            const seccionCatalogo = cuadriculaProductos.closest("#coleccion");
            const primerBotonProducto = cuadriculaProductos.querySelector(
                ".boton-ver-producto"
            );
            const reducirMovimiento = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            seccionCatalogo?.scrollIntoView({
                behavior: reducirMovimiento ? "auto" : "smooth",
                block: "start"
            });
            primerBotonProducto?.focus({ preventScroll: true });
        });
    });

    botonLimpiarHerramientas.addEventListener(
        "click",
        restablecerHerramientasCatalogo
    );

    botonRestablecerCatalogo.addEventListener(
        "click",
        restablecerHerramientasCatalogo
    );
}

/* Evita errores si alguno de los elementos no está disponible. */
if (botonDescubrir && introduccion && ambiente && paginaPrincipal) {
    const movimientoReducido = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    botonDescubrir.addEventListener("click", () => {
        limpiarTemporizadoresRelato();
        const duracionSalida = movimientoReducido ? 0 : 650;

        botonDescubrir.disabled = true;
        document.body.classList.add("transicionando");

        window.setTimeout(() => {
            /* Oculta la introducción después de completar su salida. */
            introduccion.hidden = true;
            introduccion.setAttribute("aria-hidden", "true");
            ambiente.hidden = true;

            /* Prepara y muestra la página principal. */
            paginaPrincipal.hidden = false;
            paginaPrincipal.setAttribute("aria-hidden", "false");

            document.body.classList.remove("transicionando");
            document.body.classList.add("pagina-activa");
            window.scrollTo(0, 0);

            /* Dos ciclos de renderizado permiten ejecutar la transición CSS. */
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    paginaPrincipal.classList.add("visible");
                    paginaPrincipal.focus({ preventScroll: true });

                    /* Mantiene la cabecera completamente visible tras mover el foco. */
                    window.scrollTo(0, 0);
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                });
            });
        }, duracionSalida);
    });
}

/* Transfiere el foco al contenido al utilizar el enlace para saltar la navegación. */
if (enlaceSaltar && inicioPrincipal && tituloInicioPrincipal) {
    enlaceSaltar.addEventListener("click", (evento) => {
        evento.preventDefault();
        window.setTimeout(() => {
            tituloInicioPrincipal.focus({ preventScroll: true });
            inicioPrincipal.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
                block: "start"
            });
        }, 0);
    });
}

/* Control accesible del menú para celulares y tablets. */
if (cabeceraPrincipal && botonMenu && navegacionPrincipal) {
    const cerrarMenu = (devolverFoco = false) => {
        cabeceraPrincipal.classList.remove("menu-abierto");
        botonMenu.setAttribute("aria-expanded", "false");
        botonMenu.setAttribute("aria-label", "Abrir menú");

        if (devolverFoco) {
            botonMenu.focus();
        }
    };

    botonMenu.addEventListener("click", () => {
        const menuEstaAbierto = cabeceraPrincipal.classList.toggle("menu-abierto");

        botonMenu.setAttribute("aria-expanded", String(menuEstaAbierto));
        botonMenu.setAttribute(
            "aria-label",
            menuEstaAbierto ? "Cerrar menú" : "Abrir menú"
        );
    });

    navegacionPrincipal.addEventListener("click", (evento) => {
        if (evento.target.closest("a")) {
            cerrarMenu();
        }
    });

    /* Cierra el menú si la persona toca o hace clic fuera de la cabecera. */
    document.addEventListener("click", (evento) => {
        const menuEstaAbierto = cabeceraPrincipal.classList.contains("menu-abierto");
        const clicDentroDeLaCabecera = cabeceraPrincipal.contains(evento.target);

        if (menuEstaAbierto && !clicDentroDeLaCabecera) {
            cerrarMenu();
        }
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && cabeceraPrincipal.classList.contains("menu-abierto")) {
            cerrarMenu(true);
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1100) {
            cerrarMenu();
        }
    });
}

/* Actualiza el enlace activo según la sección visible. */
const enlacesDeSeccion = [...document.querySelectorAll(
    '.enlace-navegacion[href^="#"]'
)];
const seccionesNavegables = enlacesDeSeccion
    .map((enlace) => document.querySelector(enlace.getAttribute("href")))
    .filter(Boolean);

const activarEnlaceDeSeccion = (idSeccion) => {
    enlacesDeSeccion.forEach((enlace) => {
        const corresponde = enlace.getAttribute("href") === `#${idSeccion}`;

        enlace.classList.toggle("activo", corresponde);

        if (corresponde) {
            enlace.setAttribute("aria-current", "location");
        } else {
            enlace.removeAttribute("aria-current");
        }
    });
};

enlacesDeSeccion.forEach((enlace) => {
    enlace.addEventListener("click", () => {
        activarEnlaceDeSeccion(enlace.getAttribute("href").slice(1));
    });
});

if ("IntersectionObserver" in window && seccionesNavegables.length > 0) {
    const observadorSecciones = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                activarEnlaceDeSeccion(entrada.target.id);
            }
        });
    }, {
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0
    });

    seccionesNavegables.forEach((seccion) => {
        observadorSecciones.observe(seccion);
    });
}

/* Selección persistente de productos para solicitar una cotización. */
const botonSeleccionFlotante = document.querySelector(".boton-seleccion-flotante");
const contadorSeleccion = document.querySelector(".contador-seleccion");
const panelSeleccion = document.querySelector("#panel-seleccion");
const listaSeleccion = document.querySelector(".lista-seleccion");
const seleccionVacia = document.querySelector(".seleccion-vacia");
const cantidadTotalSeleccion = document.querySelector(".cantidad-total-seleccion");
const botonVaciarSeleccion = document.querySelector(".boton-vaciar-seleccion");
const textoVaciarSeleccion = document.querySelector(".texto-vaciar-seleccion");
const botonEnviarSeleccion = document.querySelector(".boton-enviar-seleccion");
const botonCerrarSeleccion = document.querySelector(".boton-cerrar-seleccion");
const campoNotasSeleccion = document.querySelector(".campo-notas-seleccion");
const notasSeleccion = document.querySelector("#notas-seleccion");
const contadorNotasSeleccion = document.querySelector(".contador-notas-seleccion");
const botonVolverColeccion = document.querySelector(".boton-volver-coleccion");
const textoVolverColeccion = document.querySelector(".texto-volver-coleccion");
const seccionColeccion = document.querySelector("#coleccion");
const CLAVE_SELECCION = "velas-escarlata-seleccion";
const CLAVE_NOTAS_SELECCION = "velas-escarlata-notas-seleccion";
let seleccionProductos = [];
let agregarProductoASeleccion = () => {};

if (
    botonSeleccionFlotante
    && contadorSeleccion
    && panelSeleccion
    && listaSeleccion
    && seleccionVacia
    && cantidadTotalSeleccion
    && botonVaciarSeleccion
    && textoVaciarSeleccion
    && botonEnviarSeleccion
    && botonCerrarSeleccion
    && campoNotasSeleccion
    && notasSeleccion
    && contadorNotasSeleccion
    && botonVolverColeccion
    && textoVolverColeccion
    && seccionColeccion
) {
    try {
        const seleccionGuardada = JSON.parse(
            window.localStorage.getItem(CLAVE_SELECCION) || "[]"
        );

        if (Array.isArray(seleccionGuardada)) {
            seleccionProductos = seleccionGuardada.filter((producto) => (
                typeof producto.nombre === "string"
                && typeof producto.categoria === "string"
                && typeof producto.imagen === "string"
                && Number.isInteger(producto.cantidad)
                && producto.cantidad > 0
            ));
        }
    } catch (error) {
        seleccionProductos = [];
    }

    try {
        notasSeleccion.value = window.localStorage.getItem(
            CLAVE_NOTAS_SELECCION
        ) || "";
    } catch (error) {
        notasSeleccion.value = "";
    }

    obtenerNombresSeleccionadosCatalogo = () => new Set(
        seleccionProductos.map((producto) => producto.nombre)
    );

    const guardarSeleccion = () => {
        try {
            window.localStorage.setItem(
                CLAVE_SELECCION,
                JSON.stringify(seleccionProductos)
            );
        } catch (error) {
            /* La selección continúa funcionando aunque el almacenamiento falle. */
        }
    };

    const guardarNotasSeleccion = () => {
        try {
            window.localStorage.setItem(
                CLAVE_NOTAS_SELECCION,
                notasSeleccion.value
            );
        } catch (error) {
            /* Las notas siguen disponibles durante la visita actual. */
        }
    };

    let temporizadorConfirmacionVaciado;

    const restablecerConfirmacionVaciado = () => {
        window.clearTimeout(temporizadorConfirmacionVaciado);
        botonVaciarSeleccion.removeAttribute("data-confirmacion");
        botonVaciarSeleccion.setAttribute(
            "aria-label",
            "Vaciar toda la selección"
        );
        textoVaciarSeleccion.textContent = "Vaciar selección";
    };

    const renderizarSeleccion = () => {
        const cantidadTotal = seleccionProductos.reduce(
            (total, producto) => total + producto.cantidad,
            0
        );

        contadorSeleccion.textContent = cantidadTotal;
        cantidadTotalSeleccion.textContent = cantidadTotal;
        botonSeleccionFlotante.setAttribute(
            "aria-label",
            `Abrir selección de productos, ${cantidadTotal} ${cantidadTotal === 1 ? "pieza" : "piezas"}`
        );

        seleccionVacia.hidden = seleccionProductos.length > 0;
        listaSeleccion.hidden = seleccionProductos.length === 0;
        campoNotasSeleccion.hidden = seleccionProductos.length === 0;
        botonVaciarSeleccion.hidden = seleccionProductos.length === 0;
        textoVolverColeccion.textContent = seleccionProductos.length > 0
            ? "Añadir más velas"
            : "Explorar colección";
        botonVolverColeccion.setAttribute(
            "aria-label",
            seleccionProductos.length > 0
                ? "Cerrar la selección y añadir más velas"
                : "Cerrar la selección y explorar la colección"
        );

        if (seleccionProductos.length === 0 && notasSeleccion.value) {
            notasSeleccion.value = "";
            guardarNotasSeleccion();
        }

        if (seleccionProductos.length === 0) {
            restablecerConfirmacionVaciado();
        }

        contadorNotasSeleccion.textContent = `${notasSeleccion.value.length}/300`;
        listaSeleccion.innerHTML = seleccionProductos.map((producto) => `
            <li class="item-seleccion">
                <img
                    src="${escaparHTML(producto.imagen)}"
                    alt="Vela ${escaparHTML(producto.nombre)}"
                    width="78"
                    height="92"
                    loading="lazy"
                    decoding="async"
                >
                <div class="datos-item-seleccion">
                    <small>${escaparHTML(producto.categoria)}</small>
                    <h3>${escaparHTML(producto.nombre)}</h3>
                    <div class="control-cantidad" aria-label="Cantidad de ${escaparHTML(producto.nombre)}">
                        <button
                            type="button"
                            data-accion="restar"
                            data-producto="${escaparHTML(producto.nombre)}"
                            aria-label="Restar una unidad de ${escaparHTML(producto.nombre)}"
                        >−</button>
                        <span>${producto.cantidad}</span>
                        <button
                            type="button"
                            data-accion="sumar"
                            data-producto="${escaparHTML(producto.nombre)}"
                            aria-label="Añadir una unidad de ${escaparHTML(producto.nombre)}"
                        >＋</button>
                    </div>
                </div>
                <button
                    class="boton-eliminar-seleccion"
                    type="button"
                    data-accion="eliminar"
                    data-producto="${escaparHTML(producto.nombre)}"
                    aria-label="Eliminar ${escaparHTML(producto.nombre)} de la selección"
                >×</button>
            </li>
        `).join("");

        if (seleccionProductos.length > 0) {
            const lineasProductos = seleccionProductos.map((producto) => (
                `- ${producto.cantidad} x ${producto.nombre}`
            ));
            const notas = notasSeleccion.value.trim();
            const mensajeSeleccion = [
                "Hola, quiero consultar disponibilidad y precio de estas velas:",
                "",
                ...lineasProductos,
                "",
                "También quisiera conocer las opciones de color y personalización disponibles.",
                ...(notas ? ["", "Notas de personalización:", notas] : [])
            ].join("\n");

            botonEnviarSeleccion.href = `https://wa.me/573193260863?text=${encodeURIComponent(mensajeSeleccion)}`;
            botonEnviarSeleccion.setAttribute("aria-disabled", "false");
            botonEnviarSeleccion.removeAttribute("tabindex");
        } else {
            botonEnviarSeleccion.href = "#";
            botonEnviarSeleccion.setAttribute("aria-disabled", "true");
            botonEnviarSeleccion.setAttribute("tabindex", "-1");
        }

        actualizarEstadosSeleccionCatalogo();
        guardarSeleccion();
    };

    const cerrarPanelSeleccion = () => {
        if (typeof panelSeleccion.close === "function") {
            panelSeleccion.close();
        } else {
            panelSeleccion.removeAttribute("open");
            document.body.classList.remove("modal-abierto");
            botonSeleccionFlotante.focus();
        }
    };

    agregarProductoASeleccion = (producto) => {
        const productoExistente = seleccionProductos.find(
            (item) => item.nombre === producto.nombre
        );

        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            seleccionProductos.push({ ...producto, cantidad: 1 });
        }

        renderizarSeleccion();
    };

    botonSeleccionFlotante.addEventListener("click", () => {
        document.body.classList.add("modal-abierto");

        if (typeof panelSeleccion.showModal === "function") {
            panelSeleccion.showModal();
        } else {
            panelSeleccion.setAttribute("open", "");
        }
    });

    botonCerrarSeleccion.addEventListener("click", cerrarPanelSeleccion);

    botonVolverColeccion.addEventListener("click", () => {
        cerrarPanelSeleccion();

        window.requestAnimationFrame(() => {
            const reducirMovimiento = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            seccionColeccion.scrollIntoView({
                behavior: reducirMovimiento ? "auto" : "smooth",
                block: "start"
            });

            if (campoBusquedaProductos) {
                campoBusquedaProductos.focus({ preventScroll: true });
            }
        });
    });

    panelSeleccion.addEventListener("click", (evento) => {
        if (evento.target === panelSeleccion) {
            cerrarPanelSeleccion();
        }
    });

    panelSeleccion.addEventListener("close", () => {
        document.body.classList.remove("modal-abierto");
        botonSeleccionFlotante.focus();
    });

    listaSeleccion.addEventListener("click", (evento) => {
        const boton = evento.target.closest("button[data-accion]");

        if (!boton) {
            return;
        }

        const producto = seleccionProductos.find(
            (item) => item.nombre === boton.dataset.producto
        );

        if (!producto) {
            return;
        }

        if (boton.dataset.accion === "sumar") {
            producto.cantidad += 1;
        }

        if (boton.dataset.accion === "restar" && producto.cantidad > 1) {
            producto.cantidad -= 1;
        }

        if (boton.dataset.accion === "eliminar") {
            seleccionProductos = seleccionProductos.filter(
                (item) => item.nombre !== producto.nombre
            );
        }

        renderizarSeleccion();
    });

    notasSeleccion.addEventListener("input", () => {
        guardarNotasSeleccion();
        renderizarSeleccion();
    });

    botonVaciarSeleccion.addEventListener("click", () => {
        if (botonVaciarSeleccion.dataset.confirmacion !== "pendiente") {
            botonVaciarSeleccion.dataset.confirmacion = "pendiente";
            botonVaciarSeleccion.setAttribute(
                "aria-label",
                "Confirmar que deseas vaciar toda la selección"
            );
            textoVaciarSeleccion.textContent = "Confirmar vaciado";

            temporizadorConfirmacionVaciado = window.setTimeout(
                restablecerConfirmacionVaciado,
                5000
            );
            return;
        }

        seleccionProductos = [];
        notasSeleccion.value = "";
        guardarNotasSeleccion();
        renderizarSeleccion();
        seleccionVacia.setAttribute("tabindex", "-1");
        seleccionVacia.focus();
    });

    renderizarSeleccion();
}

/* Ficha reutilizable de los productos de la colección. */
const modalProducto = document.querySelector("#modal-producto");

if (modalProducto && cuadriculaProductos) {
    const fotoModal = modalProducto.querySelector(".foto-modal-producto");
    const categoriaModal = modalProducto.querySelector(".categoria-modal-producto");
    const tituloModal = modalProducto.querySelector("#titulo-modal-producto");
    const descripcionModal = modalProducto.querySelector(".descripcion-modal-producto");
    const botonConsultar = modalProducto.querySelector(".boton-consultar-producto");
    const botonAgregarSeleccion = modalProducto.querySelector(".boton-agregar-seleccion");
    const botonProductoAnterior = modalProducto.querySelector(".boton-producto-anterior");
    const botonProductoSiguiente = modalProducto.querySelector(".boton-producto-siguiente");
    const posicionModalProducto = modalProducto.querySelector(".posicion-modal-producto");
    const botonCerrar = modalProducto.querySelector(".boton-cerrar-modal");
    let botonActivador = null;
    let productoActual = null;
    let tarjetasNavegacion = [];
    let indiceProductoActual = 0;

    const actualizarModalProducto = (tarjeta) => {
        const fotoProducto = tarjeta.querySelector(".imagen-producto img");
        const categoriaProducto = tarjeta.querySelector(".categoria-producto");
        const nombreProducto = tarjeta.querySelector("h3");
        const descripcionProducto = tarjeta.dataset.descripcion;

        indiceProductoActual = tarjetasNavegacion.indexOf(tarjeta);
        productoActual = {
            nombre: nombreProducto.textContent.trim(),
            categoria: categoriaProducto.textContent.trim(),
            imagen: fotoProducto.getAttribute("src")
        };
        fotoModal.src = fotoProducto.src;
        fotoModal.alt = fotoProducto.alt;
        categoriaModal.textContent = categoriaProducto.textContent;
        tituloModal.textContent = nombreProducto.textContent;
        descripcionModal.textContent = descripcionProducto;

        const mensaje = `Hola, quiero consultar disponibilidad de la vela ${nombreProducto.textContent}.`;
        botonConsultar.href = `https://wa.me/573193260863?text=${encodeURIComponent(mensaje)}`;
        botonAgregarSeleccion.classList.remove("agregado");
        botonAgregarSeleccion.innerHTML = "Añadir a mi selección <span aria-hidden=\"true\">＋</span>";

        const totalProductos = tarjetasNavegacion.length;
        const indiceAnterior = (indiceProductoActual - 1 + totalProductos) % totalProductos;
        const indiceSiguiente = (indiceProductoActual + 1) % totalProductos;
        const nombreAnterior = tarjetasNavegacion[indiceAnterior]
            ?.querySelector("h3").textContent.trim();
        const nombreSiguiente = tarjetasNavegacion[indiceSiguiente]
            ?.querySelector("h3").textContent.trim();

        posicionModalProducto.textContent = `${indiceProductoActual + 1} de ${totalProductos}`;
        botonProductoAnterior.disabled = totalProductos < 2;
        botonProductoSiguiente.disabled = totalProductos < 2;
        botonProductoAnterior.setAttribute(
            "aria-label",
            totalProductos < 2
                ? "No hay un producto anterior"
                : `Ver producto anterior: ${nombreAnterior}`
        );
        botonProductoSiguiente.setAttribute(
            "aria-label",
            totalProductos < 2
                ? "No hay un producto siguiente"
                : `Ver producto siguiente: ${nombreSiguiente}`
        );
    };

    const navegarProducto = (direccion) => {
        if (tarjetasNavegacion.length < 2) {
            return;
        }

        indiceProductoActual = (
            indiceProductoActual + direccion + tarjetasNavegacion.length
        ) % tarjetasNavegacion.length;
        actualizarModalProducto(tarjetasNavegacion[indiceProductoActual]);
    };

    const cerrarModalProducto = () => {
        if (typeof modalProducto.close === "function") {
            modalProducto.close();
        } else {
            modalProducto.removeAttribute("open");
            document.body.classList.remove("modal-abierto");

            if (botonActivador) {
                botonActivador.focus();
            }
        }
    };

    cuadriculaProductos.addEventListener("click", (evento) => {
        const boton = evento.target.closest(".boton-ver-producto");

        if (boton) {
            const tarjeta = boton.closest(".tarjeta-producto");
            botonActivador = boton;
            tarjetasNavegacion = Array.from(
                cuadriculaProductos.querySelectorAll(".tarjeta-producto")
            );
            actualizarModalProducto(tarjeta);

            document.body.classList.add("modal-abierto");

            if (typeof modalProducto.showModal === "function") {
                modalProducto.showModal();
            } else {
                modalProducto.setAttribute("open", "");
            }
        }
    });

    botonAgregarSeleccion.addEventListener("click", () => {
        if (!productoActual) {
            return;
        }

        agregarProductoASeleccion(productoActual);
        botonAgregarSeleccion.classList.add("agregado");
        botonAgregarSeleccion.innerHTML = "Añadida a tu selección <span aria-hidden=\"true\">✓</span>";
    });

    botonProductoAnterior.addEventListener("click", () => {
        navegarProducto(-1);
    });

    botonProductoSiguiente.addEventListener("click", () => {
        navegarProducto(1);
    });

    modalProducto.addEventListener("keydown", (evento) => {
        const etiquetaActiva = evento.target.tagName;

        if (
            tarjetasNavegacion.length < 2
            || ["INPUT", "TEXTAREA", "SELECT"].includes(etiquetaActiva)
            || evento.altKey
            || evento.ctrlKey
            || evento.metaKey
        ) {
            return;
        }

        if (evento.key === "ArrowLeft") {
            evento.preventDefault();
            navegarProducto(-1);
        }

        if (evento.key === "ArrowRight") {
            evento.preventDefault();
            navegarProducto(1);
        }

        if (evento.key === "Home") {
            evento.preventDefault();
            actualizarModalProducto(tarjetasNavegacion[0]);
        }

        if (evento.key === "End") {
            evento.preventDefault();
            actualizarModalProducto(
                tarjetasNavegacion[tarjetasNavegacion.length - 1]
            );
        }
    });

    botonCerrar.addEventListener("click", cerrarModalProducto);

    modalProducto.addEventListener("click", (evento) => {
        if (evento.target === modalProducto) {
            cerrarModalProducto();
        }
    });

    modalProducto.addEventListener("close", () => {
        document.body.classList.remove("modal-abierto");

        if (botonActivador) {
            botonActivador.focus();
        }
    });
}

/* Prepara una consulta personalizada y la envía a WhatsApp. */
const formularioContacto = document.querySelector("#formulario-contacto");

if (formularioContacto) {
    const nombreContacto = formularioContacto.querySelector("#nombre-contacto");
    const motivoContacto = formularioContacto.querySelector("#motivo-contacto");
    const mensajeContacto = formularioContacto.querySelector("#mensaje-contacto");
    const estadoFormulario = formularioContacto.querySelector("#estado-formulario");
    const camposContacto = [nombreContacto, motivoContacto, mensajeContacto];

    const limpiarErrorCampo = (campo) => {
        if (campo.getAttribute("aria-invalid") === "true") {
            campo.removeAttribute("aria-invalid");
            estadoFormulario.textContent = "";
        }
    };

    nombreContacto.addEventListener("input", () => {
        limpiarErrorCampo(nombreContacto);
    });

    motivoContacto.addEventListener("change", () => {
        limpiarErrorCampo(motivoContacto);
    });

    mensajeContacto.addEventListener("input", () => {
        limpiarErrorCampo(mensajeContacto);
    });

    const mostrarErrorFormulario = (campo, mensaje) => {
        camposContacto.forEach((campoContacto) => {
            campoContacto.removeAttribute("aria-invalid");
        });
        campo.setAttribute("aria-invalid", "true");
        estadoFormulario.textContent = mensaje;
        campo.focus();
    };

    formularioContacto.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const nombre = nombreContacto.value.trim();
        const motivo = motivoContacto.value;
        const mensaje = mensajeContacto.value.trim();

        if (nombre.length < 2) {
            mostrarErrorFormulario(
                nombreContacto,
                "Escribe tu nombre para continuar."
            );
            return;
        }

        if (!motivo) {
            mostrarErrorFormulario(
                motivoContacto,
                "Selecciona el tipo de consulta."
            );
            return;
        }

        if (mensaje.length < 10) {
            mostrarErrorFormulario(
                mensajeContacto,
                "Escribe un mensaje de al menos 10 caracteres."
            );
            return;
        }

        camposContacto.forEach((campo) => {
            campo.removeAttribute("aria-invalid");
        });

        const textoWhatsApp = [
            `Hola, soy ${nombre}.`,
            `Mi consulta es sobre ${motivo}.`,
            "",
            mensaje
        ].join("\n");
        const enlaceWhatsApp = `https://wa.me/573193260863?text=${encodeURIComponent(textoWhatsApp)}`;
        const enlaceTemporal = document.createElement("a");

        enlaceTemporal.href = enlaceWhatsApp;
        enlaceTemporal.target = "_blank";
        enlaceTemporal.rel = "noopener noreferrer";
        document.body.append(enlaceTemporal);
        enlaceTemporal.click();
        enlaceTemporal.remove();

        estadoFormulario.textContent = "Tu mensaje está listo para enviarse por WhatsApp.";
    });
}
