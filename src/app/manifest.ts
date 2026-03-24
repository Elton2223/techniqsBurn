import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Techniqs Burn — Self-Destructing Secrets",
    short_name: "Techniqs Burn",
    description:
      "Share passwords, API keys, and sensitive data through encrypted self-destructing links.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#f97316",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
