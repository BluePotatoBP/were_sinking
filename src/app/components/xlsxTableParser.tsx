'use client';
import React, { useEffect, useState, ReactElement } from 'react';


interface InputData {
	[key: string]: string | number;
}

interface XlsxTableParserProps {
	data: InputData[];
	isCompact?: boolean;
}


const XlsxTableParser = ({ data, isCompact = false }: XlsxTableParserProps): ReactElement => {
	const [compactState, setCompactState] = useState(isCompact);

	useEffect(() => {
		setCompactState(isCompact);
	}, [isCompact]);

	return (
		<div className="flex flex-col parser-container gap-4">
			{data.length > 0 && (
				<div className="rounded-2xl p-4 bg-slate-800">
					<div className="rounded-lg text-black max-h-[70vh] overflow-y-scroll">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-slate-700">
								<tr className='divide-x divide-slate-600'>
									{Object.keys(data[0]).map((key) => (
										<th key={key} className='p-4 text-left text-xs font-medium text-white uppercase tracking-wider'>{key}</th>
									))}
								</tr>
							</thead>
							<tbody className='bg-white'>
								{data.map((row: InputData, index) => (
									<tr key={index} className='even:bg-slate-200 divide-x divide-slate-300'>
										{Object.keys(data[0]).map((key, index) => (
											<td key={index} className={`${compactState ? 'py-[0.1rem]' : 'py-2'} px-4 whitespace-nowrap`}>{row[key] || ''}</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
};

export default React.memo(XlsxTableParser, (prevProps, nextProps) => {
	return prevProps.data === nextProps.data && prevProps.isCompact === nextProps.isCompact;
});
