import type { Metadata } from "next";
import "./globals.css";

import Navbar from '@/app/components/ui/navbar';
import { SettingsProvider } from "@/app/utils/settingsProvider";

export const metadata: Metadata = {
	title: "Were Sinking",
	description: "What are you sinking about?",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
	return (
		<html lang="en">
			<body>
				<SettingsProvider>
					<Navbar />
					<main>{children}</main>
				</SettingsProvider>
			</body>
		</html>
	);
}
