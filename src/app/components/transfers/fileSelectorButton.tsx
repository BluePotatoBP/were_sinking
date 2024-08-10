import { ChangeEvent, useRef } from "react";
import { WorkBook, WorkSheet, read, utils } from "xlsx";
import { InputData } from '@/app/utils/types';
import { individualTemplate } from '@/app/utils/misc';

interface FileSelectorButtonProps {
	onFileSelect: (data: InputData[]) => void;
}

const FileSelectorButton: React.FC<FileSelectorButtonProps> = ({ onFileSelect }) => {
	const inputRef = useRef<HTMLInputElement | null>(null);

	const handleFileUpload = async (input: ChangeEvent<HTMLInputElement>) => {
		const reader = new FileReader();
		if (input.target.files && input.target.files.length > 0) {
			reader.readAsArrayBuffer(input.target.files[0] as Blob);
			reader.onload = async (loaded) => {
				const data = loaded.target?.result;
				const workbook: WorkBook = read(data, { type: 'binary' });
				const sheetName = workbook.SheetNames[0];
				const sheet: WorkSheet = workbook.Sheets[sheetName];
				const parsedData: InputData[] = utils.sheet_to_json(sheet);

				/**
				 * Filter data to get rid of emoji and symbols.
				 * 
				 * It's actually reversed, match unicode characters
				 * like letters + most symbols and discard everything else (emoji)
				 */
				const regexStr = /[\p{L}\d!@#$%^&*()?.,<>\/\\'":;+_\-\+~`\|{}\[\]=]+/ug;

				const filteredData: InputData[] = parsedData.map((item) => {
					const filteredItem: InputData = {};
					Object.keys(individualTemplate).forEach((field) => {
						const value = item[field];
						if (value !== undefined) {
							const matchedValue = value.toString().match(regexStr)?.join(' ');
							if (matchedValue) {
								filteredItem[field] = isNaN(parseInt(matchedValue)) ? matchedValue : parseInt(matchedValue);
							}
						} else {
							filteredItem[field] = ""; // Set empty string for missing fields
						}
					});
					return filteredItem;
				});

				onFileSelect(filteredData);
			};
		}
	};

	return (
		<div className="select-file-btn">
			<button className="text-slate-500 font-mono font-black transition-colors hover:text-white whitespace-nowrap" onClick={() => inputRef.current?.click()}>Choose File</button>
			<input type="file" id="table-input" ref={inputRef} accept='.xlsx, .xls' onChange={handleFileUpload} className="hidden" />
		</div>
	);
};

export default FileSelectorButton;