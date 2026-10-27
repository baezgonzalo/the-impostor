"use strict";

const GameCore = (() => {
    const DURACIONES = new Set([0, 120, 180, 300]);

    function maximoImpostores(jugadores) {
        return Math.min(5, jugadores - 2);
    }

    function validarConfiguracion(config, categorias) {
        const entero = (valor) => /^\d+$/.test(String(valor).trim());
        const jugadores = Number(config.jugadores);
        const impostores = Number(config.impostores);
        const duracion = Number(config.duracion);

        if (!entero(config.jugadores) || jugadores < 3 || jugadores > 20) {
            return { ok: false, campo: "input-jugadores", mensaje: "Elegí entre 3 y 20 jugadores." };
        }
        if (!entero(config.impostores) || impostores < 1 || impostores > maximoImpostores(jugadores)) {
            return {
                ok: false,
                campo: "input-impostores",
                mensaje: "Con " + jugadores + " jugadores podés elegir entre 1 y " + maximoImpostores(jugadores) + " impostores."
            };
        }
        if (!Object.hasOwn(categorias, config.categoria) || !Array.isArray(categorias[config.categoria]) ||
            categorias[config.categoria].length === 0) {
            return { ok: false, campo: "Paises", mensaje: "Elegí una categoría." };
        }
        if (!DURACIONES.has(duracion)) {
            return { ok: false, campo: "duracion-debate", mensaje: "Elegí un tiempo de debate válido." };
        }
        return { ok: true, jugadores, impostores, categoria: config.categoria, duracion };
    }

    function elegirPalabra(palabras, usadas = new Set(), anterior = null, azar = Math.random) {
        const unicas = [...new Set(palabras.map((palabra) => String(palabra).trim()).filter(Boolean))];
        if (unicas.length === 0) throw new Error("La categoría no tiene palabras");
        let nuevasUsadas = new Set([...usadas].filter((palabra) => unicas.includes(palabra)));
        let disponibles = unicas.filter((palabra) => !nuevasUsadas.has(palabra));
        if (disponibles.length === 0) {
            nuevasUsadas = new Set();
            disponibles = unicas.length > 1 ? unicas.filter((palabra) => palabra !== anterior) : unicas;
        }
        const indice = Math.floor(azar() * disponibles.length);
        const palabra = disponibles[indice];
        nuevasUsadas.add(palabra);
        return { palabra, usadas: nuevasUsadas };
    }

    function elegirImpostores(jugadores, cantidad, azar = Math.random) {
        if (!Number.isInteger(jugadores) || !Number.isInteger(cantidad) || cantidad < 1 ||
            cantidad > maximoImpostores(jugadores)) {
            throw new RangeError("Cantidad de impostores inválida");
        }
        const numeros = Array.from({ length: jugadores }, (_, indice) => indice + 1);
        for (let indice = numeros.length - 1; indice > 0; indice--) {
            const elegido = Math.floor(azar() * (indice + 1));
            [numeros[indice], numeros[elegido]] = [numeros[elegido], numeros[indice]];
        }
        return numeros.slice(0, cantidad).sort((a, b) => a - b);
    }

    function contarVotos(votos, jugadores) {
        if (!Number.isInteger(jugadores) || jugadores < 3 || votos.length !== jugadores) {
            throw new RangeError("La votación está incompleta");
        }
        const conteo = Array(jugadores).fill(0);
        votos.forEach((voto) => {
            if (!Number.isInteger(voto) || voto < 1 || voto > jugadores) {
                throw new RangeError("Voto inválido");
            }
            conteo[voto - 1]++;
        });
        const maximo = Math.max(...conteo);
        const lideres = conteo.flatMap((cantidad, indice) => cantidad === maximo ? [indice + 1] : []);
        return { conteo, lideres, maximo };
    }

    function formatearTiempo(segundos) {
        const restante = Math.max(0, Math.ceil(segundos));
        return String(Math.floor(restante / 60)).padStart(2, "0") + ":" +
            String(restante % 60).padStart(2, "0");
    }

    return Object.freeze({
        maximoImpostores,
        validarConfiguracion,
        elegirPalabra,
        elegirImpostores,
        contarVotos,
        formatearTiempo
    });
})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = GameCore;
}
