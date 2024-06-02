import AppManager from "./components/appManager";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between py-24 px-8">
			<div className="flex flex-col w-full max-w-5xl items-center justify-between font-mono text-sm">
				<AppManager />
			</div>
		</main>
	);
}
