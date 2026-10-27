# The Impostor

Juego de deducción local para **3 a 20 personas**. Todos salvo los impostores reciben la misma palabra secreta. Un solo teléfono alcanza para repartir roles y votar.

## Cómo jugar

1. Elegí la cantidad de jugadores (3–20), impostores (1–5 según el tamaño del grupo), una categoría y un tiempo de debate opcional.
2. Pasen el teléfono de persona a persona. Cada jugador ve su rol en privado y lo oculta antes de continuar.
3. El juego elige al azar quién inicia el debate. Describan la palabra sin decirla y busquen a quien improvisa.
4. Cada jugador vota una vez y no puede votarse a sí mismo. El recuento aparece solo cuando todos terminaron.
5. Revelen la palabra y los impostores. Si hay un único jugador más votado y es impostor, el grupo acertó. Un empate no se considera acierto.

**Nueva ronda** conserva la configuración. Las palabras de cada categoría no se repiten hasta agotar la lista; al comenzar una nueva vuelta se evita repetir la palabra de la ronda anterior.

## Ejecutar

Abrí `index.html` en un navegador moderno. El juego funciona sin servidor, instalación ni conexión a internet. Conservá juntos `index.html`, los archivos `.js`, `styles.css` y `imagenes/`.

La versión de un solo archivo, `The-Impostor-Pro.html`, está en la entrega separada y también se puede abrir directamente.

## Publicar en GitHub Pages

1. Extraé el ZIP del proyecto.
2. Subí **el contenido de la carpeta** al nivel principal del repositorio: `index.html` debe quedar en la raíz, junto a `styles.css`, los archivos `.js` y `imagenes/`. No subas el ZIP como archivo del repositorio.
3. En **Settings → Pages**, seleccioná **Deploy from a branch**, la rama `main` y `/(root)`.

Referencia: [documentación oficial de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Desarrollo y pruebas

Las reglas están en `game-core.js`, la interfaz en `theimposter.js`, las palabras en los archivos de categoría y el estilo en `styles.css`.

Con Node.js instalado, ejecutá `npm test` para comprobar validación, asignación de impostores, rotación de palabras y recuento de votos. El juego en sí no necesita Node.js.
