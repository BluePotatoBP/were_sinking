import React, { useState, useCallback, useEffect, useRef, Suspense, memo } from 'react';
import { InputData, EditableColors } from '@/app/utils/types';
import { useDebounce } from '@/app/utils/hooks';
import DownloadButton from '@/app/components/downloadButton';

import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FaPlusSquare } from 'react-icons/fa';

const TransferGenerator = React.lazy(() => import('@/app/components/transferGenerator'));


const TransferEditor: React.FC<{ data: InputData[]; }> = ({ data }) => {
	const [font, setFont] = useState<'PUMA' | 'NIKE'>('NIKE');
	const [fontSize, setFontSize] = useState<number>(26);
	const [colors, setColors] = useState<EditableColors>({
		counterColor: '#0000ff',
		glyphColor: '#ff0000',
		perforationColor: '#00ff00'
	});
	const [editableData, setEditableData] = useState<InputData[]>(data);
	const [currentPage, setCurrentPage] = useState(0);

	useEffect(() => {
		setEditableData(data);
	}, [data]);

	const handlePrevPage = useCallback(() => {
		setCurrentPage(prev => Math.max(0, prev - 1));
	}, []);

	const handleNextPage = useCallback(() => {
		setCurrentPage(prev => Math.min(data.length - 1, prev + 1));
	}, [data.length]);

	const handleInputChange = useCallback((key: string, value: string | number) => {
		setEditableData(prevData => {
			const newData = [...prevData];
			newData[currentPage] = { ...newData[currentPage], [key]: value };
			return newData;
		});
	}, [currentPage]);

	const handleColorChange = useDebounce((colorType: string, value: string) => {
		setColors(prevColors => ({
			...prevColors,
			[colorType]: value
		}));
	}, 200);

	const currentItem = editableData[currentPage];

	// Page navigation via arrow keys
	useEffect(() => {
		const handleKeypress = (e: KeyboardEvent) => {
			const isInput = document.activeElement instanceof HTMLInputElement;
			if (isInput) return;
			if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && currentItem) {
				if (e.key === 'ArrowLeft') handlePrevPage();
				if (e.key === 'ArrowRight') handleNextPage();
			}
		};

		window.addEventListener('keydown', handleKeypress);

		return () => window.removeEventListener('keydown', handleKeypress);
	}, [handlePrevPage, handleNextPage, currentItem]);

	if (currentItem) {
		return (
			<div className="p-4 flex flex-col rounded-2xl text-black bg-slate-800 gap-4 min-w-[40vw] max-w-[40vw]">
				{/* Editor controls */}
				<div className="editor-container flex flex-row gap-4 justify-between">
					{/* ID editor */}
					<div className="id-editor flex flex-col gap-2 bg-slate-700 p-2 rounded-lg w-full min-h-[38vh] max-h-[38vh] overflow-y-scroll">
						{Object.entries(currentItem).map(([key, value]) => (
							<div key={key} className="flex flex-row justify-between items-center leading-none border-solid border-2 rounded-lg border-slate-600 p-2 hover:border-dashed">
								<label className="text-white font-bold">{key.toUpperCase()}</label>
								<input type="text" value={value as string} onChange={(e) => handleInputChange(key, e.target.value)} className="p-2 bg-slate-500 text-slate-300 rounded w-64" />
							</div>
						))}
					</div>
					{/* Colors and font */}
					<div className="colors-editor flex flex-col gap-4 items-center justify-between bg-slate-700 p-4 rounded-lg">
						<input type="button" value='NIKE' onClick={() => setFont('NIKE')} className={`p-2 w-[3.75rem] cursor-pointer ${font == 'NIKE' ? 'text-slate-600 bg-white' : 'text-gray-800 bg-gray-500'}`} />
						<input type="button" value='PUMA' onClick={() => setFont('PUMA')} className={`p-2 w-[3.75rem] cursor-pointer ${font == 'PUMA' ? 'text-slate-600 bg-white' : 'text-gray-800 bg-gray-500'}`} />
						<input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} placeholder="Font size" className="p-2 w-[3.75rem]" />
						<input type="color" className='cursor-pointer w-[3.75rem]' value={colors.glyphColor} onChange={(e) => handleColorChange("glyphColor", e.target.value)} />
						<input type="color" className='cursor-pointer w-[3.75rem]' value={colors.counterColor} onChange={(e) => handleColorChange("counterColor", e.target.value)} />
						<input type="color" className='cursor-pointer w-[3.75rem]' value={colors.perforationColor} onChange={(e) => handleColorChange("perforationColor", e.target.value)} />
					</div>
				</div>

				{/* Transfer preview */}
				<div className="bg-white flex flex-wrap justify-center gap-[2mm] p-4 overflow-scroll rounded-lg min-h-[25vh] max-h-[25vh]">
					<Suspense fallback={<div className='text-2xl font-bold'>Loading...</div>}>
						<TransferGenerator itemData={currentItem} font={font} fontSize={fontSize} colors={colors} globalColors={colors} forDownload={false} />
					</Suspense>
				</div>

				{/* Controls */}
				<div className="controls flex justify-between items-center gap-4">
					{/* Page buttons */}
					<div className="control-buttons flex items-center gap-4">
						<button onClick={handlePrevPage} disabled={currentPage === 0} className="p-2 bg-slate-600 text-white rounded-lg">
							<FaChevronLeft />
						</button>
						<span className="text-white">{`${currentPage + 1} of ${data.length}`}</span>
						<button onClick={handleNextPage} disabled={currentPage === data.length - 1} className="p-2 bg-slate-600 text-white rounded-lg">
							<FaChevronRight />
						</button>
					</div>
					{ /* Download and new button */}
					<div className="action-buttons flex flex-row gap-4">
						<button className="p-4 bg-slate-600 text-white rounded-lg flex flex-row justify-center gap-2 items-center hover:bg-slate-500 cursor-not-allowed" title='Add new Transfer'>
							<FaPlusSquare className='leading-none text-xl text-white' />
						</button>
						<DownloadButton editableData={editableData} currentPage={currentPage} font={font} fontSize={fontSize} debouncedColors={colors} />
					</div>
				</div>
			</div>
		);
	} else {
		return (
			<div className="flex p-4 min-w-[30vw] min-h-[20vh] rounded-2xl text-black bg-slate-800 justify-center items-center">
				<div className="info-text leading-none text-white">WAITING FOR INPUT</div>
			</div>
		);
	}
};


export default memo(TransferEditor, (prevProps, nextProps) => {
	return prevProps.data === nextProps.data;
});