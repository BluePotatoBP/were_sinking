'use client';
import XlsxTableParser from "@/app/components/xlsxTableParser";
import TransferEditor from "@/app/components/transferEditor";
import { InputData } from '@/app/utils/types';

import { ChangeEvent, useState } from "react";
import { WorkBook, WorkSheet, read, utils } from "xlsx";
import { MdFormatLineSpacing } from "react-icons/md";
import { TbLayoutSidebarLeftExpandFilled, TbLayoutSidebarRightExpandFilled } from "react-icons/tb";

const AppManager: React.FC = () => {

	const [isCompact, setIsCompact] = useState<boolean>(false);
	const [isExpanded, setIsExpanded] = useState<boolean>(true);
	const [fileData, setFileData] = useState<InputData[]>([]);

	const handleCompactClick = () => setIsCompact(!isCompact);

	const handleExpand = () => setIsExpanded(!isExpanded);

	const handleFileUpload = (input: ChangeEvent<HTMLInputElement>) => {
		const reader = new FileReader();
		if (input.target.files) {
			reader.readAsArrayBuffer(input.target.files[0] as Blob);
			reader.onload = (loaded) => {
				const data = loaded.target?.result;
				const workbook: WorkBook = read(data, { type: 'binary' });
				const sheetName = workbook.SheetNames[0];
				const sheet: WorkSheet = workbook.Sheets[sheetName];
				const parsedData: InputData[] = utils.sheet_to_json(sheet);

				setFileData(parsedData);
			};
		}
	};

	return (
		<div className="manager-container flex flex-row w-full gap-4">
			<div className="left w-full min-h-[70vh]">
				<TransferEditor data={fileData} />
			</div>
			<div className="right flex flex-col gap-4 w-full">
				<div className="top-container flex flex-row justify-between items-center bg-slate-800 p-4 rounded-2xl">
					<div className="input-container">
						<input type="file" accept='.xlsx, .xls' onChange={handleFileUpload} />
					</div>
					<div className="controls-container p-0 m-0 leading-none">
						{fileData && Array.isArray(fileData) ? fileData.length > 0 && (
							<div className="table-controls flex gap-4">
								<button onClick={handleCompactClick}><MdFormatLineSpacing className="text-white text-2xl" /></button>
								<button onClick={handleExpand} className="text-white text-2xl">{isExpanded ? <TbLayoutSidebarLeftExpandFilled /> : <TbLayoutSidebarRightExpandFilled />}</button>
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