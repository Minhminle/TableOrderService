const nextConfig = {
  reactStrictMode: true,
  distDir: ".next", // Thay đổi thư mục xuất ra thành .out
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
