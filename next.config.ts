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
    ];
  },
};

export default nextConfig;
