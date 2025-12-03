/* ==========================================
            VARIABLES GLOBALES
========================================== */

let modoActual = "";
let dificultadActual = "normal";
let intervalo;
let puntos = 0;
let racha = 0;
let jugandoCarrera = false;
let corrida = { runner1: 0, runner2: 0 };
let confetiArray = [];

/* ================================
        ELEMENTOS DOM
================================ */

const menuPrincipal = document.getElementById("menuPrincipal");
const lobbyDificultad = document.getElementById("lobbyDificultad");

const musica = document.getElementById("musicaFondo");
const btnMusica = document.getElementById("btnMusica");

btnMusica.addEventListener("click", () => {
    if (musica.paused) {
        musica.play();
        btnMusica.textContent = "🎵";
    } else {
        musica.pause();
        btnMusica.textContent = "🔇";
    }
});

/* ==========================================
            FUNCIONES DE NAVEGACIÓN
========================================== */

function seleccionarDificultad(modo) {
    modoActual = modo;
    menuPrincipal.classList.add("oculto");
    lobbyDificultad.classList.remove("oculto");
}

function iniciarConDificultad(dif) {
    dificultadActual = dif;
    lobbyDificultad.classList.add("oculto");
    iniciarModo(modoActual);
}

function volverMenu() {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.add("oculto"));
    menuPrincipal.classList.remove("oculto");
    limpiarIntervalos();
}

/* ==========================================
            UTILIDADES DE JUEGO
========================================== */

function limpiarIntervalos() {
    clearInterval(intervalo);
}

/* ==========================================
            MODO INDIVIDUAL
========================================== */

function iniciarModo(modo) {
    if (modo === "individual") iniciarIndividual();
    if (modo === "coop") iniciarCoop();
    if (modo === "carrera") iniciarCarrera();
    if (modo === "precision") iniciarPrecision();
    if (modo === "caos") iniciarCaos();
    if (modo === "competitivo") iniciarCompetitivo();
}

/* -------- Modo Individual -------- */
function iniciarIndividual() {
    puntos = 0;
    racha = 0;
    document.getElementById("puntosInd").textContent = puntos;
    document.getElementById("rachaInd").textContent = racha;
    const pantalla = document.getElementById("modoIndividual");
    pantalla.classList.remove("oculto");

    const barra = document.getElementById("barraInd");
    const zona = document.getElementById("zonaVerdeInd");
    const mensaje = document.getElementById("mensajeInd");
    const btn = document.getElementById("btnInd");
    const confetiCanvas = document.getElementById("confetiIndividual");
    const ctx = confetiCanvas.getContext("2d");
    confetiCanvas.width = window.innerWidth;
    confetiCanvas.height = window.innerHeight;

    let direccion = 1;
    barra.style.left = "0%";

    intervalo = setInterval(() => {
        let pos = parseFloat(barra.style.left) || 0;
        pos += 0.01 * direccion;
        if (pos <= 0) direccion = 1;
        if (pos >= 0.85) direccion = -1;
        barra.style.left = pos;
    }, 16);

    btn.onclick = () => {
        const barraIzq = parseFloat(barra.style.left);
        const zonaIzq = parseFloat(zona.style.left);
        if (barraIzq + 0.15 > zonaIzq && barraIzq < zonaIzq + 0.3) {
            mensaje.textContent = "¡Acertaste! ✨";
            puntos += 10;
            racha++;
            document.getElementById("puntosInd").textContent = puntos;
            document.getElementById("rachaInd").textContent = racha;
            dispararConfeti(ctx, confetiCanvas);
            reproducirSonido("sonidoAcierto");
        } else {
            mensaje.textContent = "¡Fallaste! 😢";
            racha = 0;
            document.getElementById("rachaInd").textContent = racha;
            reproducirSonido("sonidoFallo");
        }
    };
}

/* ==========================================
            MODO COOPERATIVO
========================================== */

function iniciarCoop() {
    const pantalla = document.getElementById("modoCoop");
    pantalla.classList.remove("oculto");

    const pelota1 = document.getElementById("pelota1");
    const pelota2 = document.getElementById("pelota2");
    const target1 = document.getElementById("target1");
    const target2 = document.getElementById("target2");
    const puntosCoopElem = document.getElementById("puntosCoop");
    const confetiCanvas = document.getElementById("confetiCoop");
    const ctx = confetiCanvas.getContext("2d");
    confetiCanvas.width = window.innerWidth;
    confetiCanvas.height = window.innerHeight;

    let puntosCoop = 0;
    let altura1 = 0;
    let altura2 = 0;

    target1.style.top = Math.random() * 120 + "px";
    target2.style.top = Math.random() * 120 + "px";

    function moverPelota(e, pelota, altura) {
        altura += 2;
        pelota.style.top = altura + "px";
        return altura;
    }

    pelota1.addEventListener("touchstart", () => { altura1 = moverPelota(null, pelota1, altura1); });
    pelota2.addEventListener("touchstart", () => { altura2 = moverPelota(null, pelota2, altura2); });

    setInterval(() => {
        target1.style.top = (Math.random() * 120) + "px";
        target2.style.top = (Math.random() * 120) + "px";

        if (Math.abs(parseInt(pelota1.style.top) - parseInt(target1.style.top)) < 15 &&
            Math.abs(parseInt(pelota2.style.top) - parseInt(target2.style.top)) < 15) {
            puntosCoop += 10;
            puntosCoopElem.textContent = puntosCoop;
            dispararConfeti(ctx, confetiCanvas);
            reproducirSonido("sonidoExplosion");
        }
    }, 800);
}

/* ==========================================
            MODO CARRERA
========================================== */

function iniciarCarrera() {
    const pantalla = document.getElementById("modoCarrera");
    pantalla.classList.remove("oculto");
    const runner1 = document.getElementById("runner1");
    const runner2 = document.getElementById("runner2");
    const mensaje = document.getElementById("mensajeCarrera");

    corrida = { runner1: 0, runner2: 0 };
    jugandoCarrera = true;

    function subir(runner) {
        if (!jugandoCarrera) return;
        corrida[runner] += 3;
        document.getElementById(runner).style.bottom = corrida[runner] + "px";
        if (corrida[runner] >= 180) {
            mensaje.textContent = runner + " ¡Ganó! 🏆";
            jugandoCarrera = false;
        }
    }

    runner1.addEventListener("touchstart", () => subir("runner1"));
    runner2.addEventListener("touchstart", () => subir("runner2"));
}

/* ==========================================
            MODO PRECISIÓN EXTREMA
========================================== */

function iniciarPrecision() {
    const pantalla = document.getElementById("modoPrecision");
    pantalla.classList.remove("oculto");

    const barra = document.getElementById("barraPre");
    const zona = document.getElementById("zonaVerdePre");
    const mensaje = document.getElementById("mensajePre");
    const btn = document.getElementById("btnPre");
    const confetiCanvas = document.getElementById("confetiPrecision");
    const ctx = confetiCanvas.getContext("2d");
    confetiCanvas.width = window.innerWidth;
    confetiCanvas.height = window.innerHeight;

    let direccion = 1;
    barra.style.left = "0%";

    intervalo = setInterval(() => {
        let pos = parseFloat(barra.style.left) || 0;
        pos += 0.015 * direccion;
        if (pos <= 0) direccion = 1;
        if (pos >= 0.85) direccion = -1;
        barra.style.left = pos;
    }, 16);

    btn.onclick = () => {
        const barraIzq = parseFloat(barra.style.left);
        const zonaIzq = parseFloat(zona.style.left);
        if (barraIzq + 0.15 > zonaIzq && barraIzq < zonaIzq + 0.3) {
            mensaje.textContent = "¡Perfecto! 🎯";
            dispararConfeti(ctx, confetiCanvas);
            reproducirSonido("sonidoAcierto");
        } else {
            mensaje.textContent = "¡Fallaste! 😢";
            reproducirSonido("sonidoFallo");
        }
    };
}

/* ==========================================
            MODO CAOS
========================================== */

function iniciarCaos() {
    const pantalla = document.getElementById("modoCaos");
    pantalla.classList.remove("oculto");

    const barra = document.getElementById("barraC");
    const zona = document.getElementById("zonaVerdeC");
    const mensaje = document.getElementById("mensajeCaos");
    const btn = document.getElementById("btnCaos");
    const confetiCanvas = document.getElementById("confetiCaos");
    const ctx = confetiCanvas.getContext("2d");
    confetiCanvas.width = window.innerWidth;
    confetiCanvas.height = window.innerHeight;

    barra.style.left = "0%";
    let direccion = 1;

    intervalo = setInterval(() => {
        let pos = parseFloat(barra.style.left) || 0;
        pos += (0.015 + Math.random() * 0.02) * direccion;
        if (pos <= 0) direccion = 1;
        if (pos >= 0.85) direccion = -1;
        barra.style.left = pos;

        zona.style.left = Math.random() * 70 + "%";
    }, 16);

    btn.onclick = () => {
        const barraIzq = parseFloat(barra.style.left);
        const zonaIzq = parseFloat(zona.style.left);
        if (barraIzq + 0.15 > zonaIzq && barraIzq < zonaIzq + 0.3) {
            mensaje.textContent = "¡Increíble! 🌀";
            dispararConfeti(ctx, confetiCanvas);
            reproducirSonido("sonidoAcierto");
        } else {
            mensaje.textContent = "¡Fallaste! 😈";
            reproducirSonido("sonidoFallo");
        }
    };
}

/* ==========================================
            MODO COMPETITIVO 1 VS 1
========================================== */

function iniciarCompetitivo() {
    const pantalla = document.getElementById("modoCompetitivo");
    pantalla.classList.remove("oculto");

    const barraP1 = document.getElementById("barraP1");
    const barraP2 = document.getElementById("barraP2");
    const zonaP1 = document.getElementById("zonaVerdeP1");
    const zonaP2 = document.getElementById("zonaVerdeP2");
    const mensaje = document.getElementById("mensajeComp");
    const confetiCanvas = document.getElementById("confetiCompetitivo");
    const ctx = confetiCanvas.getContext("2d");
    confetiCanvas.width = window.innerWidth;
    confetiCanvas.height = window.innerHeight;

    barraP1.style.left = "0%";
    barraP2.style.left = "0%";

    let dir1 = 1;
    let dir2 = 1;

    intervalo = setInterval(() => {
        let pos1 = parseFloat(barraP1.style.left) || 0;
        let pos2 = parseFloat(barraP2.style.left) || 0;

        pos1 += 0.012 * dir1;
        pos2 += 0.012 * dir2;

        if (pos1 <= 0) dir1 = 1;
        if (pos1 >= 0.85) dir1 = -1;
        if (pos2 <= 0) dir2 = 1;
        if (pos2 >= 0.85) dir2 = -1;

        barraP1.style.left = pos1;
        barraP2.style.left = pos2;
    }, 16);

    document.getElementById("btnComp1").onclick = () => {
        const pos = parseFloat(barraP1.style.left);
        const zona = parseFloat(zonaP1.style.left);
        if (pos + 0.15 > zona && pos < zona + 0.3) {
            mensaje.textContent = "Jugador 1 acierta! ⭐";
            dispararConfeti(ctx, confetiCanvas);
            reproducirSonido("sonidoAcierto");
        } else {
            mensaje.textContent = "Jugador 1 falla! ❌";
            reproducirSonido("sonidoFallo");
        }
    };

    document.getElementById("btnComp2").onclick = () => {
        const pos = parseFloat(barraP2.style.left);
        const zona = parseFloat(zonaP2.style.left);
        if (pos + 0.15 > zona && pos < zona + 0.3) {
            mensaje.textContent = "Jugador 2 acierta! ⭐";
            dispararConfeti(ctx, confetiCanvas);
            reproducirSonido("sonidoAcierto");
        } else {
            mensaje.textContent = "Jugador 2 falla! ❌";
            reproducirSonido("sonidoFallo");
        }
    };
}

/* ==========================================
            CONFETI SIMPLE
========================================== */

function dispararConfeti(ctx, canvas) {
    for (let i = 0; i < 100; i++) {
        confetiArray.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * 10 + 2,
            color: "hsl(" + Math.random() * 360 + ", 100%, 50%)",
            tilt: Math.floor(Math.random() * 10) - 5
        });
    }

    function dibujar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let c of confetiArray) {
            ctx.beginPath();
            ctx.fillStyle = c.color;
            ctx.fillRect(c.x, c.y, c.r, c.r);
            ctx.closePath();
            c.y += Math.random() * 4 + 2;
            c.x += Math.sin(c.tilt);
        }
        confetiArray = confetiArray.filter(c => c.y < canvas.height);
        if (confetiArray.length > 0) requestAnimationFrame(dibujar);
    }

    dibujar();
}

/* ==========================================
            SONIDOS
========================================== */

function reproducirSonido(id) {
    const audio = document.getElementById(id);
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
}
