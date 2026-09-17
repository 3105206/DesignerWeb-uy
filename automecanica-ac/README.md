# Automecanica AC — sitio web

Web de una sola página para **Automecanica AC**, taller mecánico y service oficial
en Juana de Ibarbourou 760, Melo, Cerro Largo.

El objetivo de la web es uno solo: que alguien con el auto roto o con el service
al día encuentre el taller, vea que atienden su marca y mande el WhatsApp para
pedir turno.

---

## 1. Qué hay adentro de la carpeta

```
index.html        La página entera (texto, secciones, formularios)
css/style.css     Los colores, tipografías y el diseño
js/config.js      ⭐ EL ARCHIVO QUE SE EDITA: teléfono, WhatsApp, horarios, cupos
js/main.js        El funcionamiento (turnos, WhatsApp, menú, validaciones)
assets/           Logo, favicon e imágenes
README.md         Este archivo
PENDIENTES.md     Lo que falta pedirle al cliente
```

No hay que instalar nada. No hay programas que compilar. Son archivos sueltos
que cualquier navegador abre.

---

## 2. Cómo verla en tu computadora

Hacé doble clic en `index.html`. Se abre en el navegador y funciona.

(El mapa de Google y las tipografías necesitan internet. Sin internet la página
se ve igual, solo cambia un poco la letra y el mapa queda en blanco.)

---

## 3. Cómo subirla a Netlify

**La primera vez**

1. Entrá a [app.netlify.com](https://app.netlify.com) y creá una cuenta gratis.
2. En el panel, buscá la opción **"Add new site" → "Deploy manually"**.
3. Arrastrá la carpeta `automecanica-ac` entera al recuadro que dice
   "Drag and drop your site output folder here".
4. Esperá unos segundos. Netlify te da una dirección tipo
   `algo-random-123.netlify.app`. Ya está online.
5. Si querés, en **Site configuration → Change site name** le ponés un nombre
   más lindo, por ejemplo `automecanica-ac`.

**Cada vez que cambies algo**

1. Entrá al sitio en Netlify.
2. Andá a la pestaña **"Deploys"**.
3. Arrastrá de nuevo la carpeta entera al recuadro de abajo que dice
   "Drag and drop your site output folder here".
4. En 10 segundos la web nueva reemplaza a la vieja. La dirección no cambia.

> Importante: siempre se arrastra **la carpeta completa**, no los archivos sueltos.

---

## 4. Cómo se edita `js/config.js`

Este es el único archivo que hace falta tocar para el día a día.
Se abre con el Bloc de notas (Windows), TextEdit (Mac) o cualquier editor.

**Cuatro reglas para no romper nada:**

1. Cambiá solo lo que está **después** de los dos puntos `:`
2. El texto va siempre entre comillas `"así"`
3. Los números van **sin** comillas: `3`
4. `true` = sí / abierto · `false` = no / cerrado (también sin comillas)

Si algo deja de andar, casi seguro falta una comilla o una coma. Deshacé el
cambio (Ctrl+Z) y probá de nuevo.

### Cambiar el número de WhatsApp

Buscá la línea que dice `whatsapp:` y poné el número con el código de país,
**sin el signo +, sin espacios y sin el 0 de adelante**:

```js
// El celular 099 123 456 se escribe así:
whatsapp: "59899123456",
```

Ese número es al que llegan todos los pedidos de turno.

### Cambiar el teléfono fijo

```js
telefono: "4643 4358",            // como se ve en la pantalla
telefonoLink: "+59846434358",     // el mismo número, para llamar desde el celular
```

Cambiá los dos, siempre.

### Cambiar el email o las redes

```js
email: "taller@ejemplo.com",
instagram: "https://instagram.com/usuario",
facebook: "",
```

Si dejás algo vacío (`""`), ese dato simplemente no aparece en la web.
No queda un espacio raro ni un link roto.

### Cambiar los horarios

```js
const HORARIOS = {
  lunes:   { abierto: true,  abre: "8:00", cierra: "17:30" },
  ...
  sabado:  { abierto: false },
};
```

De acá salen dos cosas: el cartel de **"Abierto ahora / Cerrado"** que se
calcula solo con la hora de Uruguay, y **qué días se pueden elegir** en los
formularios de turno. Si ponés `sabado: { abierto: true, abre: "8:00", cierra: "12:00" }`,
el sábado pasa a poder elegirse como día de turno.

### Cerrar y abrir cupos (lo que más se usa)

```js
const DISPONIBILIDAD = {
  service:    { cupos: 3, abierto: true },
  reparacion: { cupos: 2, abierto: true },
  alineacion: { cupos: 1, abierto: true },
  diasCompletos: ["2026-10-02"],
  diasCerrados: []
};
```

**Para cambiar cuántos autos por día se toman:** cambiá el número de `cupos`.
El número se muestra solo en las pestañas de turnos y en la sección de servicios.

**Para cerrar un tipo de trabajo** (por ejemplo, la alineadora está rota):

```js
alineacion: { cupos: 1, abierto: false },
```

Esa pestaña pasa a decir "Sin cupos por el momento", el formulario queda
desactivado y en su lugar aparece un botón para escribir igual por WhatsApp.
Cuando se arregla, volvés a poner `true`.

**Para bloquear un día puntual que ya está lleno:**

```js
diasCompletos: ["2026-10-02", "2026-10-15"],
```

Las fechas van en formato **año-mes-día**, entre comillas y separadas por comas.
Si no hay ningún día lleno, dejalo así: `diasCompletos: []`

**Para bloquear un feriado o un día que el taller no abre:**

```js
diasCerrados: ["2026-12-25"],
```

Los sábados, los domingos y las fechas que ya pasaron se bloquean solos.
No hace falta cargarlos.

> Acordate de borrar las fechas viejas de vez en cuando. No rompen nada,
> pero la lista se va llenando de días que ya pasaron.

### Agregar o sacar una marca

```js
const MARCAS = [
  "Nissan",
  "Peugeot",
  ...
];
```

Eso cambia la lista del formulario de service. **Ojo:** los cuadraditos de
marcas que se ven en la sección "Service oficial de 7 marcas" están escritos
en `index.html`. Si sumás o sacás una marca, buscá el nombre en ese archivo y
agregalo o borralo también ahí (es un bloque que dice `marca-item`).

---

## 5. Cómo funciona el pedido de turno

No hay base de datos ni servidor: **nada se guarda en ningún lado**.

1. La persona completa el formulario.
2. La web revisa que esté todo bien (día hábil, teléfono válido, etc.) y si
   falta algo lo marca en rojo abajo del campo.
3. Si está todo bien, se arma un mensaje de WhatsApp con los datos y se abre
   WhatsApp con el mensaje ya escrito.
4. **La persona toca "enviar" en WhatsApp.** Recién ahí llega el pedido al taller.

El mensaje llega así:

```
Hola, quiero pedir turno para SERVICE OFICIAL

Marca: Nissan
Modelo y año: Frontier 2019
Kilometraje: 60.000 km
Tipo de service: No estoy seguro
Día que me viene bien: martes 22 de septiembre

Nombre: Juan Pérez
Teléfono: 099 123 456

(enviado desde la web)
```

Si el navegador bloquea la apertura automática de WhatsApp (pasa en algunos
celulares), aparece un cartel amarillo con un link para tocar a mano. No se
pierde el pedido.

**El día y la hora los confirma el taller.** La web solo dice qué día le
viene bien al cliente; no reserva nada automáticamente.

---

## 6. Detalles técnicos (para quien venga después)

- HTML, CSS y JavaScript sin librerías ni build. Única dependencia externa:
  Google Fonts (Archivo + Inter).
- Todo el contenido está escrito en el HTML: si el JavaScript falla o tarda,
  la página se ve igual. Las animaciones de aparición solo se activan cuando
  el JS corre, nunca al revés.
- `js/config.js` es la fuente de verdad de teléfono, WhatsApp, dirección,
  horarios y cupos. El HTML trae los mismos datos escritos como copia de
  seguridad por si el JS no carga: si cambiás el teléfono y querés dejarlo
  perfecto, buscá el número viejo en `index.html` y reemplazalo también.
  La web ya funciona bien solo con editar `config.js`.
- El estado "Abierto ahora / Cerrado" se calcula con la hora de Montevideo
  (`America/Montevideo`), no con la hora del visitante.
- Accesibilidad: navegación por teclado, foco visible, labels reales, áreas
  táctiles de 44px o más, contraste AA. El amarillo nunca se usa para texto
  sobre blanco.
- SEO local: título y descripción con "Melo" y "Cerro Largo", Open Graph y
  datos estructurados `AutoRepair` (dirección, teléfono, horarios y marcas).
- Se respeta `prefers-reduced-motion` para quien tenga las animaciones
  desactivadas en su sistema.

---

## 7. Qué falta

Está todo en [`PENDIENTES.md`](PENDIENTES.md): datos y fotos que hay que
pedirle al cliente antes de publicar el sitio definitivo.

Lo más urgente: **el número de WhatsApp real**. Hasta que se cargue, los
pedidos de turno van a un número de prueba que no existe.

---

Sitio hecho por [DesignWeb.uy](https://designweb.uy)
