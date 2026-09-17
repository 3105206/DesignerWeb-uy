/* =============================================================================
   AUTOMECANICA AC — main.js
   Todo lo editable vive en js/config.js. Acá está el comportamiento.

   Bloques:
   1. Configuración y utilidades
   2. Datos del negocio en la página (teléfono, WhatsApp, dirección, redes)
   3. Cartel "Abierto ahora / Cerrado"
   4. Cupos y disponibilidad
   5. Fechas: qué días se pueden elegir
   6. Menú mobile
   7. Pestañas de turnos
   8. Validación y armado del mensaje de WhatsApp
   9. Animaciones de aparición
   ========================================================================== */
(function () {
  "use strict";

  /* ======================= 1. CONFIGURACIÓN Y UTILIDADES ==================== */

  var CFG = window.AUTOMECANICA_CONFIG || {};
  var NEGOCIO = CFG.NEGOCIO || {};
  var HORARIOS = CFG.HORARIOS || {};
  var DISPONIBILIDAD = CFG.DISPONIBILIDAD || {};
  var MARCAS = CFG.MARCAS || [];
  var TIPOS_SERVICE = CFG.TIPOS_SERVICE || [];

  var DIAS_CLAVE = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  var DIAS_NOMBRE = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
               "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /* Hora actual en Uruguay, sin depender del reloj del visitante. */
  function ahoraUY() {
    var d = new Date();
    var y, m, dia, hora, min;
    try {
      var partes = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Montevideo",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(d);
      var p = {};
      partes.forEach(function (x) { p[x.type] = x.value; });
      y = +p.year; m = +p.month; dia = +p.day;
      hora = (+p.hour) % 24; min = +p.minute;
    } catch (e) {
      // Si el navegador es viejo y no entiende zonas horarias, usamos su reloj.
      y = d.getFullYear(); m = d.getMonth() + 1; dia = d.getDate();
      hora = d.getHours(); min = d.getMinutes();
    }
    var fechaLocal = new Date(y, m - 1, dia);
    return {
      iso: y + "-" + dosDigitos(m) + "-" + dosDigitos(dia),
      diaSemana: fechaLocal.getDay(),
      minutos: hora * 60 + min,
      fecha: fechaLocal
    };
  }

  function dosDigitos(n) { return (n < 10 ? "0" : "") + n; }

  /* "8:00" -> 480 minutos */
  function aMinutos(txt) {
    var m = String(txt || "").match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    return (+m[1]) * 60 + (+m[2]);
  }

  /* "2026-03-24" -> "martes 24 de marzo" */
  function fechaEnPalabras(iso) {
    var p = String(iso).split("-");
    if (p.length !== 3) return iso;
    var f = new Date(+p[0], +p[1] - 1, +p[2]);
    if (isNaN(f.getTime())) return iso;
    return DIAS_NOMBRE[f.getDay()] + " " + f.getDate() + " de " + MESES[f.getMonth()];
  }

  function horarioDe(diaSemana) {
    return HORARIOS[DIAS_CLAVE[diaSemana]] || null;
  }

  function contiene(lista, valor) {
    return Array.isArray(lista) && lista.indexOf(valor) !== -1;
  }

  /* ==================== 2. DATOS DEL NEGOCIO EN LA PÁGINA =================== */
  /* El HTML ya trae los datos escritos (por si el JS no carga). Acá los
     sincronizamos con lo que diga config.js, que es la fuente de verdad.     */

  function linkWhatsApp(mensaje) {
    var numero = String(NEGOCIO.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + numero + (mensaje ? "?text=" + encodeURIComponent(mensaje) : "");
  }

  function pintarDatosDelNegocio() {
    if (NEGOCIO.telefono) {
      $$("[data-bind='telefono']").forEach(function (el) { el.textContent = NEGOCIO.telefono; });
    }
    if (NEGOCIO.telefonoLink) {
      $$("[data-bind='telefono-link']").forEach(function (el) {
        el.setAttribute("href", "tel:" + String(NEGOCIO.telefonoLink).replace(/\s/g, ""));
      });
    }
    if (NEGOCIO.direccion) {
      $$("[data-bind='direccion-completa']").forEach(function (el) {
        el.textContent = NEGOCIO.direccion + ", " + (NEGOCIO.ciudad || "");
      });
    }
    if (NEGOCIO.mapsUrl) {
      $$("[data-bind='maps-link']").forEach(function (el) {
        el.setAttribute("href", NEGOCIO.mapsUrl);
      });
    }

    // Email: si está vacío en config.js, la fila queda oculta.
    var filaEmail = $("[data-bind-fila='email']");
    if (filaEmail) {
      if (NEGOCIO.email) {
        filaEmail.hidden = false;
        var linkMail = $("[data-bind='email-link']", filaEmail);
        var txtMail = $("[data-bind='email']", filaEmail);
        if (linkMail) linkMail.setAttribute("href", "mailto:" + NEGOCIO.email);
        if (txtMail) txtMail.textContent = NEGOCIO.email;
      } else {
        filaEmail.hidden = true;
      }
    }

    // Redes: se muestran solo las que tengan link cargado.
    var redes = $("[data-redes]");
    if (redes) {
      var hayAlguna = false;
      [["instagram", NEGOCIO.instagram], ["facebook", NEGOCIO.facebook]].forEach(function (par) {
        var el = $("[data-bind='" + par[0] + "']", redes);
        if (!el) return;
        if (par[1]) {
          el.setAttribute("href", par[1]);
          el.hidden = false;
          hayAlguna = true;
        } else {
          el.hidden = true;
        }
      });
      redes.hidden = !hayAlguna;
    }

    // Botones de WhatsApp "sueltos" (header, footer, botón flotante)
    var saludo = "Hola, quiero consultar por un turno en " + (NEGOCIO.nombre || "el taller") + ".";
    $$("[data-wsp-simple]").forEach(function (el) {
      el.setAttribute("href", linkWhatsApp(saludo));
    });

    // Año del footer
    $$("[data-bind='anio']").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });

    // Marcas y tipos de service de los selects, por si se editaron en config.js
    if (MARCAS.length) {
      $$("[data-select-marcas]").forEach(function (sel) {
        var elegido = sel.value;
        sel.innerHTML = "";
        sel.appendChild(new Option("Elegí la marca", ""));
        MARCAS.forEach(function (m) { sel.appendChild(new Option(m, m)); });
        sel.value = elegido;
      });
    }
    if (TIPOS_SERVICE.length) {
      $$("[data-select-tipos]").forEach(function (sel) {
        // Guardamos la opción que venía marcada ("No estoy seguro") para
        // que siga siendo la opción por defecto después de recargar la lista.
        var porDefecto = sel.options.length ? sel.options[0].value || sel.options[0].text : "";
        var elegido = sel.value;
        sel.innerHTML = "";
        TIPOS_SERVICE.forEach(function (t) { sel.appendChild(new Option(t, t)); });
        sel.value = elegido || porDefecto;
        if (!sel.value) sel.selectedIndex = 0;
      });
    }
  }

  /* ==================== 3. CARTEL "ABIERTO AHORA / CERRADO" ================= */

  function proximaApertura(desde) {
    for (var i = 1; i <= 7; i++) {
      var d = (desde + i) % 7;
      var h = horarioDe(d);
      if (h && h.abierto) {
        return { dia: DIAS_NOMBRE[d], hora: h.abre };
      }
    }
    return null;
  }

  function pintarEstado() {
    var chips = $$("[data-estado]");
    if (!chips.length) return;

    var ahora = ahoraUY();
    var hoy = horarioDe(ahora.diaSemana);
    var abierto = false;
    var texto = "";

    if (hoy && hoy.abierto) {
      var abre = aMinutos(hoy.abre);
      var cierra = aMinutos(hoy.cierra);
      if (abre !== null && cierra !== null) {
        if (ahora.minutos < abre) {
          texto = "Cerrado ahora · abre hoy a las " + hoy.abre;
        } else if (ahora.minutos < cierra) {
          abierto = true;
          texto = "Abierto ahora · cierra a las " + hoy.cierra;
        } else {
          var sig = proximaApertura(ahora.diaSemana);
          texto = sig ? "Cerrado ahora · abre el " + sig.dia + " a las " + sig.hora : "Cerrado ahora";
        }
      }
    }
    if (!texto) {
      var prox = proximaApertura(ahora.diaSemana);
      texto = prox ? "Cerrado ahora · abre el " + prox.dia + " a las " + prox.hora : "Cerrado ahora";
    }

    chips.forEach(function (chip) {
      chip.classList.remove("estado--abierto", "estado--cerrado");
      chip.classList.add(abierto ? "estado--abierto" : "estado--cerrado");
      var span = $("[data-estado-texto]", chip);
      if (span) span.textContent = texto;
    });
  }

  /* ======================= 4. CUPOS Y DISPONIBILIDAD ======================== */

  var ETIQUETA_SERVICIO = {
    service: "service oficial",
    reparacion: "reparaciones",
    alineacion: "alineación y balanceo"
  };

  function infoCupos(clave) {
    var d = DISPONIBILIDAD[clave];
    if (!d) return { cupos: 0, abierto: false };
    return { cupos: +d.cupos || 0, abierto: d.abierto !== false && (+d.cupos || 0) > 0 };
  }

  function pintarCupos() {
    ["service", "reparacion", "alineacion"].forEach(function (clave) {
      var info = infoCupos(clave);
      var unidad = info.cupos === 1 ? "auto" : "autos";

      $$("[data-cupos='" + clave + "']").forEach(function (el) {
        el.textContent = info.abierto
          ? info.cupos + " " + unidad + " por día"
          : "Sin cupos por el momento";
        el.classList.toggle("servicio__cupos--cerrado", !info.abierto);
      });

      $$("[data-cupos-tab='" + clave + "']").forEach(function (el) {
        el.textContent = info.abierto
          ? info.cupos + (info.cupos === 1 ? " cupo" : " cupos") + " por día"
          : "Sin cupos";
      });

      if (!info.abierto) cerrarPanel(clave);
    });
  }

  /* Cuando un servicio está sin cupos: aviso arriba, formulario desactivado,
     pero el visitante igual puede escribir por WhatsApp.                     */
  function cerrarPanel(clave) {
    var panel = $("[data-panel='" + clave + "']");
    if (!panel || panel.classList.contains("panel--sin-cupos")) return;

    panel.classList.add("panel--sin-cupos");

    var aviso = document.createElement("div");
    aviso.className = "panel__aviso";
    var mensaje =
      "Hola, vi en la web que " + (ETIQUETA_SERVICIO[clave] || "ese servicio") +
      " está sin cupos. Quería consultar igual por un turno.";
    aviso.innerHTML =
      '<p style="margin:0"><strong>Sin cupos por el momento.</strong> ' +
      "No estamos tomando turnos nuevos de " + (ETIQUETA_SERVICIO[clave] || "este servicio") +
      ". Escribinos igual y te avisamos apenas se libere un lugar.</p>";

    var boton = document.createElement("a");
    boton.className = "boton boton--primario";
    boton.setAttribute("href", linkWhatsApp(mensaje));
    boton.setAttribute("target", "_blank");
    boton.setAttribute("rel", "noopener");
    boton.textContent = "Escribir por WhatsApp";
    aviso.appendChild(boton);

    var form = $("form", panel);
    if (form) {
      panel.insertBefore(aviso, form);
      $$("input, select, textarea, button", form).forEach(function (campo) {
        campo.disabled = true;
      });
    } else {
      panel.appendChild(aviso);
    }
  }

  /* ==================== 5. FECHAS: QUÉ DÍAS SE PUEDEN ELEGIR ================ */

  function revisarFecha(valor) {
    if (!valor) return { ok: false, motivo: "Elegí un día para el turno." };

    var p = String(valor).split("-");
    if (p.length !== 3) return { ok: false, motivo: "La fecha no es válida." };

    var f = new Date(+p[0], +p[1] - 1, +p[2]);
    if (isNaN(f.getTime())) return { ok: false, motivo: "La fecha no es válida." };

    var hoy = ahoraUY();
    if (valor < hoy.iso) {
      return { ok: false, motivo: "Esa fecha ya pasó. Elegí un día de acá en adelante." };
    }

    var h = horarioDe(f.getDay());
    if (!h || !h.abierto) {
      return { ok: false, motivo: "El taller trabaja de lunes a viernes. Elegí un día hábil." };
    }
    if (contiene(DISPONIBILIDAD.diasCerrados, valor)) {
      return { ok: false, motivo: "Ese día el taller no abre. Probá con " + textoProximoDia(valor) + "." };
    }
    if (contiene(DISPONIBILIDAD.diasCompletos, valor)) {
      return { ok: false, motivo: "Ese día ya está completo. Probá con " + textoProximoDia(valor) + "." };
    }
    return { ok: true, motivo: "" };
  }

  /* Busca el primer día hábil con lugar a partir de una fecha dada. */
  function textoProximoDia(desdeIso) {
    var p = String(desdeIso || ahoraUY().iso).split("-");
    var f = new Date(+p[0], +p[1] - 1, +p[2]);
    for (var i = 1; i <= 60; i++) {
      f.setDate(f.getDate() + 1);
      var iso = f.getFullYear() + "-" + dosDigitos(f.getMonth() + 1) + "-" + dosDigitos(f.getDate());
      var h = horarioDe(f.getDay());
      if (h && h.abierto &&
          !contiene(DISPONIBILIDAD.diasCerrados, iso) &&
          !contiene(DISPONIBILIDAD.diasCompletos, iso)) {
        return "el " + fechaEnPalabras(iso);
      }
    }
    return "otro día";
  }

  function prepararFechas() {
    var hoy = ahoraUY().iso;
    $$("[data-fecha]").forEach(function (input) {
      input.setAttribute("min", hoy);
      input.addEventListener("change", function () {
        var r = revisarFecha(input.value);
        if (r.ok) limpiarError(input); else marcarError(input, r.motivo);
      });
    });
  }

  /* =========================== 6. MENÚ MOBILE ============================== */

  function prepararMenu() {
    var btn = $("#btn-menu");
    var nav = $("#nav-principal");
    var overlay = $("#overlay");
    if (!btn || !nav) return;

    function abrir() {
      document.body.classList.add("menu-abierto");
      document.body.style.overflow = "hidden";
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Cerrar menú");
      if (overlay) overlay.hidden = false;
    }
    function cerrar() {
      document.body.classList.remove("menu-abierto");
      document.body.style.overflow = "";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Abrir menú");
      if (overlay) overlay.hidden = true;
    }

    btn.addEventListener("click", function () {
      if (document.body.classList.contains("menu-abierto")) cerrar(); else abrir();
    });
    if (overlay) overlay.addEventListener("click", cerrar);
    $$("a", nav).forEach(function (a) { a.addEventListener("click", cerrar); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-abierto")) {
        cerrar();
        btn.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900 && document.body.classList.contains("menu-abierto")) cerrar();
    });
  }

  /* ======================= 7. PESTAÑAS DE TURNOS =========================== */

  function prepararTabs() {
    var tabs = $$(".tab");
    if (!tabs.length) return;

    function activar(tab, mover) {
      tabs.forEach(function (t) {
        var activa = t === tab;
        t.classList.toggle("tab--activa", activa);
        t.setAttribute("aria-selected", activa ? "true" : "false");
        t.setAttribute("tabindex", activa ? "0" : "-1");
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !activa;
      });
      if (mover) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { activar(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var salto = null;
        if (e.key === "ArrowRight") salto = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") salto = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") salto = 0;
        if (e.key === "End") salto = tabs.length - 1;
        if (salto !== null) {
          e.preventDefault();
          activar(tabs[salto], true);
        }
      });
    });
  }

  /* ============ 8. VALIDACIÓN Y ARMADO DEL MENSAJE DE WHATSAPP ============= */

  function contenedorCampo(el) {
    var n = el;
    while (n && n !== document.body) {
      if (n.classList && n.classList.contains("campo")) return n;
      n = n.parentNode;
    }
    return null;
  }

  function marcarError(el, texto) {
    var campo = contenedorCampo(el);
    if (!campo) return;
    campo.classList.add("campo--error");
    var p = $(".campo__error", campo);
    if (p) {
      if (!p.id) p.id = "err-" + Math.random().toString(36).slice(2, 8);
      p.textContent = texto;
      p.hidden = false;
      p.setAttribute("role", "alert");
      el.setAttribute("aria-describedby", p.id);
    }
    el.setAttribute("aria-invalid", "true");
  }

  function limpiarError(el) {
    var campo = contenedorCampo(el);
    if (!campo) return;
    campo.classList.remove("campo--error");
    var p = $(".campo__error", campo);
    if (p) { p.hidden = true; p.textContent = ""; }
    el.removeAttribute("aria-invalid");
    el.removeAttribute("aria-describedby");
  }

  function soloNumeros(txt) { return String(txt).replace(/\D/g, ""); }

  /* Devuelve "" si está bien, o el texto del error. */
  function validarCampo(el) {
    var valor = (el.value || "").trim();
    var nombre = el.getAttribute("name");

    if (el.hasAttribute("required") && !valor) {
      if (el.tagName === "SELECT") return "Elegí una opción.";
      if (nombre === "dia") return "Elegí un día para el turno.";
      if (nombre === "nombre") return "Decinos tu nombre así sabemos quién sos.";
      if (nombre === "telefono") return "Dejanos un teléfono para confirmarte el turno.";
      if (nombre === "km") return "Poné el kilometraje aproximado.";
      if (nombre === "modelo" || nombre === "auto") return "Escribí la marca y el modelo del auto.";
      if (nombre === "problema") return "Contanos qué le pasa al auto.";
      return "Este dato nos hace falta.";
    }
    if (!valor) return "";

    if (nombre === "dia") {
      var r = revisarFecha(valor);
      return r.ok ? "" : r.motivo;
    }
    if (nombre === "telefono") {
      var digitos = soloNumeros(valor);
      if (digitos.length < 7 || digitos.length > 15) {
        return "Poné un teléfono donde podamos ubicarte (ej: 099 123 456).";
      }
      return "";
    }
    if (nombre === "km") {
      var km = soloNumeros(valor);
      if (!km) return "Poné el kilometraje en números (ej: 60000).";
      if (km.length > 7) return "Ese kilometraje parece demasiado alto, revisalo.";
      return "";
    }
    if (nombre === "nombre" && valor.length < 2) return "Escribí tu nombre.";
    if (nombre === "problema" && valor.length < 5) {
      return "Contanos un poco más de lo que le pasa al auto.";
    }
    if ((nombre === "modelo" || nombre === "auto") && valor.length < 2) {
      return "Escribí el modelo del auto.";
    }
    return "";
  }

  function validarFormulario(form) {
    var primerError = null;

    // Campos comunes
    $$("input:not([type=radio]), select, textarea", form).forEach(function (el) {
      var error = validarCampo(el);
      if (error) {
        marcarError(el, error);
        if (!primerError) primerError = el;
      } else {
        limpiarError(el);
      }
    });

    // Grupos de opciones (radios)
    $$(".opciones", form).forEach(function (grupo) {
      var radios = $$("input[type=radio]", grupo);
      if (!radios.length) return;
      var obligatorio = radios.some(function (r) { return r.hasAttribute("required"); });
      var elegido = radios.some(function (r) { return r.checked; });
      if (obligatorio && !elegido) {
        marcarError(radios[0], "Elegí una opción.");
        if (!primerError) primerError = radios[0];
      } else {
        limpiarError(radios[0]);
      }
    });

    return primerError;
  }

  /* Arma el texto que se manda por WhatsApp. */
  function armarMensaje(form) {
    var titulo = form.getAttribute("data-titulo") || "UN TURNO";
    var datos = [];
    var contacto = [];

    $$("[data-label]", form).forEach(function (el) {
      var etiqueta = el.getAttribute("data-label");
      var valor = "";

      if (el.classList && el.classList.contains("opciones")) {
        var marcado = $("input[type=radio]:checked", el);
        valor = marcado ? marcado.value : "";
      } else {
        valor = (el.value || "").trim();
        if (el.getAttribute("name") === "dia" && valor) valor = fechaEnPalabras(valor);
        if (el.getAttribute("name") === "km" && valor) {
          var n = soloNumeros(valor);
          if (n) valor = Number(n).toLocaleString("es-UY") + " km";
        }
      }
      if (!valor) return;

      var linea = etiqueta + ": " + valor;
      if (el.getAttribute("data-grupo") === "contacto") contacto.push(linea);
      else datos.push(linea);
    });

    var partes = ["Hola, quiero pedir turno para " + titulo, ""];
    if (datos.length) partes.push(datos.join("\n"), "");
    if (contacto.length) partes.push(contacto.join("\n"), "");
    partes.push("(enviado desde la web)");
    return partes.join("\n");
  }

  function prepararFormularios() {
    $$("form.form").forEach(function (form) {
      var fallback = $(".form__fallback", form);

      // Al corregir un campo con error, el error desaparece solo.
      $$("input, select, textarea", form).forEach(function (el) {
        var evento = (el.tagName === "SELECT" || el.type === "date" || el.type === "radio")
          ? "change" : "input";
        el.addEventListener(evento, function () {
          var campo = contenedorCampo(el);
          if (campo && campo.classList.contains("campo--error") && !validarCampo(el)) {
            limpiarError(el);
          }
        });
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (fallback) fallback.hidden = true;

        var primerError = validarFormulario(form);
        if (primerError) {
          primerError.focus({ preventScroll: true });
          var campo = contenedorCampo(primerError);
          if (campo && campo.scrollIntoView) {
            campo.scrollIntoView({ block: "center", behavior: "smooth" });
          }
          return;
        }

        var url = linkWhatsApp(armarMensaje(form));

        // Dejamos el link listo antes de abrir, por si el navegador bloquea.
        if (fallback) {
          var a = $("a", fallback);
          if (a) a.setAttribute("href", url);
        }

        var ventana = null;
        try { ventana = window.open(url, "_blank"); } catch (err) { ventana = null; }
        if (!ventana) {
          if (fallback) {
            fallback.hidden = false;
            var link = $("a", fallback);
            if (link) link.focus();
          } else {
            window.location.href = url;
          }
        }
      });
    });
  }

  /* ====================== 9. ANIMACIONES DE APARICIÓN ====================== */
  /* El contenido siempre se ve. Solo si el JS llega hasta acá y el visitante
     no pidió menos movimiento, escondemos para revelar al scrollear.        */

  function prepararAnimaciones() {
    var elementos = $$("[data-revelar]");
    if (!elementos.length) return;

    var menosMovimiento = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (menosMovimiento || !("IntersectionObserver" in window)) return;

    document.documentElement.classList.add("js-anim");

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("revelado");
          obs.unobserve(entrada.target);
        }
      });
    }, { rootMargin: "0px 0px -60px 0px", threshold: 0.08 });

    elementos.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i, 6) * 60) + "ms";
      obs.observe(el);
    });

    // Red de seguridad: pase lo que pase, a los 3 segundos todo se ve.
    setTimeout(function () {
      elementos.forEach(function (el) { el.classList.add("revelado"); });
    }, 3000);
  }

  /* ============================== ARRANQUE ================================= */

  function iniciar() {
    // Cada bloque va por separado: si uno falla, los demás siguen funcionando.
    [pintarDatosDelNegocio, pintarEstado, pintarCupos, prepararFechas,
     prepararMenu, prepararTabs, prepararFormularios, prepararAnimaciones]
      .forEach(function (fn) {
        try { fn(); } catch (err) {
          if (window.console && console.error) console.error("Automecanica AC:", err);
        }
      });

    // El cartel de abierto/cerrado se actualiza solo cada minuto.
    setInterval(function () {
      try { pintarEstado(); } catch (err) {}
    }, 60000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
