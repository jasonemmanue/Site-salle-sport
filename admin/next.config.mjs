/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Next 14 en mode `standalone` exige `sharp` pour optimiser les images, et
    // il n'est pas installe ici. Le back-office ne sert qu'un seul visuel, le
    // logo, livre deja en 256 px : l'optimisation n'apporterait rien.
    unoptimized: true,
  },
};

export default nextConfig;
