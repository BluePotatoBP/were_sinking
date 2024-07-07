'use client';
import React, { useEffect, useState, ReactElement } from 'react';


interface InputData {
	[key: string]: string | number;
}

interface XlsxTableParserProps {
	data: InputData[];
	isCompact?: boolean;
	isExpanded?: boolean;
}


const XlsxTableParser: React.FC<XlsxTableParserProps> = ({ data, isCompact = false, isExpanded = true }) => {
	const [compactState, setCompactState] = useState(isCompact);

	useEffect(() => {
		setCompactState(isCompact);
	}, [isCompact]);

	return (
		<div className={`parser-container flex flex-col gap-4 ${isExpanded ? '' : 'max-w-16'}`}>
			{data.length > 0 && (
				<div className="rounded-2xl p-4 bg-slate-800">
					<div className="rounded-lg text-black max-h-[70vh] overflow-scroll">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-slate-700">
								<tr className='divide-x divide-slate-600'>
									{Object.keys(data[0]).map((key) => (
										<th key={key} className='p-3 text-left text-s font-medium text-white uppercase tracking-wider'>{key}</th>
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
	return prevProps.data === nextProps.data && prevProps.isCompact === nextProps.isCompact && prevProps.isExpanded === nextProps.isExpanded;
});
