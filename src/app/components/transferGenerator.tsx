import React, { useState, useRef, useEffect } from 'react';
import opentype, { Path } from 'opentype.js';

const TransferGenerator: React.FC = () => {
	const [text, setText] = useState('AaBbDdOoPpQqR');
	const [font, setFont] = useState<'PUMA' | 'ADIDAS'>('ADIDAS');
	const [fontSize, setFontSize] = useState<number>(48);
	const [counterColor, setCounterColor] = useState<string>('#0000ff');
	const [glyphColor, setGlyphColor] = useState<string>('#ff0000');
	const svgRef = useRef<HTMLDivElement>(null);

	const svgns = "http://www.w3.org/2000/svg";

	const colorTextInput = async (strokeWidth: string = '0.0002'): Promise<SVGSVGElement> => {
		const svg = document.createElementNS(svgns, "svg");
		svg.setAttribute("width", "500");
		svg.setAttribute("height", "300");

		try { // Attempt to load font
			const loadedFont = await opentype.load(font == 'ADIDAS' ? `fonts/Roboto-Regular.ttf` : 'fonts/lemon.ttf');
			const path = loadedFont.getPath(text, 10, 50, fontSize);

			let currentPath = new Path();
			let pathStart: [number, number] | null = null;

			// Drawing Paths depending on type of operation
			path.commands.forEach((cmd) => {
				if (cmd.type === 'M') {
					if (currentPath.commands.length > 0) {
						addPathToSVG(svg, currentPath, pathStart!, strokeWidth);
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
					addPathToSVG(svg, currentPath, pathStart!, strokeWidth);
					currentPath = new Path();
					pathStart = null;
				}
			});

			if (currentPath.commands.length > 0 && pathStart) {
				addPathToSVG(svg, currentPath, pathStart, strokeWidth);
			}

		} catch (error) {
			console.error("Error loading font:", error);
		}

		return svg;
	};

	function addPathToSVG(svg: SVGSVGElement, path: Path, start: [number, number], strokeWidth: string) {
		const pathElement = document.createElementNS(svgns, "path");
		pathElement.setAttribute("d", path.toPathData(2));
		pathElement.setAttribute("fill", "none");

		// Determine if the path is clockwise (inner) or counter-clockwise (outer)
		const isClockwise = isClockwisePath(path, start);

		// Change outline color based on path rotation
		pathElement.setAttribute("stroke", isClockwise ? counterColor : glyphColor);
		pathElement.setAttribute("stroke-width", strokeWidth);
		svg.appendChild(pathElement);
	}

	function isClockwisePath(path: Path, start: [number, number]): boolean {
		let sum = 0;
		let prev = start;
		path.commands.forEach(cmd => {
			if ('x' in cmd && 'y' in cmd) {
				sum += (cmd.x - prev[0]) * (cmd.y + prev[1]);
				prev = [cmd.x, cmd.y];
			}
		});
		// Close the path
		sum += (start[0] - prev[0]) * (start[1] + prev[1]);
		return sum > 0;
	}

	const handleDownload = async () => {
		const svg = await colorTextInput();
		const serializer = new XMLSerializer();
		const svgString = serializer.serializeToString(svg);
		const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
		const svgUrl = URL.createObjectURL(svgBlob);
		const downloadLink = document.createElement("a");
		downloadLink.href = svgUrl;
		downloadLink.download = `${font}.svg`;
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	};

	// Update preview depending when params change
	useEffect(() => {
		const updateSVG = async () => {
			const svg = await colorTextInput('1'); // 1 is so the text is actually visible, if the default value were used for preview it would be too thin to show up
			if (svgRef.current) {
				svgRef.current.innerHTML = ''; // Prevent recursion by resetting the children
				svgRef.current.appendChild(svg);
			}
		};
		updateSVG();
	}, [text, font, fontSize, counterColor, glyphColor]);

	return (
		<div className="p-4 rounded-2xl text-black bg-slate-800">
			<div className="mb-4">
				<input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text" className="border p-2 mr-2" />
				<input type="button" value='ADIDAS' onClick={(e) => setFont('ADIDAS')} className={`p-2 mr-2 ${font == 'ADIDAS' ? 'text-slate-600 bg-white' : 'text-gray-800 bg-gray-500'}`} />
				<input type="button" value='PUMA' onClick={(e) => setFont('PUMA')} className={`p-2 mr-2 ${font == 'PUMA' ? 'text-slate-600 bg-white' : 'text-gray-800 bg-gray-500'}`} />
				<input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} placeholder="Font size" className="border p-2 mr-2" />
				<input type="color" value={glyphColor} onChange={(e) => setGlyphColor(e.target.value)} className="mr-2" />
				<input type="color" value={counterColor} onChange={(e) => setCounterColor(e.target.value)} className="mr-2" />
			</div>
			<div ref={svgRef} className="mb-4 bg-white"></div>
			<button onClick={handleDownload} className="px-4 py-2 bg-slate-600 text-white rounded">Download SVG</button>
		</div>
	);
};

export default TransferGenerator;