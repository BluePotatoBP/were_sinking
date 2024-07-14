import { useCallback, useEffect, useRef, useState, useMemo, memo } from "react";
import opentype, { Path } from "opentype.js";
import { InputData, EditableColors } from '@/app/utils/types';

interface TransferGeneratorProps {
	itemData: InputData;
	font: 'NIKE' | 'PUMA' | 'PUMA ALT' | 'CONDENSED';
	fontSize: number;
	colors: EditableColors;
	isGlobalEdit: boolean;
	globalColors: EditableColors;
	forDownload: boolean;
}

const TransferGenerator: React.FC<TransferGeneratorProps> = ({ itemData, font = 'NIKE', fontSize = 26, colors, isGlobalEdit, globalColors, forDownload }) => {
	const [svgContent, setSvgContent] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const effectiveColors = isGlobalEdit ? globalColors : colors;

	const createSVG = useCallback(async (): Promise<string> => {
		const {
			"Asset Name": assetName,
			"Team": teamName,
			"ID LEFT INSIDE": idLeftInside,
			"ID LEFT OUTSIDE": idLeftOutside,
			"ID RIGHT OUTSIDE": idRightOutside,
			"ID RIGHT INSIDE": idRightInside,
		} = itemData;

		let dynamicFont: opentype.Font;
		const consistentSpaces = '          '; // I havent looked into separation with any other methods yet. temporary?
		const verticalSpacing = fontSize * 1.5;
		const text = `${idLeftOutside ? idLeftOutside + consistentSpaces : ''}${idLeftInside ? idLeftInside + consistentSpaces : ''}${idRightOutside ? idRightOutside + consistentSpaces : ''}${idRightInside ? idRightInside : ''}`;
		const identifierText = `${assetName} - ${teamName}`;
		let svgPaths: string[] = [];
		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;

		try {
			const addPathToSVG = (path: Path, start: [number, number], colorCounters: boolean = true) => {
				const color = colorCounters
					? (isClockwisePath(path, start) ? effectiveColors.counterColor : effectiveColors.glyphColor)
					: effectiveColors.glyphColor;

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

			const createTextGroup = async (x: number, y: number, colorCounters: boolean, inputText: string) => {
				const path = dynamicFont.getPath(inputText, x, y, fontSize);
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
			};

			// Create identifier text
			dynamicFont = await opentype.load('fonts/condensed.ttf');;
			createTextGroup(0, 10, false, identifierText);

			// Create 4 duplicates and stack below each other
			dynamicFont = await opentype.load(font === 'NIKE' ? 'fonts/nike.ttf' : 'fonts/puma.ttf');;
			[0, 1, 2, 3].forEach(i => {
				createTextGroup(90, 50 + i * verticalSpacing, true, text);
			});

			// Add padding
			const paddingX = 90;
			const paddingY = 10;
			minX -= paddingY;
			minY -= paddingY;
			maxX += paddingX;
			maxY += paddingY;

			// Calculate the width and height
			const width = (maxX - minX).toFixed(2);
			const height = (maxY - minY).toFixed(2);

			// Create the perforation rectangle
			const rectPath = `<rect x="${minX.toFixed(2)}" y="${minY.toFixed(2)}" width="${width}" height="${height}" fill="none" stroke="${effectiveColors.perforationColor}" stroke-width="${forDownload ? '0.0002' : '1'}" />`;

			// Combine all paths
			const allPaths = [rectPath, ...svgPaths].join('');

			// Create the final SVG string
			return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX.toFixed(2)} ${minY.toFixed(2)} ${width} ${height}">${allPaths}</svg>`;

		} catch (error) {
			console.error("Error creating SVG:", error);
			throw new Error("Failed to create transfer. Please try again.");
		}
	}, [itemData, font, fontSize, effectiveColors, forDownload]);

	useEffect(() => {
		if (itemData) {
			createSVG().then(svg => setSvgContent(svg)).catch(err => setError(err.message));
		} else {
			setSvgContent(null);
			setError(null);
		}
	}, [createSVG, itemData]);

	if (error) return <div className="error bg-red-500 text-white rounded-lg p-4">{error}</div>;
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
