'use client';

import { useEffect } from 'react';

export default function Error({ error, reset, }: { error: Error & { digest?: string; }; reset: () => void; }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className='flex flex-col w-full min-h-screen items-center justify-center'>
			<div className="flex flex-col gap-4 p-4 bg-red-500 rounded-lg text-white">
				<div className='font-bold'>Something went wrong!</div>
				<div className='flex flex-col font-base bg-red-100 text-red-900 p-2 rounded-md max-w-3xl text-wrap'>
					<div className="font-bold uppercase">{error.name}:</div>
					<div className="">{error.message}</div>
				</div>
				<button className='bg-white rounded-md text-black font-semibold self-start py-2 px-6' onClick={() => reset()} >
					Retry
				</button>
			</div>
		</div>
	);
}