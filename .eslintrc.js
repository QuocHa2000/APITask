module.exports = {
    env: {
        node: true,
        commonjs: true,
        es2020: true,
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 12,
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        }
    },
    "parser": "babel-eslint",
    'plugins': ['prettier'],
    rules: {
        'prettier/prettier': 'error',
        indent: ['error', 4],
        'linebreak-style': ['error', 'windows'],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
    },
};