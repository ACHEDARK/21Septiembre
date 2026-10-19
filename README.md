# Un pequeño universo

Experiencia de flores amarillas en Three.js y WebGL, sin frameworks. El archivo `proyecto.tex` se conserva como especificación original.

## Abrir

Abre **index.html** para el menú de recuerdos o **flores-amarillas.html** para probar directamente la experiencia original. Ambos funcionan en Chrome, Edge o Firefox.

También puedes usar Live Server de VS Code sobre `index.html`.

## Editar con preview

```sh
npm install
npm run dev
```

Abre http://localhost:8000. Esbuild recompila los módulos al guardar; actualiza el navegador para ver los cambios. Con Live Server se puede usar `npm run watch` para que su recarga automática refleje el bundle actualizado.

```sh
npm run build
npm test
```

Las pruebas de navegador requieren `npx playwright install chromium` la primera vez.

## Archivos

- `index.html`: menú de fechas especiales.
- `flores-amarillas.html`: experiencia original de las flores amarillas.
- `src/config.js`: nombre especial, alias íntimos, partículas, flores, giro, calidad, velocidad, colores, glow, cámara y frecuencia de mensajes.
- `src/galaxy.js`: renderer, cámara, shaders, espiral 3D, texturas de flores, parallax, partículas del nombre y explosiones.
- `src/messages.js`: 104 frases para Zoraya y 104 para amistad, con categorías y barajado sin repetir hasta agotar el banco.
- `src/messages.js`: también contiene sorpresas cortas para flores y 25 notas de apoyo para estrellas de colores, con mensajes sobre descanso, salud, estrés, tesis, graduación y orgullo por sus logros.
- `src/audio.js`: ambiente, viento y campanillas sintetizados mediante Web Audio.
- `src/dedication.js`: dedicatoria especial dividida en constelaciones, con tiempos editables y cierre «Hasta más allá del Fin / ZORAYA». Para Zoraya, se abre tanto al encontrar la flor secreta como con «una última cosa»; dura 97 segundos y termina en negro.
- `src/main.js`: secuencias, estado, interacción y transiciones.
- `menu.css`, `menu.js`: estilos e interacción del menú; `style.css`, `script.js`: estilos y bundle de la experiencia original.
- `scripts/dev.mjs`: servidor y compilación continua.
- `tests/experience.spec.js`: comprobaciones funcionales.

## Recorrido

La entrada comienza negra. Zoraya se reconoce sin distinguir mayúsculas y con espacios exteriores normalizados. Su recorrido es pausado, con más polvo estelar y frases de cariño, gratitud y buenos deseos. Los otros nombres reciben un recorrido independiente, más dinámico, con más flores y variantes de pétalos.

La galaxia se forma lentamente; después florece y abre una flor central. Toca flores para leer mensajes, estrellas para recuerdos o buenos deseos, y toca dos veces para liberar partículas. Mueve el cursor o arrastra con el dedo para explorar. El scroll adelanta suavemente la introducción poética. Una flor diminuta esconde una secuencia secreta.

El modo íntimo se activa con `Zoraya`, `Zoraya Estefania Sailema Palate`, `Pinguinita`, `Bubucita`, `Mumilona`, `Enojona`, `Cachetonsita`, `Cacetonsita` o `Comelona`, sin importar mayúsculas ni espacios repetidos. Al tocar una flor aparecen dedicatorias ligeras con esos apodos y pequeñas ocurrencias inspiradas en el chat, siempre usando texto seguro y alegre. Las flores se colocan sobre los brazos de la espiral y giran con su fase orbital para sentirse nacidas del polvo. Las estrellas de color orbitan a distintas velocidades y tienen un área de toque amplia; al tocar una se abre una nota visual con una frase larga de apoyo. Cada color guarda una sorpresa diferente: corazón de partículas, cometa, lluvia dorada o constelación. Escape o la × cierran la nota sin abandonar la galaxia.

«Una última cosa» reúne las partículas en el nombre y abre una despedida de unos 54 segundos: constelación, dispersión, una última flor y negro. Volver permite comenzar de nuevo. Escape vuelve al inicio; flecha derecha revela otra frase; espacio pausa cuando el foco está sobre la página. Los botones funcionan con teclado y los controles reaparecen al mover el puntero, tocar o usar el teclado.

El sonido está apagado inicialmente y solo se habilita con su botón. Pausa detiene animaciones, secuencias, frases y audio. Las pestañas ocultas suspenden la experiencia. El ajuste automático reduce partículas, flores y resolución en pantallas pequeñas; LOW/MEDIUM/HIGH pueden fijarse en la configuración. Se respeta la preferencia del sistema de movimiento reducido. Glow y profundidad se simulan con sprites aditivos y partículas para evitar un postprocesado costoso.

Para publicar, ejecuta `npm run build` y despliega los archivos estáticos de este proyecto en Vercel. No hay backend.

## Colección de fechas especiales

La ruta `/` muestra el menú de recuerdos. La experiencia original se conserva en `/flores-amarillas`; sus contenidos, animaciones y controles siguen en el mismo HTML y código fuente. Navidad, San Valentín y el cumpleaños tienen rutas propias servidas desde una plantilla compartida mientras se preparan sus contenidos particulares.

`src/special-dates.js` centraliza el catálogo, las rutas, las fechas anuales y la zona horaria `America/Bogota`. `firstYear` indica desde cuándo aplica cada celebración: se habilita durante su fecha local y vuelve a bloquearse al día siguiente hasta la próxima ocurrencia. El menú refresca las cuentas regresivas cada segundo. Al añadir una fecha, agrega una entrada al catálogo y define su ruta en `vercel.json`; para una experiencia visual propia, crea una página o amplía la plantilla compartida.

La comprobación de las rutas se ejecuta en el navegador y sirve como control de navegación. Este despliegue estático no protege contenido frente a quien inspeccione los archivos descargados o cambie el reloj local. Para un bloqueo real, se debe servir el contenido desde una función de Vercel que valide la fecha en el servidor y no incluir el contenido futuro en los archivos públicos.
