import type { Metadata } from "next";
import "./globals.css";

import Navbar from '@/app/components/ui/navbar';
import { SettingsProvider } from "@/app/utils/settingsProvider";

export const metadata: Metadata = {
	title: "NANO",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
	return (
		<html lang="en" className="min-h-screen">
			<body>
				<SettingsProvider>
					<Navbar />
					<main>{children}</main>
				</SettingsProvider>
			</body>
		</html>
	);
}
