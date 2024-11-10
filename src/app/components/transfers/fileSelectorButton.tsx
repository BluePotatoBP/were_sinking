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
				const workbook: WorkBook = read(data, {
					type: 'array',
					raw: false,
					dateNF: 'dd/mm/yy',
					cellText: true,
					cellDates: false,
					sheetStubs: true,
					cellNF: false,
					cellStyles: false
				});

				const sheetName = workbook.SheetNames[0];
				const sheet: WorkSheet = workbook.Sheets[sheetName];

				// Convert date type to string
				Object.keys(sheet).forEach(cell => {
					if (sheet[cell] && sheet[cell].t === 'd') {
						sheet[cell].t = 's';
					}
				});

				// Create a header mapping for case-insensitive matching
				const headerMapping: { [key: string]: string; } = {};
				Object.keys(individualTemplate).forEach(templateHeader => {
					headerMapping[templateHeader.toUpperCase().trim()] = templateHeader;
				});

				const parsedData: InputData[] = utils.sheet_to_json(sheet, {
					raw: false,
					defval: "",
					blankrows: false
				});

				/**
				 * Filter data to get rid of emoji and symbols.
				 * 
				 * It's actually reversed, match unicode characters
				 * like letters + most symbols and discard everything else (emoji)
				 */
				const regexStr = /[\p{L}\d!@#$%^&*()?.,<>\/\\'":;+_\-\+~`\|{}\[\]=]+/ug;

				const filteredData: InputData[] = parsedData.map((item) => {
					const filteredItem: InputData = {};
					// Process each field in the Excel row
					Object.entries(item).forEach(([excelHeader, value]) => {
						// Normalize the Excel header
						const normalizedHeader = excelHeader.toUpperCase().trim();
						// Find the matching template header
						const matchingTemplateHeader = headerMapping[normalizedHeader];

						if (matchingTemplateHeader) {
							// Only process if we found a matching header
							if (value !== undefined) {
								const stringValue = String(value).trim();
								const matchedValue = stringValue.match(regexStr)?.join(' ');
								filteredItem[matchingTemplateHeader] = matchedValue || "";
							} else {
								filteredItem[matchingTemplateHeader] = "";
							}
						}
					});

					// Ensure all template fields exist in the filtered item
					Object.keys(individualTemplate).forEach((field) => {
						if (!(field in filteredItem)) {
							filteredItem[field] = "";
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