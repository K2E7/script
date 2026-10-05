# Script

Light and dark editor themes and an interactive colour palette for Script.
The palette contains dark and light neutrals plus six colour families with
core, bright, and character roles.

## Run locally

Open `index.html` directly in a modern browser. No build step or dependencies
are required.

For a local HTTP preview with Node.js installed, run `node preview.cjs` and open
`http://127.0.0.1:4173`. Stop with Ctrl+C. To use another port, run
`node preview.cjs 4174`. This serves static files only, with no external requests.

## Download editor themes

The page opens with Editor themes selected. Download for Zed provides
`script.json`, containing both Script Dark and Script Light.

Use the segmented control to switch between Editor themes and Colour palette.
The light/dark preview toggle controls the page appearance.

Expand How to install on the Zed card for folder locations, theme selection,
and copyable settings that enable bracket colours.

## Use the palette

- Choose a tile copy format, then click any swatch to copy it.
- Shift-click copies the token name and hex value.
- Alt-click copies only the token name.
- Copy the complete palette as CSS, SCSS, JSON, or CSV.
- Download the generated CSS custom properties as `script-theme.css`.

The desktop matrix places colour families in columns and roles in rows. On
mobile, it is transposed so each colour family has three compact role columns.

On viewports at least 1200px wide and 700px tall, the palette fits one screen:
the three colour rows sit between slim dark and light neutral stacks. Narrower
or shorter screens use normal scrolling. Expanding the installation guide may
also require scrolling on the editor themes view.

