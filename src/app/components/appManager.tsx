'use client';
import XlsxTableParser from "@/app/components/xlsxTableParser";
import TransferEditor from "@/app/components/transferEditor";
import { InputData } from '@/app/utils/types';
import { individualTemplate } from '@/app/utils/misc';
import { ChangeEvent, useState } from "react";
import { WorkBook, WorkSheet, read, utils } from "xlsx";

import { MdFormatLineSpacing } from "react-icons/md";
import { TbLayoutSidebarLeftExpandFilled, TbLayoutSidebarRightExpandFilled } from "react-icons/tb";

const AppManager: React.FC = () => {

	const [isCompact, setIsCompact] = useState<boolean>(false);
	const [isExpanded, setIsExpanded] = useState<boolean>(true);
	const [fileData, setFileData] = useState<InputData[]>([]);
	const [individualTransfers, setIndividualTransfers] = useState<InputData[]>([individualTemplate]);
	const [currentTab, setCurrentTab] = useState<"INDIVIDUAL" | "MASTERFILE">("INDIVIDUAL");

	const handleCompactClick = () => setIsCompact(!isCompact);
	const handleExpand = () => setIsExpanded(!isExpanded);

	const handleFileUpload = (input: ChangeEvent<HTMLInputElement>) => {
		const reader = new FileReader();
		if (input.target.files && input.target.files.length > 0) {
			reader.readAsArrayBuffer(input.target.files[0] as Blob);
			reader.onload = (loaded) => {
				const data = loaded.target?.result;
				const workbook: WorkBook = read(data, { type: 'binary' });
				const sheetName = workbook.SheetNames[0];
				const sheet: WorkSheet = workbook.Sheets[sheetName];
				const parsedData: InputData[] = utils.sheet_to_json(sheet);

				// Filter data to get rid of emoji and symbols
				const regexStr = /[\p{L}\d!@#$%^&*()?.,<>\/\\'":;+_\-\+~`\|{}\[\]=]+/gmiu;

				const filteredData: InputData[] = parsedData.map((item) => {
					const filteredItem: InputData = {};
					Object.keys(individualTemplate).forEach((field) => {
						const value = item[field];
						if (value !== undefined) {
							const matchedValue = value.toString().match(regexStr)?.join(' ');
							if (matchedValue) {
								filteredItem[field] = isNaN(Number(matchedValue)) ? matchedValue : Number(matchedValue);
							}
						} else {
							filteredItem[field] = ""; // Set empty string for missing fields
						}
					});
					return filteredItem;
				});
				setFileData(filteredData);
				setCurrentTab("MASTERFILE");
			};
		}
	};

	const handleDataUpdate = (newDataOrUpdater: React.SetStateAction<InputData[]>) => {
		if (currentTab === "INDIVIDUAL") {
			setIndividualTransfers(newDataOrUpdater);
		} else {
			setFileData(newDataOrUpdater);
		}
	};

	const currentData = currentTab === "INDIVIDUAL" ? individualTransfers : fileData;

	return (
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
			<div className={`right flex flex-col gap-4 w-full ${isExpanded ? 'lg:max-w-[50vw]' : 'lg:max-w-[32vw] 2xl:max-w-[22vw]'}`}>
				<div className="top-container flex flex-row justify-between items-center dark:bg-slate-800 bg-slate-400 p-4 rounded-2xl">
					<div className="input-container dark:text-white text-slate-600">
						<input type="file" accept='.xlsx, .xls' onChange={handleFileUpload} className="leading-none" />
					</div>
					<div className="controls-container p-0 m-0 leading-none">
						{fileData && Array.isArray(fileData) ? fileData.length > 0 && (
							<div className="table-controls flex gap-4">
								<button onClick={handleCompactClick}><MdFormatLineSpacing className="text-white" /></button>
								<button onClick={handleExpand} className="text-white lg:flex hidden">{isExpanded ? <TbLayoutSidebarLeftExpandFilled /> : <TbLayoutSidebarRightExpandFilled />}</button>
							</div>
						) : null}
					</div>
				</div>
				<XlsxTableParser data={fileData} isCompact={isCompact} isExpanded={isExpanded} key={isCompact.toString()} />
			</div>
		</div>
	);
};

export default AppManager;