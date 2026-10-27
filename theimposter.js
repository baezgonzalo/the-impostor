"use strict";

const categorias = {
    Paises: paises,
    Futbolistashistoricos: futbolH,
    Futbolistasactuales: futbolA,
    Clubes: clubes,
    Lugares: lugares,
    Profesiones: profesiones,
    Clashroyale: clashroyale
};
const nombresCategorias = {
    Paises: "Países",
    Futbolistashistoricos: "Leyendas del fútbol",
    Futbolistasactuales: "Estrellas del fútbol",
    Clubes: "Clubes",
    Lugares: "Lugares",
    Profesiones: "Profesiones",
    Clashroyale: "Clash Royale"
};
const pantallas = ["inicio", "preparacion-juego", "juego", "debate", "votacion", "final-juego"];
const palabrasUsadas = new Map();
const ultimasPalabras = new Map();
let partida = null;
let intervaloReloj = null;
let finReloj = 0;
let segundosRestantes = 0;

const elemento = (id) => document.getElementById(id);

function mostrarPantalla(id, foco) {
    pantallas.forEach((pantalla) => {
        elemento(pantalla).hidden = pantalla !== id;
    });
    if (foco) elemento(foco).focus();
}

function mostrarError(id, mensaje, campo) {
    const error = elemento(id);
    error.textContent = mensaje;
    error.hidden = false;
    if (campo) elemento(campo).focus();
}

function limpiarError(id) {
    elemento(id).textContent = "";
    elemento(id).hidden = true;
}

function actualizarAyudaImpostores() {
    const jugadores = Number(elemento("input-jugadores").value);
    const valido = Number.isInteger(jugadores) && jugadores >= 3 && jugadores <= 20;
    const maximo = valido ? GameCore.maximoImpostores(jugadores) : 5;
    elemento("input-impostores").max = String(maximo);
    elemento("ayuda-impostores").textContent = valido
        ? "Con " + jugadores + " jugadores, hasta " + maximo + " impostor" + (maximo === 1 ? "" : "es")
        : "Primero elegí entre 3 y 20 jugadores";
}

function crearPartida(config) {
    detenerReloj();
    const usadas = palabrasUsadas.get(config.categoria) || new Set();
    const anterior = ultimasPalabras.get(config.categoria);
    const seleccion = GameCore.elegirPalabra(categorias[config.categoria], usadas, anterior);
    palabrasUsadas.set(config.categoria, seleccion.usadas);
    ultimasPalabras.set(config.categoria, seleccion.palabra);
    partida = {
        config,
        palabra: seleccion.palabra,
        impostores: GameCore.elegirImpostores(config.jugadores, config.impostores),
        jugadorActual: 1,
        faseRol: "lista",
        votos: [],
        inicio: Math.floor(Math.random() * config.jugadores) + 1
    };
    limpiarError("error-config");
    mostrarRol();
    mostrarPantalla("juego", "estado-rol");
}

function iniciarJuego(evento) {
    evento.preventDefault();
    limpiarError("error-config");
    const seleccion = document.querySelector('input[name="categoria"]:checked');
    const config = {
        jugadores: elemento("input-jugadores").value,
        impostores: elemento("input-impostores").value,
        categoria: seleccion?.value || "",
        duracion: elemento("duracion-debate").value
    };
    const validacion = GameCore.validarConfiguracion(config, categorias);
    if (!validacion.ok) {
        mostrarError("error-config", validacion.mensaje, validacion.campo);
        return;
    }
    crearPartida(validacion);
}

function mostrarRol() {
    const numero = partida.jugadorActual;
    const total = partida.config.jugadores;
    const frente = elemento("datos-jugadores-front");
    const dorso = elemento("datos-jugadores-back");
    const lectura = elemento("rol-accesible");
    const accion = elemento("accion-rol");
    elemento("contador-jugadores").textContent = "JUGADOR " + numero + " / " + total;

    if (partida.faseRol === "lista") {
        elemento("card-inner").classList.remove("rotated");
        frente.textContent = "Jugador " + numero;
        dorso.textContent = "";
        lectura.textContent = "";
        elemento("estado-rol").textContent = "Tu turno, jugador " + numero;
        elemento("instruccion-rol").textContent = "Tomá el teléfono y asegurate de que nadie más vea la pantalla.";
        accion.textContent = "Ver mi rol";
    } else if (partida.faseRol === "visible") {
        const texto = partida.impostores.includes(numero)
            ? "Sos el impostor"
            : "La palabra es: " + partida.palabra;
        dorso.textContent = texto;
        lectura.textContent = texto;
        elemento("card-inner").classList.add("rotated");
        elemento("estado-rol").textContent = "Leé tu rol en privado";
        elemento("instruccion-rol").textContent = "Cuando termines, ocultalo antes de pasar el teléfono.";
        accion.textContent = "Ocultar mi rol";
    } else {
        dorso.textContent = "";
        lectura.textContent = "";
        elemento("card-inner").classList.remove("rotated");
        const ultimo = numero === total;
        frente.textContent = ultimo ? "Roles repartidos" : "Pasá el teléfono";
        elemento("estado-rol").textContent = ultimo ? "Ya conocen sus roles" : "Rol oculto";
        elemento("instruccion-rol").textContent = ultimo
            ? "Reuní al grupo para empezar el debate."
            : "Ahora le toca al jugador " + (numero + 1) + ".";
        accion.textContent = ultimo ? "Comenzar debate" : "Listo, continuar";
    }
}

function avanzarRol() {
    if (!partida) return;
    if (partida.faseRol === "lista") {
        partida.faseRol = "visible";
    } else if (partida.faseRol === "visible") {
        partida.faseRol = "pasar";
    } else if (partida.jugadorActual < partida.config.jugadores) {
        partida.jugadorActual++;
        partida.faseRol = "lista";
    } else {
        iniciarDebate();
        return;
    }
    mostrarRol();
}

function detenerReloj() {
    if (intervaloReloj !== null) {
        clearInterval(intervaloReloj);
        intervaloReloj = null;
    }
}

function pintarReloj() {
    elemento("reloj").textContent = GameCore.formatearTiempo(segundosRestantes);
    const terminado = segundosRestantes === 0;
    elemento("reloj").classList.toggle("tiempo-terminado", terminado);
    elemento("boton-reloj").disabled = terminado;
    if (terminado) elemento("boton-reloj").textContent = "Tiempo terminado";
}

function actualizarReloj() {
    segundosRestantes = Math.max(0, Math.ceil((finReloj - Date.now()) / 1000));
    pintarReloj();
    if (segundosRestantes === 0) detenerReloj();
}

function alternarReloj() {
    if (!partida || partida.config.duracion === 0 || segundosRestantes === 0) return;
    if (intervaloReloj !== null) {
        actualizarReloj();
        detenerReloj();
        if (segundosRestantes > 0) elemento("boton-reloj").textContent = "Reanudar reloj";
    } else {
        finReloj = Date.now() + segundosRestantes * 1000;
        intervaloReloj = setInterval(actualizarReloj, 250);
        elemento("boton-reloj").textContent = "Pausar reloj";
    }
}

function reiniciarReloj() {
    if (!partida) return;
    detenerReloj();
    segundosRestantes = partida.config.duracion;
    pintarReloj();
    elemento("boton-reloj").textContent = "Iniciar reloj";
}

function iniciarDebate() {
    elemento("datos-jugadores-back").textContent = "";
    elemento("rol-accesible").textContent = "";
    elemento("jugador-inicial").textContent = "Jugador " + partida.inicio;
    elemento("nombre-categoria").textContent = "Categoría: " + nombresCategorias[partida.config.categoria];
    elemento("panel-reloj").hidden = partida.config.duracion === 0;
    reiniciarReloj();
    mostrarPantalla("debate", "titulo-debate");
}

function iniciarVotacion() {
    if (!partida) return;
    detenerReloj();
    limpiarError("error-votacion");
    mostrarPantalla("votacion", "titulo-votacion");
    mostrarVotante();
}

function mostrarVotante() {
    const numero = partida.votos.length + 1;
    const total = partida.config.jugadores;
    elemento("contador-votos").textContent = "VOTO " + numero + " / " + total;
    elemento("etiqueta-voto").textContent = "Jugador " + numero + ", votás por:";
    const selector = elemento("voto-jugador");
    selector.replaceChildren();
    selector.add(new Option("Seleccioná un jugador", ""));
    for (let jugador = 1; jugador <= total; jugador++) {
        if (jugador !== numero) selector.add(new Option("Jugador " + jugador, String(jugador)));
    }
    selector.value = "";
    selector.focus();
}

function registrarVoto() {
    if (!partida || partida.votos.length >= partida.config.jugadores) return;
    const selector = elemento("voto-jugador");
    const elegido = Number(selector.value);
    const votante = partida.votos.length + 1;
    if (!selector.value || !Number.isInteger(elegido) || elegido < 1 ||
        elegido > partida.config.jugadores || elegido === votante) {
        mostrarError("error-votacion", "Elegí a otro jugador antes de registrar el voto.", "voto-jugador");
        return;
    }
    limpiarError("error-votacion");
    partida.votos.push(elegido);
    if (partida.votos.length === partida.config.jugadores) mostrarResultados();
    else mostrarVotante();
}

function mostrarResultados() {
    const resultado = GameCore.contarVotos(partida.votos, partida.config.jugadores);
    const lideres = resultado.lideres;
    elemento("mas-votado").textContent = lideres.length === 1
        ? "El más votado fue el jugador " + lideres[0] + " con " + resultado.maximo + " voto" + (resultado.maximo === 1 ? "" : "s") + "."
        : "Hubo un empate entre los jugadores " + lideres.join(", ") + ".";

    const lista = elemento("conteo-votos");
    lista.replaceChildren();
    resultado.conteo
        .map((votos, indice) => ({ jugador: indice + 1, votos }))
        .sort((a, b) => b.votos - a.votos || a.jugador - b.jugador)
        .forEach(({ jugador, votos }) => {
            const item = document.createElement("li");
            item.className = resultado.lideres.includes(jugador) ? "top-vote" : "";
            const nombre = document.createElement("span");
            const cantidad = document.createElement("strong");
            nombre.textContent = "Jugador " + jugador;
            cantidad.textContent = votos + " voto" + (votos === 1 ? "" : "s");
            item.append(nombre, cantidad);
            lista.append(item);
        });
    elemento("revelacion").hidden = true;
    elemento("descubrir-impostor").hidden = false;
    elemento("boton-volver").hidden = true;
    elemento("boton-configurar").hidden = true;
    mostrarPantalla("final-juego", "titulo-final");
}

function revelarImpostores() {
    if (!partida || partida.votos.length !== partida.config.jugadores) return;
    const { lideres } = GameCore.contarVotos(partida.votos, partida.config.jugadores);
    let veredicto;
    if (lideres.length > 1) {
        veredicto = "La votación terminó en empate";
    } else if (partida.impostores.includes(lideres[0])) {
        veredicto = partida.impostores.length > 1
            ? "El grupo encontró a un impostor"
            : "El grupo descubrió al impostor";
    } else {
        veredicto = "El impostor pasó inadvertido";
    }
    elemento("resultado-titulo").textContent = veredicto;
    elemento("resultado-detalle").textContent =
        (partida.impostores.length === 1 ? "Impostor: jugador " : "Impostores: jugadores ") +
        partida.impostores.join(", ") + ". Palabra: " + partida.palabra + ".";
    elemento("revelacion").hidden = false;
    elemento("descubrir-impostor").hidden = true;
    elemento("boton-volver").hidden = false;
    elemento("boton-configurar").hidden = false;
    elemento("revelacion").focus();
}

function nuevaRonda() {
    if (!partida) return;
    crearPartida(partida.config);
}

function cambiarConfiguracion() {
    detenerReloj();
    partida = null;
    elemento("datos-jugadores-back").textContent = "";
    elemento("rol-accesible").textContent = "";
    mostrarPantalla("preparacion-juego", "titulo-preparacion");
}

function cancelarPartida() {
    if (window.confirm("¿Cancelar esta partida y volver a la configuración?")) {
        cambiarConfiguracion();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    elemento("boton-comenzar").addEventListener("click", () => mostrarPantalla("preparacion-juego", "titulo-preparacion"));
    elemento("boton-inicio-config").addEventListener("click", () => mostrarPantalla("inicio", "titulo-inicio"));
    elemento("input-jugadores").addEventListener("input", actualizarAyudaImpostores);
    elemento("config-form").addEventListener("submit", iniciarJuego);
    elemento("accion-rol").addEventListener("click", avanzarRol);
    elemento("cancelar-partida").addEventListener("click", cancelarPartida);
    elemento("cancelar-debate").addEventListener("click", cancelarPartida);
    elemento("cancelar-votacion").addEventListener("click", cancelarPartida);
    elemento("boton-reloj").addEventListener("click", alternarReloj);
    elemento("reiniciar-reloj").addEventListener("click", reiniciarReloj);
    elemento("ir-a-votar").addEventListener("click", iniciarVotacion);
    elemento("registrar-voto").addEventListener("click", registrarVoto);
    elemento("descubrir-impostor").addEventListener("click", revelarImpostores);
    elemento("boton-volver").addEventListener("click", nuevaRonda);
    elemento("boton-configurar").addEventListener("click", cambiarConfiguracion);
    actualizarAyudaImpostores();
});
