/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Note: TF_CPP_MIN_LOG_LEVEL is for TensorFlow C++ backend; for TF.js (browser), suppress via code
  },
  // Optional: Other configs, e.g., for images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Optional: Logging tweaks for Next.js itself (hides fetch details)
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
