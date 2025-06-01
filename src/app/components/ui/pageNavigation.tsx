import { ChangeEvent, memo, useCallback, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

interface PageNavigationProps {
	updatePage: React.Dispatch<React.SetStateAction<number>>;
	pageCount: number;
	currentPage: number;
}

const MemoizedFaChevronLeft = memo(() => <FaChevronLeft />);
const MemoizedFaChevronRight = memo(() => <FaChevronRight />);

const PageNavigation: React.FC<PageNavigationProps> = ({ updatePage, pageCount, currentPage }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [inputValue, setInputValue] = useState<number>(currentPage + 1);

	const handlePrevPage = useCallback(() => {
		updatePage(prev => Math.max(0, prev - 1));
	}, [updatePage]);

	const handleNextPage = useCallback(() => {
		updatePage(prev => Math.min(pageCount - 1, prev + 1));
	}, [pageCount, updatePage]);

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (isNaN(parseInt(event.target.value))) { // If the user inputs anything other than numbers set input to current page
			setInputValue(currentPage + 1);
		} else {
			setInputValue(parseInt(event.target.value));
		}
	};

	const handleInputBlur = () => {
		if (inputValue >= 1 && inputValue <= pageCount) {
			updatePage(inputValue - 1);
		} else if (inputValue > pageCount) { // A small QOL feature, if input is greater than page count- set to page count instead of canceling
			updatePage(pageCount - 1);
			setInputValue(pageCount);
		} else {
			setInputValue(currentPage + 1);
		}

		setIsEditing(false);
	};

	const handleSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') handleInputBlur();
	};

	// Update input if it changes through other means like buttons
	useEffect(() => {
		setInputValue(currentPage + 1);
	}, [currentPage]);

	// Page navigation via arrow keys
	useEffect(() => {
		const handleKeypress = (e: KeyboardEvent) => {
			const isInput = document.activeElement instanceof HTMLInputElement;
			if (isInput) return;
			if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && pageCount > 0) {
				if (e.key === 'ArrowLeft') handlePrevPage();
				if (e.key === 'ArrowRight') handleNextPage();
			}
		};

		window.addEventListener('keydown', handleKeypress);

		return () => window.removeEventListener('keydown', handleKeypress);
	}, [handlePrevPage, handleNextPage, pageCount]);

	return (
		<div className="navigation-container flex items-center gap-4 dark:text-white text-slate-600">
			<button onClick={handlePrevPage} disabled={currentPage === 0} className="p-2 dark:bg-slate-600 bg-slate-300 rounded-lg cursor-pointer hover:bg-slate-500 transition-colors">
				<MemoizedFaChevronLeft />
			</button>
			{
				isEditing ? (
					<input type="text" value={inputValue} onChange={handleInputChange} onBlur={handleInputBlur} onKeyDown={handleSubmit} maxLength={6} className="w-16 p-1 text-center text-slate-200 bg-slate-500 rounded leading-none" autoFocus />
				) : (
					<span onClick={() => setIsEditing(true)} className="cursor-pointer hover:underline" >
						{currentPage + 1}/{pageCount}
					</span>
				)
			}

			<button onClick={handleNextPage} disabled={currentPage === pageCount - 1} className="p-2 dark:bg-slate-600 bg-slate-300 rounded-lg cursor-pointer hover:bg-slate-500 transition-colors">
				<MemoizedFaChevronRight />
			</button>
		</div>
	);
};

export default memo(PageNavigation, (prevProps, nextProps) => {
	return prevProps.updatePage === nextProps.updatePage && prevProps.pageCount === nextProps.pageCount && prevProps.currentPage === nextProps.currentPage;
});