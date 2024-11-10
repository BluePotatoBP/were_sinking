'use client';
import { useEffect, useState, Suspense } from "react";
import ReactMarkdown from "react-markdown";
import Loading from "./loading";

const Changelog: React.FC = () => {
	const [markdown, setMarkdown] = useState('');

	useEffect(() => {
		fetch('/CHANGELOG.md')
			.then((response => response.text()))
			.then((text) => {
				setMarkdown(text);
			})
			.catch((error) => {
				console.error('Error fetching markdown file: ', error);
			});
	}, []);

	return (
		<div className="flex flex-col p-8 items-center dark:bg-white/5">
			<div className="flex flex-col justify-center max-w-4xl">
				<Suspense fallback={<Loading />}>
					<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css" />
					<div className="markdown-body">
						<ReactMarkdown>{markdown}</ReactMarkdown>
					</div>
				</Suspense>
			</div>
		</div>
	);
};

export default Changelog;