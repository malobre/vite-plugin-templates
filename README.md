# `@malobre/vite-plugin-templates`

Replace `template` tags with the content of the file specified in their `src` attribute, if any.

## Usage

1. Install `npm install --save-dev https://github.com/malobre/vite-plugin-templates.git`
1. Add plugin to your vite config
    ```js
    import { defineConfig } from 'vite'
    import templates from '@malobre/vite-plugin-templates'

    export default defineConfig({
      plugins: [templates()],
    })
   ```
