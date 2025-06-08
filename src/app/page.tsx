import AppManager from "./components/appManager";

export default function Home() {
	return (
		<main className="flex min-h-fit flex-col items-center justify-between pt-32 lg:pt-12 px-16">
			<div className="flex flex-col items-center justify-between font-mono text-sm">
				<AppManager />
			</div>
		</main>
	);
}
