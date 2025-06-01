import React, { useState, useCallback, useEffect, Suspense, memo, useRef } from 'react';
import { useDebounce, useFontLoader } from '@/app/utils/hooks';
import { InputData, ParsedPageData } from '@/app/utils/types';
import { individualTemplate } from '@/app/utils/misc';
import { useSettings } from '@/app/utils/settingsProvider';

import { FaTrashCan } from "react-icons/fa6";
import { FaPlusSquare } from 'react-icons/fa';
import { FaCog } from "react-icons/fa";

const Parser = React.lazy(() => import('@/app/components/transfers/pageParser'));
const DownloadButton = React.lazy(() => import('@/app/components/transfers/downloadButton'));
const TransferGenerator = React.lazy(() => import('@/app/components/transfers/transferGenerator'));
const PageNavigation = React.lazy(() => import('@/app/components/ui/pageNavigation'));

const MemoizedFaCog = memo(() => <FaCog className='text-lg dark:text-white text-slate-600 w-[3.75rem] ' />);
const MemoizedFaTrashCan = memo(() => <FaTrashCan className='leading-none text-xl' />);
const MemoizedFaPlusSquare = memo(() => <FaPlusSquare className='leading-none text-xl' />);

interface TransferEditorProps {
	data: InputData[];
	tabType: "INDIVIDUAL" | "MASTERFILE";
	onDataUpdate: React.Dispatch<React.SetStateAction<InputData[]>>;
}

const TransferEditor: React.FC<TransferEditorProps> = ({ data, tabType, onDataUpdate }) => {
	const { settings, toggleMenu } = useSettings();
	const [font, setFont] = useState<'PUMA' | 'NIKE'>('NIKE');
	const [currentPage, setCurrentPage] = useState(0);
	const { fontRefs, error } = useFontLoader();

	const fontSize = font === 'NIKE' ? settings.transfer.fontSize.nike : settings.transfer.fontSize.puma;
	const colors = settings.transfer.colors;

	useEffect(() => {
		setCurrentPage(0);
	}, [tabType]);

	const handleSettingsToggle = useCallback(() => toggleMenu("TRANSFER"), [toggleMenu]);

	const handleInputChange = useCallback((key: string, value: string | number) => {
		// Immediate update for UI responsiveness
		const tempUpdate = (prevData: InputData[]) => {
		  const newData = [...prevData];
		  newData[currentPage] = { ...newData[currentPage], [key]: value };
		  return newData;
		};
		onDataUpdate(tempUpdate);
	  
		// Debounce the final state update to reduce unnecessary re-renders
		debouncedUpdateData.current(key, value);
	  }, [currentPage, onDataUpdate]);
	  
	const debouncedUpdateData = useRef(
		useDebounce((key: string, value: string | number) => {
			onDataUpdate(prevData => {
			const newData = [...prevData];
			newData[currentPage] = { ...newData[currentPage], [key]: value };
			return newData;
			});
		}, 200)
	);

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

	const handleParseCompletion = useCallback((parsedData: ParsedPageData) => {
		console.log('Parse completion handler called with:', parsedData);
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

	const MemoizedDownloadButton = memo(DownloadButton, (prevProps, nextProps) => {
		return (
			prevProps.editableData === nextProps.editableData &&
			prevProps.font === nextProps.font &&
			prevProps.fontSize === nextProps.fontSize &&
			prevProps.colors === nextProps.colors
		);
	});

	const MemoizedTransferGenerator = memo(TransferGenerator, (prevProps, nextProps) => {
		return (
			prevProps.itemData === nextProps.itemData &&
			prevProps.font === nextProps.font &&
			prevProps.dynamicFontRef === nextProps.dynamicFontRef &&
			prevProps.fontSize === nextProps.fontSize &&
			prevProps.colors === nextProps.colors &&
			prevProps.forDownload === nextProps.forDownload
		);
	});

	if (currentItem) {
		return (
			<div className="p-4 flex flex-col rounded-2xl text-black dark:bg-slate-800 bg-slate-400 gap-4 min-w-[40vw] w-full h-full justify-between lg:overflow-y-auto text-xs 2xl:text-base">
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
							<input type="button" value='NIKE' onClick={() => setFont('NIKE')} className={`p-2 w-[3.75rem] rounded-sm cursor-pointer ${font == 'NIKE' ? 'text-slate-600 bg-white' : 'dark:text-slate-800 text-slate-300 bg-gray-500'}`} />
							<input type="button" value='PUMA' onClick={() => setFont('PUMA')} className={`p-2 w-[3.75rem] rounded-sm cursor-pointer ${font == 'PUMA' ? 'text-slate-600 bg-white' : 'dark:text-slate-800 text-slate-300 bg-gray-500'}`} />
						</div>
						<div className="multi-action-buttons flex flex-row md:flex-col gap-4 items-center">
							<Parser onParseComplete={handleParseCompletion} />
							<button onClick={handleSettingsToggle} className="settings-button dark:bg-slate-600 bg-slate-400 rounded-lg py-4 leading-none hover:bg-slate-500 transition-colors">
								<MemoizedFaCog />
							</button>
						</div>
					</div>
				</div>

				{/* Transfer preview */}
				<div className="bg-white flex flex-wrap justify-center items-center gap-[2mm] p-4 rounded-lg lg:h-[25vh] lg:w-[50vw] overflow-auto">
					<Suspense fallback={<div className='text-4xl text-slate-500 font-bold tracking-wide'>LOADING</div>}>
						{fontRefs &&
							<MemoizedTransferGenerator itemData={currentItem} font={font} dynamicFontRef={fontRefs} fontSize={fontSize} colors={colors} forDownload={false} />
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
									<MemoizedFaTrashCan />
								</button>
								<button className="p-4 dark:bg-slate-600 bg-slate-300 dark:text-white text-slate-600 rounded-lg flex flex-row justify-center gap-2 items-center hover:bg-slate-500 transition-colors" title='Add new Transfer' onClick={handleAddNewTransfer}>
									<MemoizedFaPlusSquare />
								</button>
							</div>
						}
						<MemoizedDownloadButton editableData={data} font={font} fontSize={fontSize} colors={colors} />
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