If lint continues to flag generated .astro type files, they are ignored via .eslintrc.cjs overrides.
If your environment runs ESLint on .astro files, install:
- npm i -D astro-eslint-parser @typescript-eslint/parser

This project compiles without these for build, but some linters may require them.
