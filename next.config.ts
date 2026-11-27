import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // www → apex (SEO: uma só versão canónica)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.uselucromei.com.br" }],
        destination: "https://uselucromei.com.br/:path*",
        permanent: true,
      },
      // Google achou "/mês" (texto do preço) como link → 404. Manda para a home.
      { source: "/m%C3%AAs", destination: "/", statusCode: 301 },
      { source: "/mês", destination: "/", statusCode: 301 },
    ];
  },
};

export default nextConfig;
