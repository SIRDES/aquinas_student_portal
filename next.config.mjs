import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // typescript: {
    //     ignoreBuildErrors: true,
    // },
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack: (config) => {
        config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');
        return config;
    },
    images: {
        domains: ['res.cloudinary.com'],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
    },
};

export default nextConfig;
