// @ts-check
import { defineConfig } from "astro/config";

// this import makes it so sharp is loaded by bun, otherwise astro errors out
import sharp from "sharp";

// https://astro.build/config
export default defineConfig({
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
});
