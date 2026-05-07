import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting';
export default tseslint.config({
    ignores: ['dist', 'node_modules'],
}, js.configs.recommended, ...tseslint.configs.recommended, ...pluginVue.configs['flat/recommended'], {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: globals.browser,
        parserOptions: {
            parser: tseslint.parser,
        },
    },
    rules: {
        'vue/multi-word-component-names': 'off',
    },
}, prettierSkipFormatting);
