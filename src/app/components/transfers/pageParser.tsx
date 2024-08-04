import React, { useCallback, useRef } from 'react';
import { useDebounce } from '@/app/utils/hooks';
import { ParsedPageData } from '@/app/utils/types';

interface ParserProps {
	onParseComplete: (parsedData: ParsedPageData) => void;
}

const Parser: React.FC<ParserProps> = ({ onParseComplete }) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const parseText = useCallback((text: string): ParsedPageData => {
		const patterns = {
			playerName: /Player([\s\S]*?)(Club|Prio)/,
			clubName: /Club([\s\S]*?)League/,
			positions: /(LEFT|RIGHT) \((OUTSIDE|INSIDE)\)([\s\S]*?)(?=(LEFT|RIGHT) \((OUTSIDE|INSIDE)\)|$)/g,
		};

		const playerName = (text.match(patterns.playerName) || [])[1]?.trim() || '';
		const clubName = (text.match(patterns.clubName) || [])[1]?.trim() || '';

		const positions: ParsedPageData['positions'] = {};
		let match;
		while ((match = patterns.positions.exec(text)) !== null) {
			const [side, inOut, content] = match;
			const key = `${side} ${inOut}`;
			const idMatch = content.match(/Position [0-9]:\s*ID\s*([\s\S]*?)(?=Position \d+:|$)/);

			positions[key] = {
				id: idMatch ? idMatch[1].trim() : ''
			};
		}

		return { playerName, clubName, positions };
	}, []);

	const handleInputChange = useDebounce((input: string) => {
		const parsed = parseText(input);
		onParseComplete(parsed);
		if (inputRef.current) inputRef.current.value = '';
	}, 200);

	return (
		<div className="selection-parser-container flex flex-col gap-4 text-black">
			<input className="flex p-2 border rounded w-14" ref={inputRef} onChange={(e) => handleInputChange(e.target.value)} placeholder="Fill" title='Paste the entire Shoe order page and automatically populate current transfer.' />
		</div>
	);
};

export default Parser;