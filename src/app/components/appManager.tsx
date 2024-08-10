'use client';
import XlsxTableParser from "@/app/components/ui/xlsxTableParser";
import TransferEditor from "@/app/components/ui/transferEditor";
import FileSelectorButton from "@/app/components/transfers/fileSelectorButton";

import { InputData } from '@/app/utils/types';
import { individualTemplate } from '@/app/utils/misc';
import { useCallback, useState, Suspense } from "react";

import { MdFormatLineSpacing } from "react-icons/md";

const AppManager: React.FC = () => {

	const [isCompact, setIsCompact] = useState<boolean>(false);
	const [fileData, setFileData] = useState<InputData[]>([]);
	const [individualTransfers, setIndividualTransfers] = useState<InputData[]>([individualTemplate]);
	const [currentTab, setCurrentTab] = useState<"INDIVIDUAL" | "MASTERFILE">("INDIVIDUAL");

	const handleCompactClick = () => setIsCompact(!isCompact);
	const handleDataUpdate = (newDataOrUpdater: React.SetStateAction<InputData[]>) =>
		currentTab === "INDIVIDUAL" ? setIndividualTransfers(newDataOrUpdater) : setFileData(newDataOrUpdater);

	const handleFileSelect = useCallback((data: InputData[]) => {
		setCurrentTab("MASTERFILE");
		// Apparently this is necessary to ensure the state updates, thanks random stack overflow person
		setTimeout(() => {
			setFileData(data);
		}, 0);
	}, []);

	const currentData = currentTab === "INDIVIDUAL" ? individualTransfers : fileData;

	const fileHint = (currentTab === "MASTERFILE") && (fileData.length <= 0);

	return (
		<Suspense>
			<div className="manager-container flex lg:flex-row flex-col max-w-[90vw] md:w-full gap-4">
				<div className="left flex flex-col w-full gap-4">
					<div className="tab-container flex flex-row w-full dark:bg-slate-800 bg-slate-400 rounded-2xl p-4 justify-evenly font-bold font-sans">
						<button
							className={`individual-transfer-tab px-8 ${currentTab === "INDIVIDUAL" ? 'text-slate-200' : 'text-slate-500'}`}
							onClick={() => setCurrentTab("INDIVIDUAL")}>
							INDIVIDUAL
						</button>
						<button
							className={`masterfile-tab px-8 ${currentTab === "MASTERFILE" ? 'text-slate-200' : 'text-slate-500'}`}
							onClick={() => setCurrentTab("MASTERFILE")}>
							MASTERFILE
						</button>
					</div>
					<TransferEditor data={currentData} tabType={currentTab} onDataUpdate={handleDataUpdate} />
				</div>
				<div className={`right flex flex-col gap-4 w-auto min-w-[7.5rem]`}>
					<div className="top-container flex flex-row justify-between items-center dark:bg-slate-800 bg-slate-400 p-4 rounded-2xl">
						<div className={`input-container dark:text-white text-slate-600 ${fileHint ? 'animate-pulse' : ''}`}>
							<FileSelectorButton onFileSelect={handleFileSelect} />
						</div>
						<div className="controls-container p-0 m-0 leading-none">
							{fileData && Array.isArray(fileData) ? fileData.length > 0 && (
								<div className="table-controls flex gap-4">
									<button onClick={handleCompactClick}><MdFormatLineSpacing className="text-white" /></button>
								</div>
							) : null}
						</div>
					</div>
					<XlsxTableParser data={fileData} isCompact={isCompact} key={isCompact.toString()} />
				</div>
			</div>
		</Suspense>
	);
};

export default AppManager;