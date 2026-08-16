import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths"; // TypeScriptのtsconfig.jsonの設定をviteにも適用するプラグイン

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()], // tsconfig.app.json の絶対パスの設定がviteに自動で反映される
});
