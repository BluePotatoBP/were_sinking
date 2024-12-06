import MillionLint from '@million/lint';
/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export',
	experimental: {
		taint: true
	}
};

export default MillionLint.next({
    enabled: true,
    rsc: true
})(nextConfig);
