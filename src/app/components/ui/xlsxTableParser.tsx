'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { InputData } from '@/app/utils/types';

interface XlsxTableParserProps {
	data: InputData[];
	isCompact?: boolean;
}

const XlsxTableParser: React.FC<XlsxTableParserProps> = ({ data, isCompact = false }) => {
	const [compactState, setCompactState] = useState(isCompact);

	useEffect(() => {
		setCompactState(isCompact);
	}, [isCompact]);

	// Get all unique keys from all objects in the data array
	const allKeys = useMemo(() => {
		const keySet = new Set<string>();
		data.forEach(row => {
			Object.keys(row).forEach(key => keySet.add(key));
		});
		return Array.from(keySet);
	}, [data]);

	return (
		<div className={`parser-container flex flex-col gap-4 self-end w-full`}>
			{data.length > 0 && (
				<div className="rounded-2xl p-4 dark:bg-slate-800 bg-slate-400">
					<div className="rounded-lg text-black overflow-auto max-h-[64vh] scroll-smooth">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="dark:bg-slate-700 bg-slate-500">
								<tr className='divide-x divide-slate-600'>
									<th className='p-4 text-center text-s font-medium text-white uppercase tracking-wider'>#</th>
									{allKeys.map((key) => (
										<th key={key} className='p-3 text-left text-s font-medium text-white uppercase tracking-wider'>{key}</th>
									))}
								</tr>
							</thead>
							<tbody className='bg-white'>
								{data.map((row: InputData, rowIndex) => (
									<tr key={rowIndex} className='even:bg-slate-200 divide-x divide-slate-300'>
										<td className={`${compactState ? 'py-[0.1rem]' : 'py-2'} px-4 whitespace-nowrap text-center`}>{rowIndex + 1}</td>
										{allKeys.map((key, colIndex) => (
											<td key={`${rowIndex}-${colIndex}`} className={`${compactState ? 'py-[0.1rem]' : 'py-2'} px-4 whitespace-nowrap`}>
												{
													row[key] !== undefined ? String(row[key]) : ''
												}
											</td>
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
