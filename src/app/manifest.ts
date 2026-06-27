import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Contaí Pro",
    short_name: "Contaí",
    description: "Web app de controle financeiro mensal.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e0ad00",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
