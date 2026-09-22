# Un pequeño universo

Experiencia de flores amarillas en Three.js y WebGL, sin frameworks. El archivo `proyecto.tex` se conserva como especificación original.

## Abrir

Abre **index.html** directamente en Chrome, Edge o Firefox. `script.js` incluye Three.js y todo el código necesario; no requiere CDN, servidor, cuenta ni instalación. Las fuentes de Google son opcionales: sin internet se usan fuentes del sistema. Flores, texturas y audio se generan localmente; no se envían ni guardan nombres.

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

- `index.html`: introducción, textos y controles accesibles.
- `style.css`: composición, tipografía, móvil y movimiento reducido.
- `src/config.js`: nombre especial, alias íntimos, partículas, flores, giro, calidad, velocidad, colores, glow, cámara y frecuencia de mensajes.
- `src/galaxy.js`: renderer, cámara, shaders, espiral 3D, texturas de flores, parallax, partículas del nombre y explosiones.
- `src/messages.js`: 104 frases para Zoraya y 104 para amistad, con categorías y barajado sin repetir hasta agotar el banco.
- `src/messages.js`: también contiene sorpresas cortas para flores y 25 notas de apoyo para estrellas de colores, con mensajes sobre descanso, salud, estrés, tesis, graduación y orgullo por sus logros.
- `src/audio.js`: ambiente, viento y campanillas sintetizados mediante Web Audio.
- `src/dedication.js`: dedicatoria especial dividida en constelaciones, con tiempos editables y cierre «Hasta más allá del Fin / ZORAYA». Para Zoraya, se abre tanto al encontrar la flor secreta como con «una última cosa»; dura 97 segundos y termina en negro.
- `src/main.js`: secuencias, estado, interacción y transiciones.
- `script.js`: versión compilada lista para abrir. Ejecuta `npm run build` después de modificar `src/`.
- `scripts/dev.mjs`: servidor y compilación continua.
- `tests/experience.spec.js`: comprobaciones funcionales.

## Recorrido

La entrada comienza negra. Zoraya se reconoce sin distinguir mayúsculas y con espacios exteriores normalizados. Su recorrido es pausado, con más polvo estelar y frases de cariño, gratitud y buenos deseos. Los otros nombres reciben un recorrido independiente, más dinámico, con más flores y variantes de pétalos.

La galaxia se forma lentamente; después florece y abre una flor central. Toca flores para leer mensajes, estrellas para recuerdos o buenos deseos, y toca dos veces para liberar partículas. Mueve el cursor o arrastra con el dedo para explorar. El scroll adelanta suavemente la introducción poética. Una flor diminuta esconde una secuencia secreta.

El modo íntimo se activa con `Zoraya`, `Zoraya Estefania Sailema Palate`, `Pinguinita`, `Bubucita`, `Mumilona`, `Enojona`, `Cachetonsita`, `Cacetonsita` o `Comelona`, sin importar mayúsculas ni espacios repetidos. Al tocar una flor aparecen dedicatorias ligeras con esos apodos y pequeñas ocurrencias inspiradas en el chat, siempre usando texto seguro y alegre. Las flores se colocan sobre los brazos de la espiral y giran con su fase orbital para sentirse nacidas del polvo. Las estrellas de color orbitan a distintas velocidades y tienen un área de toque amplia; al tocar una se abre una nota visual con una frase larga de apoyo. Cada color guarda una sorpresa diferente: corazón de partículas, cometa, lluvia dorada o constelación. Escape o la × cierran la nota sin abandonar la galaxia.

«Una última cosa» reúne las partículas en el nombre y abre una despedida de unos 54 segundos: constelación, dispersión, una última flor y negro. Volver permite comenzar de nuevo. Escape vuelve al inicio; flecha derecha revela otra frase; espacio pausa cuando el foco está sobre la página. Los botones funcionan con teclado y los controles reaparecen al mover el puntero, tocar o usar el teclado.

El sonido está apagado inicialmente y solo se habilita con su botón. Pausa detiene animaciones, secuencias, frases y audio. Las pestañas ocultas suspenden la experiencia. El ajuste automático reduce partículas, flores y resolución en pantallas pequeñas; LOW/MEDIUM/HIGH pueden fijarse en la configuración. Se respeta la preferencia del sistema de movimiento reducido. Glow y profundidad se simulan con sprites aditivos y partículas para evitar un postprocesado costoso.

Para publicar, basta con servir `index.html`, `style.css` y `script.js` en un alojamiento estático. No hay backend.
