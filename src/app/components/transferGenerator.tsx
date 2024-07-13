import opentype, { Path } from "opentype.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { InputData } from '@/app/utils/types';

const TransferGenerator: React.FC<{ itemData: InputData; }> = ({ itemData }) => {
	const {
		"Asset Name": assetName,
		"Team Name": teamName,
		"ID LEFT INSIDE": idLeftInside,
		"ID RIGHT INSIDE": idRightInside,
		"ID LEFT OUTSIDE": idLeftOutside,
		"ID RIGHT OUTSIDE": idRightOutside,
	} = itemData;

	const string = idLeftInside?.toString() + idRightInside?.toString() + idLeftOutside?.toString() + idRightOutside?.toString();

	const [text, setText] = useState(string);
	const [identifierText, setIdentifierText] = useState(`${assetName} - ${teamName}`);
	const [font, setFont] = useState<'PUMA' | 'NIKE'>('NIKE');
	const [fontSize, setFontSize] = useState<number>(26);
	const [counterColor, setCounterColor] = useState<string>('#0000ff');
	const [glyphColor, setGlyphColor] = useState<string>('#ff0000');
	const [perforationColor, setPerforationColor] = useState<string>('#00ff00');

	const [svgWidth, setSvgWidth] = useState<string>();
	const [svgHeight, setSvgHeight] = useState<string>();
	const [viewBoxString, setViewBoxString] = useState<string>();

	const svgRef = useRef<SVGSVGElement>(null);
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
	}, [addPathToSVG, font, fontSize]);

	const createSVG = useCallback(async (forDownload: boolean = false): Promise<SVGSVGElement> => {
		const svg = document.createElementNS(svgns, "g") as SVGSVGElement;
		const strokeWidth = forDownload ? '0.0002' : '1';
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

		// Update SVG size
		if (forDownload) {
			setSvgWidth(width);
			setSvgHeight(height);
		} else { // For preview- makes all transfers consistent widths
			setSvgWidth(width);
			setSvgHeight("100%");
		}

		// Set the viewBox to include the entire content
		setViewBoxString(`${minX.toFixed(2)} ${minY.toFixed(2)} ${width} ${height}`);

		// Add rectangle for perforation
		const rect = document.createElementNS(svgns, "rect");
		rect.setAttribute("x", minX.toFixed(2));
		rect.setAttribute("y", minY.toFixed(2));
		rect.setAttribute("width", width);
		rect.setAttribute("height", height);
		rect.setAttribute("fill", "none");
		rect.setAttribute("stroke", perforationColor);
		rect.setAttribute("stroke-width", strokeWidth);

		// Insert the rectangle before the first child
		svg.insertBefore(rect, svg.firstChild);

		return svg;
	}, [createTextGroup, fontSize, perforationColor, identifierText, text]);

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

	useEffect(() => {
		const updateSvg = async () => {
			if (svgRef.current) {
				const svg = await createSVG(false);
				svgRef.current.innerHTML = '';
				svgRef.current.appendChild(svg);
			}
		};

		updateSvg();
	}, [itemData, createSVG]);

	return (
		<svg ref={svgRef} width={svgWidth} height={svgHeight} viewBox={viewBoxString} ></svg>
	);
};

export default TransferGenerator;