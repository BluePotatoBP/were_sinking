/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export',
	experimental: {
		taint: true
	}
};

export default nextConfig;
