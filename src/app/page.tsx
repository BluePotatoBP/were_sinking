import AppManager from "./components/appManager";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between py-16 px-16">
			<div className="flex flex-col items-center justify-between font-mono text-sm">
				<AppManager />
			</div>
		</main>
	);
}
