# HALLEY — Landing page

Landing page cinematográfica de una sola página para la campaña **HALLEY**.
Imagen del alunizaje (NASA) a pantalla completa, botón central *liquid glass*,
banda sonora en loop y footer con redes. Optimizada para tráfico de bio de Instagram.

## Estructura del proyecto

```
HalleyWeb/
├── index.html              # Marcado de la página
├── css/
│   └── styles.css          # Todos los estilos
├── js/
│   ├── main.js             # Música (play/pause + autoplay en loop)
│   ├── spotlight.js        # Círculo B&N + glitch que sigue al cursor
│   └── grain.js            # Grano fílmico animado sobre toda la web
├── assets/
│   ├── images/
│   │   ├── img3.jpg        # Imagen de fondo (hero)
│   │   └── HALLEYlogo.png  # Logo del navbar
│   └── audio/
│       └── One Small Step, One Giant Leap.mp3   # Banda sonora
└── README.md
```

## Cómo verlo / probarlo

La página usa archivos externos (CSS/JS), así que conviene servirla con un
servidor local en vez de abrir el `index.html` directo:

```bash
# desde la carpeta del proyecto
python3 -m http.server 8000
```

Luego abrir: http://localhost:8000

## Qué tocar para personalizar

| Quiero cambiar...                | Dónde                                                                 |
|----------------------------------|-----------------------------------------------------------------------|
| Imagen de fondo                  | `assets/images/` + el `src` del `.hero` y la `aspect-ratio` en `styles.css` |
| Logo del navbar                  | `assets/images/` + el `src` de `.navbar__logo` (tamaño en `styles.css`) |
| Texto del botón                  | El `<a class="cta">` en `index.html`                                  |
| Link del botón                   | El `href` del `<a class="cta">`                                       |
| Texto del footer                 | `.footer__brand` en `index.html`                                      |
| Canción                          | `assets/audio/` + el `src` del `<audio id="track">`                   |
| Círculo B&N / glitch / grano     | `js/spotlight.js` y `js/grain.js` (variables al inicio de cada archivo) |
| Colores / estilos                | `css/styles.css`                                                      |

## Pendiente de completar (links de redes)

En el footer de `index.html`, reemplazar:

- **TikTok** → `https://www.tiktok.com/@halley.experience` (confirmar el handle real)
- **WhatsApp** → `https://wa.me/0000000000` (poner el número con código de país, sin `+`,
  ej. `https://wa.me/5491122334455`)

> Nota: la **imagen** de fondo y la **aspect-ratio** en `styles.css` están calibradas
> para `img3.jpg` (3080×1883). Si cambiás la imagen, actualizá ambos valores.
