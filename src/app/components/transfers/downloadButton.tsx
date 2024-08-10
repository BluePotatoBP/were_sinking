import React, { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';

import TransferGenerator from '@/app/components/transfers/transferGenerator';
import PackTransfers from '@/app/utils/transferPacker';

import { InputData, EditableColors, TransferRectangle } from '@/app/utils/types';
import { useFontLoader } from '@/app/utils/hooks';

import { IoMdDownload } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface DownloadButtonProps {
	editableData: InputData[];
	font: 'NIKE' | 'PUMA';
	fontSize: number;
	colors: EditableColors;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ editableData, font, fontSize, colors }) => {
	const [isDownloading, setIsDownloading] = useState(false);
	const { fontRefs } = useFontLoader();

	const generateSVG = useCallback((item: InputData, index: number): Promise<TransferRectangle> => {
		return new Promise((resolve) => {
			const tempDiv = document.createElement('div');
			document.body.appendChild(tempDiv);

			const root = createRoot(tempDiv);

			if (fontRefs) root.render(<TransferGenerator itemData={item} font={font} dynamicFontRef={fontRefs} fontSize={fontSize} colors={colors} forDownload={true} />);

			const observer = new MutationObserver(() => {
				const svgElement = tempDiv.querySelector('svg');
				if (svgElement) {
					observer.disconnect();
					const width = parseFloat(svgElement.getAttribute('width') || '0');
					const height = parseFloat(svgElement.getAttribute('height') || '0');
					resolve({ width, height, content: svgElement.outerHTML, id: `transfer-${index}` });
					root.unmount();
					document.body.removeChild(tempDiv);
				}
			});

			observer.observe(tempDiv, { childList: true, subtree: true });
		});
	}, [font, fontSize, colors, fontRefs]);

	const handleDownload = useCallback(async () => {
		setIsDownloading(true);
		try {
			const rectangles = await Promise.all(editableData.map(generateSVG));

			// This is a bit less than 670x470, presumably in points
			const sheetWidth = 2520;
			const sheetHeight = 1770;

			const packedSheets = PackTransfers(rectangles, sheetWidth, sheetHeight);

			packedSheets.forEach((sheet, index) => {
				const svgContent =
					`
          				<svg xmlns="http://www.w3.org/2000/svg" width="${sheetWidth}" height="${sheetHeight}">
            				${sheet.transfers.map(rect => `
              					<g transform="translate(${rect.x}, ${rect.y})">
                					${rect.content}
              					</g>
            				`).join('')}
          				</svg>
        			`;

				const randomString = window.crypto.randomUUID().substring(0, 4);
				const blob = new Blob([svgContent], { type: 'image/svg+xml' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = `packed_sheet_${index + 1}_${randomString}.svg`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			});
		} catch (error) {
			console.error(error);
		} finally {
			setIsDownloading(false);
		}
	}, [editableData, generateSVG]);

	return (
		<button
			onClick={handleDownload}
			disabled={isDownloading}
			className={`p-4 dark:bg-slate-600 bg-slate-300 dark:text-white text-slate-600 rounded-lg flex flex-row justify-center gap-2 items-center transition-colors hover:bg-slate-500 leading-none ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
			title='Download packed SVG sheets'
		>
			{isDownloading ? (<AiOutlineLoading3Quarters className="animate-spin text-xl" />) : (<IoMdDownload className='text-xl' />)}
		</button>
	);
};

export default DownloadButton;