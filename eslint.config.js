// eslint.config.js — reglas de calidad de código para .vue y .ts.
// Formato "flat config" (el que usa ESLint 9+).
import vue from 'eslint-plugin-vue';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import vueParser from 'vue-eslint-parser';

export default [
  // Ignora carpetas generadas, nunca hay que lintear esto.
  { ignores: ['dist/**', 'node_modules/**', 'public/**'] },

  // Reglas base recomendadas para archivos .vue (Vue 3 es el default en v10+).
  ...vue.configs['flat/recommended'],

  // Reglas de TypeScript, aplicadas tanto a .ts como al <script> de los .vue.
  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // En un proyecto chico, "any" ocasional no amerita romper el build.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Vue permite hasta una etiqueta raíz múltiple; no forzar una sola.
      'vue/multi-word-component-names': 'off',
      // Reglas puramente de formato (un atributo por línea, saltos de
      // línea obligatorios) que chocan con el estilo compacto usado en
      // todo el proyecto. Se priorizan reglas que detectan bugs reales.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/attributes-order': 'off',
    },
  },
];
