// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
// import sharp from "sharp";

// https://astro.build/config
export default defineConfig({
  image: {
    service: passthroughImageService(),
    // service: {
    //   entrypoint: "astro/assets/services/sharp",
    //   // config: {
    //   //   limitInputPixels: false,
    //   // },
    // },
  },

  // adapter: cloudflare({
  //   imageService: "compile",
  //   platformProxy: {
  //     enabled: true,
  //   }
  // })
});
