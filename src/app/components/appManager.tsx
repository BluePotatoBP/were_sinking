'use client';
import XlsxTableParser from "@/app/components/xlsxTableParser";
import TransferGenerator from "@/app/components/transferGenerator";

import { ChangeEvent, ReactElement, useState } from "react";
import { WorkBook, WorkSheet, read, utils } from "xlsx";
import { MdFormatLineSpacing } from "react-icons/md";

interface InputData {
	[key: string]: string | number;
}

const AppManager = (): ReactElement => {

	const [isCompact, setIsCompact] = useState<boolean>(false);
	const [fileData, setFileData] = useState<InputData[]>([]);;
	const handleCompactClick = () => setIsCompact(!isCompact);

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
				<TransferGenerator data={fileData} />
			</div>
			<div className="right flex flex-col gap-4 w-full">
				<div className="top-container flex flex-row justify-between items-center bg-slate-800 p-4 rounded-2xl">
					<div className="input-container">
						<input type="file" accept='.xlsx, .xls' onChange={handleFileUpload} />
					</div>
					<div className="controls-container p-0 m-0 leading-none">
						{fileData.length > 0 && (
							<button onClick={handleCompactClick}><MdFormatLineSpacing /></button>
						)}
					</div>
				</div>
				<XlsxTableParser data={fileData} isCompact={isCompact} key={isCompact.toString()} />
			</div>
		</div>
	);
};

export default AppManager;