# Latin & Greek Study

Open `index.html` to study locally. The site uses plain HTML, CSS, and JavaScript and has no build step.

## GitHub Pages

Push the files to your repository. Under **Settings → Pages**, choose **Deploy from a branch**, select your branch and **/ (root)**, then save.

## Add study material

Edit `data.js`. The reference tables and flashcards use the same data.

- Add a Latin noun to `latinNouns` with its declension number, meaning, stem, gender or pattern label, and six pairs of singular and plural forms. Follow the case order in `latinCases`. The tables display only the endings after the supplied stem. The flashcards use the full forms.
- Add a Greek word to `greekWords` with its spelling and an array of accepted transliterations. The first answer is the one displayed after submission. Add an optional `note` to explain a breathing mark or spelling.
- Greek answers are checked without case or accent differences. The quiz splits the original spelling into letters with their marks attached.
