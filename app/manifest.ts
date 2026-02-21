import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SmartUdhar",
    short_name: "SmartUdhar",
    description: "Digital Udhar Ledger for Indian Shopkeepers",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#0f172a",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
