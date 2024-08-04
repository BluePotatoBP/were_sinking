import { TransferRectangle, Sheet } from '@/app/utils/types';

/**
 * NOTE: The horizontal/vertical spacing might vary slightly due to the way displays work.
 * 
 * `3` units is approximately `1mm` vertically and `1.23mm` horizontally.
 */
const SPACING = 3;

function PackTransfers(transfers: TransferRectangle[], sheetWidth: number, sheetHeight: number): Sheet[] {
	const sheets: Sheet[] = [];
	let currentSheet: Sheet = { width: sheetWidth, height: sheetHeight, transfers: [] };

	// Sort by area, from largest to smallest
	const sortedTransfers = [...transfers].sort((a, b) => b.height * b.width - a.height * a.width);

	// Attempt to place all transfers
	for (const rect of sortedTransfers) {
		const canPlace = placeTransfers(currentSheet, rect);
		if (!canPlace) {
			// If cant place, make new sheet
			sheets.push(currentSheet);
			currentSheet = { width: sheetWidth, height: sheetHeight, transfers: [] };
		}
	}

	// Add last sheet to array if it has any transfers
	if (currentSheet.transfers.length > 0) {
		sheets.push(currentSheet);
	}

	return sheets;
}

function placeTransfers(sheet: Sheet, rect: TransferRectangle): boolean {
	// Go through possible positions on sheet
	for (let y = 0; y <= sheet.height - rect.height; y += SPACING) {
		for (let x = 0; x <= sheet.width - rect.width; x += SPACING) {
			if (canPlaceTransfers(sheet, rect, x, y)) {
				// If can be placed, add to current sheet
				sheet.transfers.push({ ...rect, x, y });
				return true;
			}
		}
	}
	return false;
}

function canPlaceTransfers(sheet: Sheet, rect: TransferRectangle, x: number, y: number): boolean {
	// Check if the new transfer (or rect, simplified for clarity) overlaps with any existing ones
	for (const placedRect of sheet.transfers) {
		if (
			x < placedRect.x + placedRect.width + SPACING &&
			x + rect.width + SPACING > placedRect.x &&
			y < placedRect.y + placedRect.height + SPACING &&
			y + rect.height + SPACING > placedRect.y
		) {
			return false; // Overlap
		}
	}
	return true; // Free to place at position
}

export default PackTransfers;