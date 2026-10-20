import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Los worktrees de las sesiones en paralelo viven en .claude/worktrees: sus tests no son de esta rama.
    exclude: [...configDefaults.exclude, ".claude/**"],
  },
});
