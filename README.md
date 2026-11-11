# Javier Galindo | Portfolio

Portfolio profesional con experiencia, proyectos, certificaciones y diez demostraciones interactivas.

## Ejecutar localmente

No requiere compilacion, dependencias de npm ni claves API. Desde esta carpeta:

```sh
python -m http.server 8000
```

Abre http://localhost:8000. Se recomienda servirlo por HTTP para que funcionen los lectores locales de PDF.

## Estructura

- `index.html`, `app.js`, `content.js`: pagina principal y contenido.
- `poc-*.js`, `poc*.css`: interfaces y simulaciones locales.
- `assets/`: fuentes, iconos y licencias.
- `demos/tickets/`: solamente la demo publica de soporte.
- `demos/research/`: figuras y resultados seleccionados que utiliza la demo publica.
- `vendor/`: lectores de PDF/DOCX y sus licencias.
- `tests/`: pruebas de comportamiento de las simulaciones.

Las carpetas `demos/` contienen recursos necesarios para la web, no los repositorios originales de los proyectos.

## Privacidad y simulaciones

Se ha preparado como proyecto independiente con historial Git nuevo. No contiene las carpetas originales, configuraciones de servicios, CV en PDF, documentos privados, credenciales, archivos de entrenamiento ni el historial del proyecto de trabajo.

Los ejemplos comerciales y de soporte son ficticios. Los informes marinos son resultados seleccionados y publicados. Los proyectos reconstruidos desde el CV se identifican en la interfaz. Las demos no llaman a modelos de IA ni consumen tokens. Los archivos que se cargan en ellas se procesan en el navegador. Los badges enlazan a las credenciales publicas de Credly.

## Pruebas

Con Node.js instalado:

```sh
npm test
```

No es necesario ejecutar npm install.

## Subir a GitHub

Cuenta prevista: `Jgalindom03`. Autor de los commits: `Jgalindom03 <jgalindom2003@gmail.com>`.

Crea un repositorio vacio llamado `portfolio`, sin README inicial, y ejecuta:

```sh
git remote add origin https://github.com/Jgalindom03/portfolio.git
git push -u origin main
```

## GitHub Pages (opcional)

Si el repositorio es publico: Settings > Pages > Deploy from a branch > main > / (root). El sitio no necesita configuracion de build.

## Licencias

Las licencias de fuentes, marcas y bibliotecas se incluyen junto a sus archivos. Consulta `assets/ASSET-NOTICES.md` y `vendor/VERSIONS.json`.
