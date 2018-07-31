module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true,
        "mocha": true,
    },
    "extends": [
        "es2015",
        "eslint:recommended",
        'plugin:vue/essential'
    ],
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "space-before-function-paren": ["error", "always"],
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-unused-vars": [
            "error",
            { "argsIgnorePattern": "next|_.*" }
        ]
    }
};