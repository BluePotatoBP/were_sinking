import { useCallback, useEffect, useState, memo } from "react";
import opentype, { Path } from "opentype.js";
import { InputData, EditableColors } from '@/app/utils/types';
import { useDebounce } from '@/app/utils/hooks';

interface TransferGeneratorProps {
	itemData: InputData;
	font: 'NIKE' | 'PUMA' | 'CONDENSED';
	fontSize: number;
	colors: EditableColors;
	forDownload: boolean;
}

const TransferGenerator: React.FC<TransferGeneratorProps> = ({ itemData, font = 'NIKE', fontSize = 26, colors, forDownload }) => {
	const [svgContent, setSvgContent] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const createSVG = useCallback(async (): Promise<string> => {
		let dynamicFont: opentype.Font;
		let svgPaths: string[] = [];
		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;
		const {
			"Asset Name": assetName,
			"Team": teamName,
			"ID LEFT INSIDE": idLeftInside,
			"ID LEFT OUTSIDE": idLeftOutside,
			"ID RIGHT OUTSIDE": idRightOutside,
			"ID RIGHT INSIDE": idRightInside,
		} = itemData;

		try {
			const addPathToSVG = (path: Path, start: [number, number], colorCounters: boolean = true) => {
				const color = colorCounters
					? (isClockwisePath(path, start) ? colors.counterColor : colors.glyphColor)
					: colors.glyphColor;

				svgPaths.push(`<path d="${path.toPathData(2)}" fill="none" stroke="${color}" stroke-width="${forDownload ? '0.0002' : '1'}" />`);

				path.commands.forEach(cmd => {
					if ('x' in cmd && 'y' in cmd) {
						minX = Math.min(minX, cmd.x);
						minY = Math.min(minY, cmd.y);
						maxX = Math.max(maxX, cmd.x);
						maxY = Math.max(maxY, cmd.y);
					}
				});
			};

			const createTextGroup = async (x: number, y: number, colorCounters: boolean, inputText: string, isCondensed: boolean = false): Promise<opentype.BoundingBox> => {
				const dynamicFontSize = isCondensed ? Math.min(Math.max(fontSize, 10), 26) : fontSize;
				const path = dynamicFont.getPath(inputText, x, y, dynamicFontSize);
				let currentPath = new Path();
				let pathStart: [number, number] | null = null;

				path.commands.forEach((cmd) => {
					if (cmd.type === 'M') {
						if (currentPath.commands.length > 0) {
							addPathToSVG(currentPath, pathStart!, colorCounters);
							currentPath = new Path();
						}
						currentPath.moveTo(cmd.x, cmd.y);
						pathStart = [cmd.x, cmd.y];
					} else if (cmd.type === 'L') {
						currentPath.lineTo(cmd.x, cmd.y);
					} else if (cmd.type === 'C') {
						currentPath.curveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
					} else if (cmd.type === 'Q') {
						currentPath.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
					} else if (cmd.type === 'Z') {
						currentPath.closePath();
						addPathToSVG(currentPath, pathStart!, colorCounters);
						currentPath = new Path();
						pathStart = null;
					}
				});

				if (currentPath.commands.length > 0 && pathStart) {
					addPathToSVG(currentPath, pathStart, colorCounters);
				}

				return path.getBoundingBox();
			};

			// Create identifier text
			dynamicFont = await opentype.load('fonts/condensed.ttf');
			const identifierText = `${assetName ? assetName : 'N/A'}${teamName ? " - " + teamName : ''}`;
			const identifierBBox = await createTextGroup(0, 10, false, identifierText, true);

			// Create ID text
			dynamicFont = await opentype.load(font === 'NIKE' ? 'fonts/nike.ttf' : 'fonts/puma.ttf');
			const spacing = '            ';
			const verticalSpacing = fontSize * 1.5;
			const text = `${idLeftOutside ? idLeftOutside + spacing : ''}${idLeftInside ? idLeftInside + spacing : ''}${idRightOutside ? idRightOutside + spacing : ''}${idRightInside ? idRightInside : ''}`;

			// Add x duplicates and stack below each other
			let textBBox: opentype.BoundingBox | undefined;
			for (let i = 0; i < 4; i++) {
				const bbox = await createTextGroup(90, (20 + fontSize) + (i * verticalSpacing), text !== "", text || "N/A");
				if (i === 0) textBBox = bbox;
			}

			////////// RECT PADDING CALCULATIONS //////////
			const identifierWidth = identifierBBox.x2 - identifierBBox.x1;
			let requiredWidth: number;

			if (textBBox) {
				const idTextRightEdge = textBBox.x2 + 90;
				requiredWidth = Math.max(idTextRightEdge, identifierWidth + 10);
			} else {
				// Fallback in case text is ever empty for some ungodly reason
				requiredWidth = identifierWidth + 30;
			}

			// Add up
			const paddingX = requiredWidth - (maxX - minX);
			const paddingY = 10;
			minX -= paddingY;
			minY -= paddingY;
			maxX += paddingX;
			maxY += paddingY;

			// Calculate the width and height
			const width = (maxX - minX).toFixed(2);
			const height = (maxY - minY).toFixed(2);

			// Create the perforation rectangle
			const rectPath = `<rect x="${minX.toFixed(2)}" y="${minY.toFixed(2)}" width="${width}" height="${height}" fill="none" stroke="${colors.perforationColor}" stroke-width="${forDownload ? '0.0002' : '1'}" />`;

			// Combine all paths
			const allPaths = [rectPath, ...svgPaths].join('');
			// Create the final SVG string
			return `<svg xmlns="http://www.w3.org/2000/svg" ${forDownload ? `width=${width}` : 'width="100%"'} height="${height}" viewBox="${minX.toFixed(2)} ${minY.toFixed(2)} ${width} ${height}">${allPaths}</svg>`;

		} catch (error) {
			throw new Error(`${error}`);
		}
	}, [itemData, font, fontSize, colors, forDownload]);

	const debouncedSetSVGContent = useDebounce((svg: string) => {
		setSvgContent(svg);
	}, 50);

	useEffect(() => {
		if (itemData) {
			createSVG().then(svg => debouncedSetSVGContent(svg)).catch(err => setError(err.message));
		} else {
			setSvgContent(null);
			setError(null);
		}
	}, [createSVG, itemData, debouncedSetSVGContent]);

	// A non zero amount of time was spent styling this error box, that hopefully no one should ever see.
	if (error) return (
		<div className="error flex flex-col bg-red-500 rounded-lg p-8 justify-center items-left font-sans gap-2">
			<div className="error-info text-white font-bold text-xl border-l-4 border-red-300 border-solid px-4">
				Failed to generate Transfer(s)
			</div>
			<div className="error-message text-red-700 font-regular bg-red-100 p-4 rounded-lg">
				{error}
			</div>
		</div>
	);
	if (!svgContent) return;

	return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
};

const isClockwisePath = (path: Path, start: [number, number]): boolean => {
	let sum = 0;
	let prev = start;
	path.commands.forEach(cmd => {
		if ('x' in cmd && 'y' in cmd) {
			sum += (cmd.x - prev[0]) * (cmd.y + prev[1]);
			prev = [cmd.x, cmd.y];
		}
	});
	sum += (start[0] - prev[0]) * (start[1] + prev[1]);
	return sum > 0;
};

export default memo(TransferGenerator);
