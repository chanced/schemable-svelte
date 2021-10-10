module.exports = {
	root: true,
	overrides: [
		{
			files: ["*.ts", "*.svelte"],
			parser: "@typescript-eslint/parser",
			plugins: ["svelte3", "@typescript-eslint"],
			settings: {
				"svelte3/typescript": () => require("typescript"),
			},
			extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
		},
		{ files: ["*.svelte"], processor: "svelte3/svelte3" },
		{
			files: ["*.cjs"],
			parser: "espree",
			plugins: [],
			parserOptions: { sourceType: "script" },
			extends: ["prettier", "eslint:recommended", "plugin:node/recommended"],
			rules: {
				"node/no-unpublished-require": 0,
			},
		},
	],

	settings: {
		"svelte3/typescript": () => require("typescript"),
	},
	parserOptions: {
		sourceType: "module",
		ecmaVersion: "latest",
	},
	env: {
		browser: true,
		node: true,
	},
};
