import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    include: ["**/*.{test,spec}.ts"],
    exclude: ["node_modules", "dist", ".lighthouseci"],
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
        miniflare: {
          bindings: {
            RESEND_API_KEY: "re_test_contact_vitest",
            TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
          },
        },
      },
    },
  },
});
