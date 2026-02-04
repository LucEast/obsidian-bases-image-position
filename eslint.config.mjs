import obsidianmd from "eslint-plugin-obsidianmd";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{ ignores: ["main.js", "esbuild.config.mjs", "version-bump.mjs"] },
	...obsidianmd.configs.recommended,
	{
		files: ["**/*.ts"],
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
			},
		},
		rules: {
			// backgroundPosition must be set per-card dynamically — CSS classes are not feasible
			"obsidianmd/no-static-styles-assignment": "off",
			// TypeScript handles undefined-variable checking; no-undef is redundant for .ts
			"no-undef": "off",
		},
	},
]);