import React, { useCallback, useRef } from 'react';
import { useDebounce } from '@/app/utils/hooks';
import { ParsedPageData } from '@/app/utils/types';

interface ParserProps {
	onParseComplete: (parsedData: ParsedPageData) => void;
}

const Parser: React.FC<ParserProps> = ({ onParseComplete }) => {
	const inputRef = useRef<HTMLInputElement>(null);

	console.log('Parser component rendering');

	const parseText = useCallback((text: string): ParsedPageData => {
		console.log('Parsing text:', text);

		const patterns = {
			playerName: /Player\s*([\s\S]*?)\s*(?=Club|Prio|$)/,
			clubName: /Club\s*([\s\S]*?)\s*(?=League|Delivery|$)/,
			positions: /(LEFT|RIGHT)\s*(?:\((OUTSIDE|INSIDE)\))?\s*([\s\S]*?)(?=(?:LEFT|RIGHT)|$)/g,
		};

		const playerName = (text.match(patterns.playerName) || [])[1]?.trim() || '';
		const clubName = (text.match(patterns.clubName) || [])[1]?.trim() || '';

		const positions: ParsedPageData['positions'] = {};
		let match;
		while ((match = patterns.positions.exec(text)) !== null) {
			const [_, side, inOut, content] = match;
			const key = `${side} ${inOut || ''}`.toUpperCase().trim();

			const idMatches = content.match(/Position \d+:\s*ID\s*([\s\S]*?)(?=Position \d+:|$)/g);
			if (idMatches) {
				idMatches.forEach((idMatch, index) => {
					const id = idMatch.replace(/Position \d+:\s*ID\s*/, '').trim();
					if (id) {
						positions[`${key} ${index + 1}`] = { id };
					}
				});
			}
		}

		return { playerName, clubName, positions };
	}, []);

	const handleInputChange = useDebounce((input: string) => {
		if (input.trim()) {  // Only process non-empty input
			console.log('Debounced input received:', input);
			const parsed = parseText(input);
			console.log('Parsed result:', parsed);
			onParseComplete(parsed);
			
			if (inputRef.current) inputRef.current.value = '';
		}
	  }, 200);

	return (
		<div className="selection-parser-container flex flex-col gap-4 text-black">
			<input
				className="flex p-2 border rounded w-[3.75rem] text-center"
				ref={inputRef}
				onChange={(e) => {
					const cleanup = handleInputChange(e.target.value);
					return cleanup;
				  }}
				placeholder="Fill"
				title='Paste the entire Shoe order page and automatically populate current transfer.'
			/>
		</div>
	);
};

export default React.memo(Parser, (prevProps, nextProps) => {
	return prevProps.onParseComplete === nextProps.onParseComplete;
});
