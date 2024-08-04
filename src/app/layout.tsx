import type { Metadata } from "next";
import "./globals.css";

import Navbar from '@/app/components/ui/navbar';


export const metadata: Metadata = {
	title: "Were Sinking",
	description: "What are you sinking about?",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
	return (
		<html lang="en">
			<body>
				<Navbar />
				<main>{children}</main>
			</body>
		</html>
	);
}
