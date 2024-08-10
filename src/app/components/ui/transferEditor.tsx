import React, { useState, useCallback, useEffect, Suspense, memo } from 'react';
import { useDebounce, useFontLoader } from '@/app/utils/hooks';
import { InputData, EditableColors, ParsedPageData } from '@/app/utils/types';
import { individualTemplate } from '@/app/utils/misc';

import { FaTrashCan } from "react-icons/fa6";
import { FaPlusSquare } from 'react-icons/fa';
import { HiOutlineCog } from "react-icons/hi";
import { MdOutlineExitToApp } from "react-icons/md";

const Parser = React.lazy(() => import('@/app/components/transfers/pageParser'));
const DownloadButton = React.lazy(() => import('@/app/components/transfers/downloadButton'));
const TransferGenerator = React.lazy(() => import('@/app/components/transfers/transferGenerator'));
const PageNavigation = React.lazy(() => import('@/app/components/ui/pageNavigation'));

interface TransferEditorProps {
	data: InputData[];
	tabType: "INDIVIDUAL" | "MASTERFILE";
	onDataUpdate: React.Dispatch<React.SetStateAction<InputData[]>>;
}

const TransferEditor: React.FC<TransferEditorProps> = ({ data, tabType, onDataUpdate }) => {
	const [font, setFont] = useState<'PUMA' | 'NIKE'>('NIKE');
	const [fontSize, setFontSize] = useState<number>(26);
	const [currentPage, setCurrentPage] = useState(0);
	const [settingsMenuOpen, toggleSettingsMenu] = useState(false);
	const [colors, setColors] = useState<EditableColors>({
		counterColor: '#0000ff',
		glyphColor: '#ff0000',
		perforationColor: '#00ff00'
	});
	const { fontRefs, error } = useFontLoader();

	useEffect(() => {
		setCurrentPage(0);
	}, [tabType]);

	useEffect(() => {
		setFontSize(font === "NIKE" ? 26 : 32);
	}, [font]);

	const handleSettingsToggle = useCallback(() => toggleSettingsMenu(!settingsMenuOpen), [settingsMenuOpen]);

	const handleInputChange = useCallback((key: string, value: string | number) => {
		if (onDataUpdate) {
			onDataUpdate(prevData => {
				const newData = [...prevData];
				newData[currentPage] = { ...newData[currentPage], [key]: value };
				return newData;
			});
		}
	}, [currentPage, onDataUpdate]);

	const handleAddNewTransfer = useCallback(() => {
		onDataUpdate(prevData => [...prevData, individualTemplate]);
		setCurrentPage(data.length);
	}, [onDataUpdate, data.length]);

	const handleDeleteTransfer = useCallback(() => {
		if (data.length > 1) {
			onDataUpdate(prevData => {
				const newData = [...prevData];
				newData.splice(currentPage, 1);
				return newData;
			});
			setCurrentPage(prevPage => Math.max(0, prevPage - 1));
		}
	}, [onDataUpdate, currentPage, data.length]);

	const handleColorChange = useDebounce((colorType: string, value: string) => {
		setColors(prevColors => ({
			...prevColors,
			[colorType]: value
		}));
	}, 200);

	const handleParseCompletion = useCallback((parsedData: ParsedPageData) => {
		if (onDataUpdate) {
			onDataUpdate(prevData => {
				const newData = [...prevData];
				const updatedItem: InputData = {
					...individualTemplate,
					"Asset Name": "",
					"Team": "",
					"ID LEFT OUTSIDE": "",
					"ID LEFT INSIDE": "",
					"ID RIGHT OUTSIDE": "",
					"ID RIGHT INSIDE": "",
				};

				// Update fields based on parsed data
				updatedItem["Asset Name"] = parsedData.playerName || "";
				updatedItem["Team"] = parsedData.clubName || "";

				// Update IDs with parsed data
				Object.entries(parsedData.positions).forEach(([position, { id }]) => {
					const [side, inOut] = position.split(' ');
					const key = `ID ${side} ${inOut}`;
					if (updatedItem.hasOwnProperty(key)) {
						updatedItem[key] = id || "";
					}
				});

				newData[currentPage] = updatedItem;
				return newData;
			});
		}
	}, [currentPage, onDataUpdate]);

	const currentItem = data[currentPage];

	if (currentItem) {
		return (
			<div className="p-4 flex flex-col rounded-2xl text-black dark:bg-slate-800 bg-slate-400 gap-4 min-w-[40vw] w-full lg:max-h-[80vh] justify-evenly lg:overflow-y-auto text-xs 2xl:text-base">
				{/* Editor controls */}
				<div className="editor-container flex flex-col md:flex-row gap-4 justify-between 2xl:max-h-[30vh]">
					{/* ID editor */}
					<div className="id-editor flex flex-col gap-2 dark:bg-slate-700 bg-slate-300 p-2 rounded-lg w-full overflow-y-auto">
						{Object.keys(individualTemplate).map((field) => (
							<div key={field} className="flex flex-row justify-between items-center leading-none border-solid border-2 rounded-lg dark:border-slate-600 border-slate-200 p-2 hover:border-dashed">
								<label className="text-white font-bold">{field.toUpperCase()}</label>
								<input
									type="text"
									value={currentItem[field] || ""}
									onChange={(e) => handleInputChange(field, e.target.value)}
									className="p-2 dark:bg-slate-500 bg-slate-200 dark:text-slate-300 text-slate-400 rounded w-3/5"
								/>
							</div>
						))}
					</div>
					{/* Colors and font */}
					<div className="colors-editor flex flex-row md:flex-col gap-4 items-center justify-between dark:bg-slate-700 bg-slate-300 p-4 rounded-lg">
						<div className="font-buttons flex flex-row md:flex-col gap-4 items-center">
							<input type="button" value='NIKE' onClick={() => setFont('NIKE')} className={`p-2 w-[3.75rem] cursor-pointer ${font == 'NIKE' ? 'text-slate-600 bg-white' : 'dark:text-slate-800 text-slate-300 bg-gray-500'}`} />
							<input type="button" value='PUMA' onClick={() => setFont('PUMA')} className={`p-2 w-[3.75rem] cursor-pointer ${font == 'PUMA' ? 'text-slate-600 bg-white' : 'dark:text-slate-800 text-slate-300 bg-gray-500'}`} />
						</div>
						<div className="multi-action-buttons flex flex-row md:flex-col gap-4 items-center">
							<Parser onParseComplete={handleParseCompletion} />
							<button onClick={handleSettingsToggle} className="settings-button dark:bg-slate-600 bg-slate-400 rounded-lg py-4 leading-none hover:bg-slate-500 transition-colors">
								<HiOutlineCog className='text-2xl dark:text-white text-slate-600 w-[3.75rem] ' />
							</button>
						</div>
						{settingsMenuOpen && (
							<div className="settings-popup fixed top-0 left-0 w-full h-full dark:bg-slate-800/60 bg-slate-500/60 z-40">
								<div className="popup-container fixed flex top-1/4 md:left-1/4 left-[10%] dark:bg-slate-600 bg-slate-400 p-4 md:w-1/2 w-[80%] h-1/2 rounded-2xl gap-4 pointer-events-auto z-50">
									<div className="flex flex-col justify-evenly p-4 w-full rounded-lg dark:bg-slate-700 bg-slate-300 text-slate-400 text-base font-mono uppercase text-start">
										<div className="flex flex-col">
											<label htmlFor='font-size'>Font Size</label>
											<input type="number" id='font-size' className="p-2 w-full h-8 dark:bg-slate-600 bg-slate-400 text-slate-200 rounded-md" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} placeholder="Font size" min={10} />
										</div>
										<div className="flex flex-col">
											<label htmlFor='glyph-color'>Glyph Color</label>
											<input type="color" id='glyph-color' className='cursor-pointer w-full h-8' value={colors.glyphColor} onChange={(e) => handleColorChange("glyphColor", e.target.value)} />
										</div>
										<div className="flex flex-col">
											<label htmlFor='counter-color'>Counter Color</label>
											<input type="color" id='counter-color' className='cursor-pointer w-full h-8' value={colors.counterColor} onChange={(e) => handleColorChange("counterColor", e.target.value)} />
										</div>
										<div className="flex flex-col">
											<label htmlFor='rect-color'>Border Color</label>
											<input type="color" id='rect-color' className='cursor-pointer w-full h-8' value={colors.perforationColor} onChange={(e) => handleColorChange("perforationColor", e.target.value)} />
										</div>
									</div>
									<div className="close-btn cursor-pointer p-4 dark:bg-slate-700 bg-slate-300 rounded-lg flex items-center text-center" onClick={handleSettingsToggle}>
										<MdOutlineExitToApp className='dark:text-white text-slate-600 text-2xl relative right-0 top-0' />
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Transfer preview */}
				<div className="bg-white flex flex-wrap justify-center items-center gap-[2mm] p-4 rounded-lg lg:h-[22vh] lg:w-[50vw] overflow-auto">
					<Suspense fallback={<div className='text-4xl text-slate-500 font-bold tracking-wide'>LOADING</div>}>
						{fontRefs &&
							<TransferGenerator itemData={currentItem} font={font} dynamicFontRef={fontRefs} fontSize={fontSize} colors={colors} forDownload={false} />
						}

						{error &&
							<div className="error flex flex-col bg-red-500 rounded-lg p-8 justify-center items-left font-sans gap-2">
								<div className="error-info text-white font-bold text-xl border-l-4 border-red-300 border-solid px-4">
									Failed to load Font(s)
								</div>
								<div className="error-message text-red-700 font-regular bg-red-100 p-4 rounded-lg">
									{error.message}
								</div>
							</div>
						}
					</Suspense>
				</div>

				{/* Controls */}
				<div className="controls flex justify-between items-center gap-4">
					{/* Navigation */}
					<PageNavigation updatePage={page => setCurrentPage(page)} pageCount={data.length} currentPage={currentPage} />
					{ /* Download, Add New, Delete */}
					<div className="action-buttons flex flex-row gap-4">
						{
							<div className='action-buttons flex flex-row gap-4'>
								<button className="p-4 dark:bg-slate-600 bg-slate-300 dark:text-white text-slate-600 rounded-lg flex flex-row justify-center gap-2 items-center hover:bg-slate-500 transition-colors" title='Remove current Transfer' onClick={handleDeleteTransfer}>
									<FaTrashCan className='leading-none text-xl' />
								</button>
								<button className="p-4 dark:bg-slate-600 bg-slate-300 dark:text-white text-slate-600 rounded-lg flex flex-row justify-center gap-2 items-center hover:bg-slate-500 transition-colors" title='Add new Transfer' onClick={handleAddNewTransfer}>
									<FaPlusSquare className='leading-none text-xl' />
								</button>
							</div>
						}
						<DownloadButton editableData={data} font={font} fontSize={fontSize} colors={colors} />
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