/* =============================================================================
   AUTOMECANICA AC — ARCHIVO DE CONFIGURACIÓN
   -----------------------------------------------------------------------------
   Este es el ÚNICO archivo que hace falta tocar para el día a día.
   Se edita con cualquier editor de texto (Bloc de notas, TextEdit, VS Code).

   REGLAS PARA NO ROMPER NADA:
   1. Cambiá solamente lo que está DESPUÉS de los dos puntos ":".
   2. El texto va siempre entre comillas "así".
   3. Los números van sin comillas: 3, 2, 1.
   4. true = sí / abierto     false = no / cerrado   (van sin comillas)
   5. No borres las comas al final de cada línea.
   6. Guardá el archivo y subí la carpeta de nuevo a Netlify. Listo.

   Si algo se rompe, lo más probable es que falte una comilla o una coma.
   ========================================================================== */


/* -----------------------------------------------------------------------------
   1) DISPONIBILIDAD DE CUPOS
   -----------------------------------------------------------------------------
   cupos   = cuántos autos por día se pueden tomar de ese tipo de trabajo.
   abierto = true  -> el formulario funciona normal.
             false -> se muestra "sin cupos por el momento", el formulario
                      queda desactivado y se invita a escribir igual por WhatsApp.

   diasCompletos = días puntuales que ya están llenos. Formato "AAAA-MM-DD".
                   Ejemplo: "2026-10-02" es el 2 de octubre de 2026.
   //                 (esa fecha es solo un ejemplo: borrala cuando no aplique)
                   Si hay lugar todos los días, dejalo vacío así: []

   diasCerrados  = feriados o días en que el taller directamente no abre.
                   Mismo formato que diasCompletos.

   Los sábados, los domingos y las fechas pasadas ya se bloquean solos.
-------------------------------------------------------------------------------*/
const DISPONIBILIDAD = {
  service:    { cupos: 3, abierto: true },
  reparacion: { cupos: 2, abierto: true },
  alineacion: { cupos: 1, abierto: true },
  // Fechas sin cupo (formato YYYY-MM-DD). Vaciar el array si hay lugar todos los días.
  diasCompletos: ["2026-10-02"],
  // Feriados o días que el taller no abre
  diasCerrados: []
};


/* -----------------------------------------------------------------------------
   2) DATOS DEL TALLER
   -----------------------------------------------------------------------------
   telefono        = como se muestra en pantalla.
   telefonoLink    = el mismo número para que el celular pueda llamar
                     (con +598 y sin espacios).
   whatsapp        = número al que llegan los pedidos de turno.
                     Va con código de país y SIN el signo +, sin espacios
                     y sin el 0 inicial. Ejemplo: 099 123 456 -> "59899123456"
   email           = correo de contacto.
   direccion       = dirección de la puerta del taller.
-------------------------------------------------------------------------------*/
const NEGOCIO = {
  nombre: "Automecanica AC",
  telefono: "4643 4358",
  telefonoLink: "+59846434358",

  // REEMPLAZAR: número de WhatsApp real del taller (hoy es un número de prueba)
  whatsapp: "59899000000",

  // REEMPLAZAR: email real de contacto. Dejar "" (vacío) si no quieren mostrar email.
  email: "",

  direccion: "Juana de Ibarbourou 760",
  ciudad: "Melo",
  departamento: "Cerro Largo",
  codigoPostal: "37000",
  pais: "Uruguay",

  // Link del botón "Cómo llegar"
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Juana+de+Ibarbourou+760,+37000+Melo,+Cerro+Largo,+Uruguay",

  // REEMPLAZAR: links de redes. Dejar "" (vacío) y el ícono no se muestra.
  instagram: "",
  facebook: ""
};


/* -----------------------------------------------------------------------------
   3) HORARIOS
   -----------------------------------------------------------------------------
   De esto salen dos cosas: el cartel "Abierto ahora / Cerrado" y qué días
   se pueden elegir en los formularios de turno.

   abre / cierra van en formato de 24 horas: "8:00" y "17:30".
   Un día con abierto: false queda cerrado y no se puede pedir turno.
-------------------------------------------------------------------------------*/
const HORARIOS = {
  lunes:     { abierto: true,  abre: "8:00", cierra: "17:30" },
  martes:    { abierto: true,  abre: "8:00", cierra: "17:30" },
  miercoles: { abierto: true,  abre: "8:00", cierra: "17:30" },
  jueves:    { abierto: true,  abre: "8:00", cierra: "17:30" },
  viernes:   { abierto: true,  abre: "8:00", cierra: "17:30" },
  sabado:    { abierto: false },
  domingo:   { abierto: false }
};


/* -----------------------------------------------------------------------------
   4) MARCAS CON SERVICE OFICIAL
   -----------------------------------------------------------------------------
   Si mañana se suma o se cae una marca, se agrega o se borra una línea acá.
   Ojo: si sacás una marca de esta lista, acordate de sacarla también del
   listado de marcas de index.html (buscá la palabra en el archivo).
-------------------------------------------------------------------------------*/
const MARCAS = [
  "Nissan",
  "Peugeot",
  "Mitsubishi",
  "Renault",
  "Great Wall",
  "Omoda",
  "BYD"
];


/* -----------------------------------------------------------------------------
   5) TIPOS DE SERVICE POR KILOMETRAJE
   -----------------------------------------------------------------------------
   Opciones que aparecen en el formulario de service oficial.
-------------------------------------------------------------------------------*/
const TIPOS_SERVICE = [
  "Service de 5.000 km",
  "Service de 10.000 km",
  "Service de 20.000 km",
  "Service de 40.000 km",
  "No estoy seguro"
];


/* -----------------------------------------------------------------------------
   6) NIVELES DE URGENCIA (formulario de reparaciones)
-------------------------------------------------------------------------------*/
const URGENCIAS = [
  "Puede esperar",
  "Lo necesito esta semana",
  "Es urgente"
];


/* =============================================================================
   DE ACÁ PARA ABAJO NO HACE FALTA TOCAR NADA.
   Esta línea es la que le pasa la configuración al resto de la web.
   ========================================================================== */
window.AUTOMECANICA_CONFIG = {
  DISPONIBILIDAD: DISPONIBILIDAD,
  NEGOCIO: NEGOCIO,
  HORARIOS: HORARIOS,
  MARCAS: MARCAS,
  TIPOS_SERVICE: TIPOS_SERVICE,
  URGENCIAS: URGENCIAS
};
