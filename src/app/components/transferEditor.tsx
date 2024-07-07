import React, { useState, useCallback, useEffect, Suspense, memo } from 'react';
import { FaCirclePlus } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";

const TransferGenerator = React.lazy(() => import('@/app/components/transferGenerator'));

interface InputData {
	[key: string]: string | number;
}

interface TransferEditorProps {
	data: InputData[];
}

const TransferEditor: React.FC<TransferEditorProps> = ({ data }) => {
	// legacy stuff, figure out later
	const [text, setText] = useState("ID");
	const [identifierText, setIdentifierText] = useState("Player Name - Team Name");
	const [font, setFont] = useState<'PUMA' | 'NIKE'>('NIKE');
	const [fontSize, setFontSize] = useState<number>(26);

	const [colors, setColors] = useState({
		counterColor: '#0000ff',
		glyphColor: '#ff0000',
		perforationColor: '#00ff00'
	});

	const [activeElement, setActiveElement] = useState(true);

	const handleColorChange = useCallback((index: number, colorType: string, value: string) => {
		setColors(prevColors => ({
			...prevColors,
			[colorType]: value
		}));
	}, []);
	// TODO: can you tell i have ADHD? - implement later :D
	const handleTextChange = useCallback((value: string) => {
		setText(value);
	}, []);

	const handleIdentifierTextChange = useCallback((value: string) => {
		setIdentifierText(value);
	}, []);

	const handleFontSizeChange = useCallback((value: number) => {
		setFontSize(value);
	}, []);

	return (
		<div className="p-4 flex flex-col rounded-2xl text-black bg-slate-800 gap-4">
			<div className={`flex flex-row items-center gap-3 bg-slate-700 p-4 rounded-lg ${activeElement ? 'justify-between' : "justify-center"}`}>
				{activeElement && (
					<div className="editor-container flex flex-col gap-2">
						<div className="settings flex flex-row gap-2 items-center">
							<input type="text" placeholder="Identifier" className="w-32 p-2" />
							<input type="button" value='NIKE' onClick={() => setFont('NIKE')} className={`p-2 w-[3.75rem] cursor-pointer ${font == 'NIKE' ? 'text-slate-600 bg-white' : 'text-gray-800 bg-gray-500'}`} />
							<input type="button" value='PUMA' onClick={() => setFont('PUMA')} className={`p-2 w-[3.75rem] cursor-pointer ${font == 'PUMA' ? 'text-slate-600 bg-white' : 'text-gray-800 bg-gray-500'}`} />
							<input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} placeholder="Font size" className="p-2 w-[3.75rem]" />
							<input type="color" className='cursor-pointer w-[3.75rem]' value={colors.glyphColor} onChange={(e) => handleColorChange(e.target.tabIndex, "glyphColor", e.target.value)} />
							<input type="color" className='cursor-pointer w-[3.75rem]' value={colors.counterColor} onChange={(e) => handleColorChange(e.target.tabIndex, "counterColor", e.target.value)} />
							<input type="color" className='cursor-pointer w-[3.75rem]' value={colors.perforationColor} onChange={(e) => handleColorChange(e.target.tabIndex, "perforationColor", e.target.value)} />
						</div>
						<div className="individual-id-container flex flex-row gap-2">
							<input type="text" placeholder="ID 1" className="w-32 p-2" />
							<input type="text" placeholder="ID 2" className="w-32 p-2" />
							<input type="text" placeholder="ID 2" className="w-32 p-2" />
							<input type="text" placeholder="ID 3" className="w-32 p-2" />
						</div>
					</div>
				)}
				<div className="icon flex justify-center w-full">
					<FaCirclePlus className={`text-white leading-none text-2xl cursor-pointer hover:text-slate-300 ${activeElement ? 'text-4xl' : "w-1/5"}`} title='Add New' />
				</div>
			</div>
			<div className="bg-white flex flex-wrap justify-center gap-[2mm] p-4 max-h-[57.8vh] max-w-[40vw] overflow-y-scroll rounded-lg">
				<Suspense fallback={<div>Loading...</div>}>
					{data.map((i, index) => (<TransferGenerator data={i} key={index} />))}
				</Suspense>
			</div>
			<button className="p-4 bg-slate-600 text-white rounded-lg flex flex-row justify-center gap-2 items-center hover:bg-slate-500">
				Download <FaInfoCircle title='Download transfer(s) as an SVG file. Further processing may be required.' />
			</button>
		</div>
	);
};


export default memo(TransferEditor, (prevProps, nextProps) => {
	return prevProps.data === nextProps.data;
});