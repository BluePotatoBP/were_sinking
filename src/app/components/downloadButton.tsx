import React, { useCallback, useState, useEffect } from 'react';
import { IoMdDownload } from "react-icons/io";
import { InputData, EditableColors } from '@/app/utils/types';
import { createRoot } from 'react-dom/client';
import TransferGenerator from '@/app/components/transferGenerator';

interface DownloadButtonProps {
	editableData: InputData[];
	currentPage: number;
	font: 'NIKE' | 'PUMA';
	fontSize: number;
	colors: EditableColors;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ editableData, currentPage, font, fontSize, colors }) => {
	const [isShiftPressed, setIsShiftPressed] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => setIsShiftPressed(e.shiftKey);
		const handleKeyUp = (e: KeyboardEvent) => setIsShiftPressed(e.shiftKey);

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);

	const generateSVG = useCallback((item: InputData): Promise<string> => {
		return new Promise((resolve) => {
			const tempDiv = document.createElement('div');
			document.body.appendChild(tempDiv);

			const root = createRoot(tempDiv);

			root.render(<TransferGenerator itemData={item} font={font} fontSize={fontSize} colors={colors} forDownload={true} />);

			// Use a MutationObserver to wait for the SVG to be rendered
			const observer = new MutationObserver(() => {
				const svgElement = tempDiv.querySelector('svg');
				if (svgElement) {
					observer.disconnect();
					resolve(svgElement.outerHTML);
					root.unmount();
					document.body.removeChild(tempDiv);
				}
			});

			observer.observe(tempDiv, { childList: true, subtree: true });
		});
	}, [font, fontSize, colors]);

	const arrangeInGrid = useCallback((svgs: string[]): string => {
		const gridSize = Math.ceil(Math.sqrt(svgs.length));
		const spacing = 20; // Spacing between SVGs in pixels

		let maxWidth = 0;
		let maxHeight = 0;

		// Find the maximum dimensions
		svgs.forEach(svg => {
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = svg;
			const svgElement = tempDiv.querySelector('svg');
			if (svgElement) {
				maxWidth = Math.max(maxWidth, parseFloat(svgElement.getAttribute('width') || '0'));
				maxHeight = Math.max(maxHeight, parseFloat(svgElement.getAttribute('height') || '0'));
			}
		});

		const totalWidth = (maxWidth + spacing) * gridSize;
		const totalHeight = (maxHeight + spacing) * gridSize;

		let result = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}">`;

		svgs.forEach((svg, index) => {
			const row = Math.floor(index / gridSize);
			const col = index % gridSize;
			const x = col * (maxWidth + spacing);
			const y = row * (maxHeight + spacing);
			result += `<g transform="translate(${x},${y})">${svg}</g>`;
		});

		result += '</svg>';
		return result;
	}, []);

	const handleDownload = useCallback(async () => {
		let svgToDownload: string;

		if (isShiftPressed) {
			// Download only the current transfer
			svgToDownload = await generateSVG(editableData[currentPage]);
		} else {
			// Download all transfers
			const allSVGs = await Promise.all(editableData.map(generateSVG));
			svgToDownload = arrangeInGrid(allSVGs);
		}
		const randomString = window.crypto.randomUUID().substring(0, 4);
		const blob = new Blob([svgToDownload], { type: 'image/svg+xml' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = isShiftPressed ? `transfer_${currentPage + 1}.svg` : `all_${font}_transfers_${randomString}.svg`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}, [isShiftPressed, editableData, currentPage, generateSVG, arrangeInGrid]);

	return (
		<button
			onClick={handleDownload}
			className="p-4 bg-slate-600 text-white rounded-lg flex flex-row justify-center gap-2 items-center hover:bg-slate-500"
			title={isShiftPressed ? 'Download current transfer as SVG' : 'Download all transfers as SVG (Hold shift for current)'}
		>
			<IoMdDownload className='text-xl' />
			{isShiftPressed ? 'Current' : 'All'}
		</button>
	);
};

export default DownloadButton;