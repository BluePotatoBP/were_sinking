import React, { useState, useRef, useEffect, useCallback } from 'react';
import opentype, { Path } from 'opentype.js';

interface InputData {
	[key: string]: string | number;
}

interface TransferGeneratorProps {
	data: InputData[];
}

const TransferGenerator: React.FC<TransferGeneratorProps> = ({ data }) => {
	const [text, setText] = useState('ID ID ID ID');
	const [identifierText, setIdentifierText] = useState('Name - Club');
	const [font, setFont] = useState<'PUMA' | 'NIKE'>('NIKE');
	const [fontSize, setFontSize] = useState<number>(26);
	const [counterColor, setCounterColor] = useState<string>('#0000ff');
	const [glyphColor, setGlyphColor] = useState<string>('#ff0000');
	const [perforationColor, setPerforationColor] = useState<string>('#00ff00');
	const svgRef = useRef<HTMLDivElement>(null);
	const [exactSizeSvg, setExactSizeSvg] = useState<SVGSVGElement | null>(null);

	const svgns = "http://www.w3.org/2000/svg";

	const addPathToSVG = useCallback((svg: SVGElement, path: Path, start: [number, number], strokeWidth: string = '0.0002', colorCounters: boolean = true) => {
		const pathElement = document.createElementNS(svgns, "path");
		const isClockwise = isClockwisePath(path, start);
		pathElement.setAttribute("d", path.toPathData(2));
		pathElement.setAttribute("fill", "none");

		if (colorCounters) pathElement.setAttribute("stroke", isClockwise ? counterColor : glyphColor);
		else pathElement.setAttribute("stroke", glyphColor);

		pathElement.setAttribute("stroke-width", strokeWidth);

		svg.appendChild(pathElement);
	}, [counterColor, glyphColor]);

	const createTextGroup = useCallback(async (svg: SVGSVGElement, x: number, y: number, strokeWidth: string = '0.0002', colorCounters: boolean, inputText: string): Promise<Path[]> => {
		const paths: Path[] = [];
		try {
			const loadedFont = await opentype.load(font == 'NIKE' ? `fonts/nike.ttf` : 'fonts/puma.ttf');
			const path = loadedFont.getPath(inputText, x, y, fontSize);

			let currentPath = new Path();
			let pathStart: [number, number] | null = null;

			path.commands.forEach((cmd) => {
				if (cmd.type === 'M') {
					if (currentPath.commands.length > 0) {
						addPathToSVG(svg, currentPath, pathStart!, strokeWidth, colorCounters);
						paths.push(currentPath);
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
					addPathToSVG(svg, currentPath, pathStart!, strokeWidth, colorCounters);
					paths.push(currentPath);
					currentPath = new Path();
					pathStart = null;
				}
			});

			if (currentPath.commands.length > 0 && pathStart) {
				addPathToSVG(svg, currentPath, pathStart, strokeWidth);
				paths.push(currentPath);
			}

		} catch (error) {
			console.error("Error loading font:", error);
		}
		return paths;
	}, [addPathToSVG, font, fontSize, text]);

	const createSVG = useCallback(async (forDownload: boolean = false): Promise<SVGSVGElement> => {
		const svg = document.createElementNS(svgns, "svg") as SVGSVGElement;
		const strokeWidth = forDownload ? '0.0002' : '0.5';
		const verticalSpacing = fontSize * 1.5;
		const allPaths: Path[] = [];

		// Create identifier text first
		const identifier = await createTextGroup(svg, 0, 10, strokeWidth, false, identifierText);
		allPaths.push(...identifier);

		// Create 4 duplicates and stack below eachother
		await Promise.all([0, 1, 2, 3].map(async i => {
			const paths = await createTextGroup(svg, 90, 50 + i * verticalSpacing, strokeWidth, true, text);
			allPaths.push(...paths);
		}));

		// Calculate bounding box for all paths
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		allPaths.forEach(path => {
			path.commands.forEach(cmd => {
				if ('x' in cmd && 'y' in cmd) {
					minX = Math.min(minX, cmd.x);
					minY = Math.min(minY, cmd.y);
					maxX = Math.max(maxX, cmd.x);
					maxY = Math.max(maxY, cmd.y);
				}
			});
		});

		// Add padding
		const paddingX = 90;
		const paddingY = 10;
		minX -= paddingY; // weird layout = weird values
		minY -= paddingY;
		maxX += paddingX;
		maxY += paddingY;

		// Calculate the width and height
		const width = (maxX - minX).toFixed(2);
		const height = (maxY - minY).toFixed(2);

		// Set the viewBox to include the entire content
		svg.setAttribute("viewBox", `${minX.toFixed(2)} ${minY.toFixed(2)} ${width} ${height}`);

		// Add the green rectangle for perforation
		const rect = document.createElementNS(svgns, "rect");
		rect.setAttribute("x", minX.toFixed(2));
		rect.setAttribute("y", minY.toFixed(2));
		rect.setAttribute("width", width);
		rect.setAttribute("height", height);
		rect.setAttribute("fill", "none");
		rect.setAttribute("stroke", "rgb(0, 255, 0)");
		rect.setAttribute("stroke-width", strokeWidth);

		// Insert the rectangle before the first child
		svg.insertBefore(rect, svg.firstChild);

		// Update SVG size
		svg.setAttribute("width", width);
		svg.setAttribute("height", height);

		return svg;
	}, [createTextGroup, fontSize]);

	const handleDownload = () => {
		if (exactSizeSvg) {
			const serializer = new XMLSerializer();
			const svgString = serializer.serializeToString(exactSizeSvg);
			const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
			const svgUrl = URL.createObjectURL(svgBlob);
			const downloadLink = document.createElement("a");
			downloadLink.href = svgUrl;
			downloadLink.download = `${font}.svg`;
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
		}
	};

	useEffect(() => {
		const updateSVG = async () => {
			const previewSvg = await createSVG();
			if (svgRef.current) {
				svgRef.current.innerHTML = '';
				svgRef.current.appendChild(previewSvg);
			}

			const downloadSvg = await createSVG(true);
			setExactSizeSvg(downloadSvg);
		};
		updateSVG();
	}, [text, font, fontSize, counterColor, glyphColor, perforationColor, createSVG]);

	return (
		<div className="p-4 flex flex-col rounded-2xl text-black bg-slate-800 gap-4">
			<div className="flex flex-row items-center">
				<input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text" className="border p-2 mr-2" />
				<input type="button" value='NIKE' onClick={() => setFont('NIKE')} className={`p-2 mr-2 ${font == 'NIKE' ? 'text-slate-600 bg-white' : 'text-gray-800 bg-gray-500'}`} />
				<input type="button" value='PUMA' onClick={() => setFont('PUMA')} className={`p-2 mr-2 ${font == 'PUMA' ? 'text-slate-600 bg-white' : 'text-gray-800 bg-gray-500'}`} />
				<input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} placeholder="Font size" className="border p-2 mr-2" />
				<input type="color" value={glyphColor} onChange={(e) => setGlyphColor(e.target.value)} className="mr-2" />
				<input type="color" value={counterColor} onChange={(e) => setCounterColor(e.target.value)} className="mr-2" />
				<input type="color" value={perforationColor} onChange={(e) => setPerforationColor(e.target.value)} className="mr-2" />
			</div>
			<div ref={svgRef} className="bg-white flex justify-center"></div>
			<button onClick={handleDownload} className="px-4 py-2 bg-slate-600 text-white rounded">Download SVG</button>
		</div>
	);
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

export default TransferGenerator;