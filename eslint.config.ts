import eslintConfigPrettier from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  {
    plugins: { prettier },
    rules: { "prettier/prettier": "error" }
  },
  eslintConfigPrettier,
  globalIgnores(["out/**", "build/**", "src/generated/**", "node_modules/**", "dist/**", "**/**/dist/**"])
]);

export default eslintConfig;
