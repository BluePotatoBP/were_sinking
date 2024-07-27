import React, { useState, useCallback, useEffect, Suspense, memo } from 'react';
import DownloadButton from '@/app/components/downloadButton';
import { useDebounce } from '@/app/utils/hooks';
import { InputData, EditableColors } from '@/app/utils/types';
import { individualTemplate } from '@/app/utils/misc';

import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FaPlusSquare } from 'react-icons/fa';

const TransferGenerator = React.lazy(() => import('@/app/components/transferGenerator'));

interface TransferEditorProps {
	data: InputData[];
	tabType: "INDIVIDUAL" | "MASTERFILE";
	onDataUpdate?: React.Dispatch<React.SetStateAction<InputData[]>>;
}

const TransferEditor: React.FC<TransferEditorProps> = ({ data, tabType, onDataUpdate }) => {
	const [font, setFont] = useState<'PUMA' | 'NIKE'>('NIKE');
	const [fontSize, setFontSize] = useState<number>(26);
	const [currentPage, setCurrentPage] = useState(0);
	const [colors, setColors] = useState<EditableColors>({
		counterColor: '#0000ff',
		glyphColor: '#ff0000',
		perforationColor: '#00ff00'
	});

	useEffect(() => {
		setCurrentPage(0);
		setFontSize(font === "NIKE" ? 26 : 32);
	}, [tabType, font]);

	const handlePrevPage = useCallback(() => {
		setCurrentPage(prev => Math.max(0, prev - 1));
	}, []);

	const handleNextPage = useCallback(() => {
		setCurrentPage(prev => Math.min(data.length - 1, prev + 1));
	}, [data.length]);

	const handleInputChange = useCallback((key: string, value: string | number) => {
		if (onDataUpdate) {
			onDataUpdate(prevData => {
				const newData = [...prevData];
				newData[currentPage] = { ...newData[currentPage], [key]: value };
				return newData;
			});
		}
	}, [currentPage, onDataUpdate]);

	const handleAddNew = useCallback(() => {
		if (onDataUpdate) {
			onDataUpdate(prevData => {
				const newData = [...prevData];
				newData.push(individualTemplate);
				return newData;
			});
			setCurrentPage(prevPage => prevPage + 1);
		}
	}, [onDataUpdate]);

	const handleColorChange = useDebounce((colorType: string, value: string) => {
		setColors(prevColors => ({
			...prevColors,
			[colorType]: value
		}));
	}, 200);

	const currentItem = data[currentPage];

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
			<div className="p-4 flex flex-col rounded-2xl text-black dark:bg-slate-800 bg-slate-400 gap-4 min-w-[40vw] max-w-full lg:w-[30vw] lg:max-h-[80vh] justify-evenly lg:overflow-y-scroll text-xs 2xl:text-base">
				{/* Editor controls */}
				<div className="editor-container flex flex-col md:flex-row gap-4 justify-between 2xl:max-h-[30vh]">
					{/* ID editor */}
					<div className="id-editor flex flex-col gap-2 dark:bg-slate-700 bg-slate-300 p-2 rounded-lg w-full overflow-y-scroll">
						{Object.entries(currentItem).map(([key, value]) => (
							<div key={key} className="flex flex-row justify-between items-center leading-none border-solid border-2 rounded-lg dark:border-slate-600 border-slate-200 p-2 hover:border-dashed">
								<label className="text-white font-bold">{key.toUpperCase()}</label>
								<input type="text" value={value as string} onChange={(e) => handleInputChange(key, e.target.value)} className="p-2 dark:bg-slate-500 bg-slate-200 dark:text-slate-300 text-slate-400 rounded w-3/5" />
							</div>
						))}
					</div>
					{/* Colors and font */}
					<div className="colors-editor flex flex-row md:flex-col gap-4 items-center justify-between dark:bg-slate-700 bg-slate-300 p-4 rounded-lg">
						<input type="button" value='NIKE' onClick={() => setFont('NIKE')} className={`p-2 w-[3.75rem] cursor-pointer ${font == 'NIKE' ? 'text-slate-600 bg-white' : 'dark:text-slate-800 text-slate-300 bg-gray-500'}`} />
						<input type="button" value='PUMA' onClick={() => setFont('PUMA')} className={`p-2 w-[3.75rem] cursor-pointer ${font == 'PUMA' ? 'text-slate-600 bg-white' : 'dark:text-slate-800 text-slate-300 bg-gray-500'}`} />
						<input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} placeholder="Font size" className="p-2 w-[3.75rem]" min={10} />
						<input type="color" className='cursor-pointer w-[3.75rem]' value={colors.glyphColor} onChange={(e) => handleColorChange("glyphColor", e.target.value)} />
						<input type="color" className='cursor-pointer w-[3.75rem]' value={colors.counterColor} onChange={(e) => handleColorChange("counterColor", e.target.value)} />
						<input type="color" className='cursor-pointer w-[3.75rem]' value={colors.perforationColor} onChange={(e) => handleColorChange("perforationColor", e.target.value)} />
					</div>
				</div>

				{/* Transfer preview */}
				<div className="bg-white flex flex-wrap justify-center gap-[2mm] p-4 overflow-scroll rounded-lg min-h-[25vh] max-h-[25vh]">
					<Suspense fallback={<div className='text-2xl font-bold'>Loading...</div>}>
						<TransferGenerator itemData={currentItem} font={font} fontSize={fontSize} colors={colors} forDownload={false} />
					</Suspense>
				</div>

				{/* Controls */}
				<div className="controls flex justify-between items-center gap-4">
					{/* Page buttons */}
					<div className="control-buttons flex items-center gap-4 dark:text-white text-slate-600">
						<button onClick={handlePrevPage} disabled={currentPage === 0} className="p-2 dark:bg-slate-600 bg-slate-300 rounded-lg">
							<FaChevronLeft />
						</button>
						<span className="dark:text-white text-slate-600">{`${currentPage + 1} of ${data.length}`}</span>
						<button onClick={handleNextPage} disabled={currentPage === data.length - 1} className="p-2 dark:bg-slate-600 bg-slate-300 rounded-lg">
							<FaChevronRight />
						</button>
					</div>
					{ /* Download and new button */}
					<div className="action-buttons flex flex-row gap-4">
						{tabType === "INDIVIDUAL" && // FIXME: wont add new transfer if on masterfile page
							(
								<button className="p-4 dark:bg-slate-600 bg-slate-300 dark:text-white text-slate-600 rounded-lg flex flex-row justify-center gap-2 items-center hover:bg-slate-500" title='Add new Transfer' onClick={handleAddNew}>
									<FaPlusSquare className='leading-none text-xl' />
								</button>
							)}
						<DownloadButton editableData={data} currentPage={currentPage} font={font} fontSize={fontSize} colors={colors} />
					</div>
				</div>
			</div>
		);
	} else {
		return (
			<div className="flex p-4 min-w-[30vw] min-h-[20vh] rounded-2xl text-black dark:bg-slate-800 bg-slate-400 justify-center items-center">
				{
					tabType === "INDIVIDUAL"
						? <div className="info-text leading-none dark:text-white text-slate-600 font-sans font-light">Initializing...</div>
						: <div className="info-text leading-none dark:text-white text-slate-600 font-sans font-light">
							Import
							<span className='dark:bg-slate-600 bg-slate-200 px-1 mx-1 rounded-md font-normal'>.xlsx</span>
							or
							<span className='dark:bg-slate-600 bg-slate-200 px-1 mx-1 rounded-md font-normal'>.xls</span>
							file to proceed.
						</div>
				}

			</div>
		);
	}
};


export default memo(TransferEditor, (prevProps, nextProps) => {
	return prevProps.data === nextProps.data && prevProps.tabType === nextProps.tabType;
});