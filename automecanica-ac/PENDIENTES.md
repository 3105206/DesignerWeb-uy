# Pendientes — Automecanica AC

Lista de todo lo que quedó como **placeholder** en la web y hay que pedirle al
cliente. Está ordenada por urgencia.

Cada punto dice también **dónde se carga** una vez que llegue el dato.

---

## 🔴 Bloqueante — sin esto la web no sirve

### 1. Número de WhatsApp del taller

Es el dato más importante: **todos los pedidos de turno terminan ahí**.
Hoy está cargado un número de prueba, `59899000000`, que no existe.

- **Dónde se carga:** `js/config.js` → `NEGOCIO.whatsapp`
- **Formato:** código de país + número, sin `+`, sin espacios, sin el 0 inicial.
  El celular `099 123 456` se escribe `"59899123456"`.
- Conviene que sea un número con **WhatsApp Business** y con el horario de
  atención configurado, así el que escribe fuera de hora recibe respuesta
  automática.

---

## 🟡 Importante — conviene tenerlo antes de publicar

### 2. Fotos reales del taller

Hoy la web no tiene ni una foto. Funciona, pero una foto del frente del local
es lo que le dice al vecino de Melo "ah, es ese taller".

Lo que sirve, en orden de prioridad:

- **Frente del taller desde la vereda** (para que lo reconozcan al pasar)
- **Los boxes / la zona de trabajo** (2 o 3 fotos)
- **El equipo trabajando** (sin poses, laburando)
- **La alineadora y el elevador**, si se quieren mostrar

Sacadas con el celular está perfecto, siempre que sea de día y sin contraluz.
Horizontales, no verticales.

- **Dónde van:** carpeta `assets/`
- **Además:** la imagen de previsualización que se ve cuando alguien comparte
  el link por WhatsApp o Facebook (`assets/og-image.png`, 1200 x 630 px) hoy
  es **provisoria**: está armada solo con el logo y los datos, sin foto.
  Conviene rehacerla con la mejor foto del frente del taller. El archivo ya
  está referenciado en `index.html` (buscar `og:image`), así que alcanza con
  reemplazarlo respetando el nombre y el tamaño.

### 3. Logo original en buena calidad

En la web hay una **reconstrucción vectorial** del logo (`assets/logo.svg`),
redibujada a partir del logo original: mismas formas, mismos colores y misma
composición (cápsula azul + mancha amarilla + AC con contorno). La diferencia
es la tipografía: usa Archivo, la del sitio, no la letra exacta del original.

Lo ideal es reemplazarla por el archivo del cliente: el **vectorial**
(`.ai`, `.svg` o `.pdf`) o, si no existe, el `.png` más grande que tengan,
con fondo transparente.

- **Dónde va:** en `assets/`. Si el archivo es `logo.png`, hay que cambiar
  la ruta en `index.html`: aparece 2 veces (header y pie), buscar
  `assets/logo.svg`. Y ajustar los atributos `width` y `height` del `<img>`
  a las medidas reales del archivo nuevo, así la página no "salta" mientras
  carga.
- El favicon (`assets/favicon.svg`) y la imagen de previsualización
  (`assets/og-image.png`) están hechos con la misma reconstrucción: conviene
  rehacerlos también cuando llegue el original.

### 4. Email de contacto

Hoy está vacío, así que la fila de email **no se muestra** en la web. No queda
ningún hueco raro, pero es un canal menos.

- **Dónde se carga:** `js/config.js` → `NEGOCIO.email`
- Si no quieren mostrar email, se deja vacío y listo: es una decisión válida.

### 5. Instagram y Facebook

Mismo caso: si no hay links cargados, los botones de redes no aparecen.

- **Dónde se carga:** `js/config.js` → `NEGOCIO.instagram` y `NEGOCIO.facebook`
- **Formato:** el link completo, por ejemplo
  `"https://instagram.com/automecanicaac"`

---

## 🟢 Para mejorar la web más adelante

### 6. Años de trayectoria del taller

No se inventó ningún número. Si el taller tiene, por ejemplo, 18 años, eso
vale mucho en una ciudad como Melo y merece estar en el hero
("18 años arreglando autos en Melo").

- **Qué hay que preguntar:** ¿desde qué año está abierto el taller?
- **Dónde iría:** en el hero de `index.html`, abajo del título.

### 7. Nombre del responsable / jefe de taller

Poner cara y nombre genera confianza, sobre todo en el interior.
Ideal: nombre + una foto + una línea corta ("Fulano, jefe de taller").

- **Qué hay que preguntar:** nombre del responsable y si quiere aparecer.
- **Dónde iría:** una sección corta nueva entre "Servicios" y "Dónde estamos".

### 8. Testimonios de clientes

No se puso ninguno porque **no se inventan testimonios**. Si el taller junta
3 o 4 comentarios reales (con nombre y autorización), se agregan.

Lo más fácil: pedirle a los clientes que dejen su reseña en Google Maps y
después usar esas, que además ayudan al posicionamiento.

### 9. Certificaciones oficiales

Si las marcas dan algún certificado, diploma o cartel de "service oficial
autorizado", conviene fotografiarlo y mostrarlo. Es la prueba del diferencial
más fuerte que tiene el taller.

### 10. Confirmar cómo se habla de la garantía

En la sección de marcas dice: *"Seguimos el plan de mantenimiento de cada
marca, con los kilometrajes que corresponden"*.

A propósito **no** se afirma nada sobre mantener la garantía de fábrica.
Si el taller efectivamente puede hacer el service sin que el cliente pierda la
garantía, conviene decirlo con todas las letras, porque es un argumento de
venta muy fuerte. Pero hay que confirmarlo con ellos antes de escribirlo.

### 11. Dominio propio

Hoy los links de `<link rel="canonical">` y de Open Graph en `index.html`
apuntan a `https://automecanica-ac.netlify.app/`. Si se compra un dominio
(por ejemplo `automecanicaac.com.uy`), hay que actualizarlos.

- **Dónde:** `index.html`, buscar `REEMPLAZAR` (aparece en `canonical` y en
  `og:url`).

### 12. Ficha de Google Business Profile

No es parte de la web, pero para un negocio local **rinde más que todo lo
demás**. Si el taller no tiene la ficha creada y verificada en Google Maps,
es lo primero que habría que hacer: la web ya trae los datos estructurados
(`AutoRepair`) preparados para que Google los cruce con la ficha.

### 13. Confirmar la URL de DesignWeb.uy

El crédito del pie apunta a `https://designweb.uy`. Si el sitio de la agencia
está en otra dirección, hay que corregirlo en `index.html`.

---

## Cómo encontrar los placeholders en el código

Todos los lugares que esperan un dato real están marcados con un comentario
`<!-- REEMPLAZAR -->` en el HTML y con `// REEMPLAZAR:` en `js/config.js`.

Para listarlos todos de una, desde la carpeta del proyecto:

```
grep -rn "REEMPLAZAR" .
```
