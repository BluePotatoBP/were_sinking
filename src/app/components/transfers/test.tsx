'use client';
import React, { useCallback, ChangeEvent, useRef, useState } from "react";
import { Path } from 'opentype.js';
import { parseSVG, makeAbsolute, CommandMadeAbsolute, CurveToCommandMadeAbsolute, SmoothCurveToCommandMadeAbsolute, QuadraticCurveToCommandMadeAbsolute, SmoothQuadraticCurveToCommandMadeAbsolute } from 'svg-path-parser';

const TestComponent: React.FC = () => {
	const svgContainerRef = useRef<HTMLDivElement | null>(null);
	const [svgElement, setSvgElement] = useState<string | null>(null);


	const isClockwisePath = (path: Path, start: number[]): boolean => {
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

	const handleDownload = () => {
		const randomString = window.crypto.randomUUID().substring(0, 4);
		if (svgElement) {
			const blob = new Blob([svgElement], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${randomString}.svg`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		}
	};

	const isCurveTo = (cmd: CommandMadeAbsolute): cmd is CurveToCommandMadeAbsolute =>
		cmd.command === 'curveto';

	const isSmoothCurveTo = (cmd: CommandMadeAbsolute): cmd is SmoothCurveToCommandMadeAbsolute =>
		cmd.command === 'smooth curveto';

	const isQuadraticCurveTo = (cmd: CommandMadeAbsolute): cmd is QuadraticCurveToCommandMadeAbsolute =>
		cmd.command === 'quadratic curveto';

	const isSmoothQuadraticCurveTo = (cmd: CommandMadeAbsolute): cmd is SmoothQuadraticCurveToCommandMadeAbsolute =>
		cmd.command === 'smooth quadratic curveto';

	const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		let svgPaths: string[] = [];

		const addPathToSVG = (path: Path, start: [number, number]) => {
			const color = (isClockwisePath(path, start) ? "red" : "blue");
			svgPaths.push(`<path d="${path.toPathData(2)}" fill="none" stroke="${color}" stroke-width="1" />`);
		};

		if (event.target.files !== null) {
			const file = event.target.files[0];

			if (file && file.type === "image/svg+xml") {
				const reader = new FileReader();

				reader.onload = (e) => {
					const svgData = e.target?.result as string;
					const parser = new DOMParser();
					const svgDoc = parser.parseFromString(svgData, 'image/svg+xml');
					const pathElements = svgDoc.querySelectorAll('path');

					let combinedPathData = '';
					pathElements.forEach((pathElement) => {
						const pathData = pathElement.getAttribute('d');
						if (pathData) combinedPathData += pathData + ' ';
					});

					if (combinedPathData) {
						let path = new Path();
						const parsedCommands = parseSVG(combinedPathData);
						const absoluteCommands = makeAbsolute(parsedCommands);

						let minX = Infinity,
							minY = Infinity,
							maxX = -Infinity,
							maxY = -Infinity;

						// Use opentype functions for commands
						absoluteCommands.forEach((cmd, index) => {
							switch (cmd.code) {
								case 'M':
									if (path.commands.length > 0) {
										addPathToSVG(path, [cmd.x, cmd.y]);
										path = new Path();
									}
									path.moveTo(cmd.x, cmd.y);
									break;
								case 'L':
								case 'H':
								case 'V':
									path.lineTo(cmd.x, cmd.y);
									break;
								case 'C':
									if (isCurveTo(cmd)) {
										path.curveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
									}
									break;
								case 'S':
									if (isSmoothCurveTo(cmd)) {
										const prevCmd = absoluteCommands[index - 1];
										let x1: number, y1: number;
										if (isCurveTo(prevCmd) || isSmoothCurveTo(prevCmd)) {
											x1 = prevCmd.x * 2 - prevCmd.x2;
											y1 = prevCmd.y * 2 - prevCmd.y2;
										} else {
											x1 = prevCmd.x;
											y1 = prevCmd.y;
										}
										path.curveTo(x1, y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
									}
									break;
								case 'Q':
									if (isQuadraticCurveTo(cmd)) {
										path.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
									}
									break;
								case 'T':
									if (isSmoothQuadraticCurveTo(cmd)) {
										const prevCmd = absoluteCommands[index - 1];
										let x1: number, y1: number;

										if (isQuadraticCurveTo(prevCmd)) {
											x1 = prevCmd.x * 2 - prevCmd.x1;
											y1 = prevCmd.y * 2 - prevCmd.y1;
										} else if (isSmoothQuadraticCurveTo(prevCmd)) {
											// For smooth quad curves, we don't have x1/y1, so we use the current point
											x1 = prevCmd.x;
											y1 = prevCmd.y;
										} else {
											x1 = prevCmd.x;
											y1 = prevCmd.y;
										}

										path.quadraticCurveTo(x1, y1, cmd.x, cmd.y);
									}
									break;
								case 'A':
									console.warn("Arc command 'A' is not directly supported by opentypejs. Fallback to line.");
									path.lineTo(cmd.x, cmd.y);
									break;
								case 'Z':
									path.closePath();
									addPathToSVG(path, [cmd.x, cmd.y]);
									path = new Path();
									break;
								default:
									console.warn("Unsupported command: ", cmd);
									break;
							}

							// Update bounding box
							minX = Math.min(minX, cmd.x);
							minY = Math.min(minY, cmd.y);
							maxX = Math.max(maxX, cmd.x);
							maxY = Math.max(maxY, cmd.y);
						});

						// Calculate viewBox
						const width = maxX - minX;
						const height = maxY - minY;
						const viewBox = `${minX} ${minY} ${width * 1.25} ${height * 1.25}`;

						// Create SVG with viewBox
						const svgElement = // 0.0002 is stroke width for download/production
							`
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="${viewBox}" stroke-width="1">
									${svgPaths.join('')}
								</svg>
							`;
						setSvgElement(svgElement);

						// Display the SVG for preview
						if (svgContainerRef.current) {
							svgContainerRef.current.innerHTML = svgElement;
						}
					}
				};

				reader.readAsText(file);
			}
		}
	}, []);

	return (
		<div>
			<input type="file" accept="image/svg+xml" onChange={handleChange} />
			<div ref={svgContainerRef} id="svg-container" />
			<button onClick={handleDownload}>Download</button>
		</div>
	);
};

export default TestComponent;

/**
 * 
 * SAMPLE SVG
 * 
 * 

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Creator: CorelDRAW -->
<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="75.2622mm" height="75mm" version="1.1" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"
viewBox="0 0 461.89 460.28"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 xmlns:xodm="http://www.corel.com/coreldraw/odm/2003">
 <g id="Layer_x0020_1">
  <metadata id="CorelCorpID_0Corel-Layer"/>
  <path fill="#FEFEFE" d="M120.11 312.97l-39.41 -89.74 9.34 -17.09 39.41 89.74 -9.34 17.09zm166.28 -131.8l81.19 54.91 1.22 19.44 -81.19 -54.91 -1.21 -19.44zm-10.88 -54.69l81.19 54.91 1.22 19.43 -81.19 -54.91 -1.22 -19.44zm-93.58 -26.63l10 18.05 -13.98 17.73 12.13 18.96 22.08 -4.94 10.59 17.08c-3.61,8.31 -9.4,10.92 -13.27,19.26l11.25 17.93 22.74 -4.22c17.66,23.09 79.86,125.43 99.73,156.96l-7.75 17.91 11.72 19.56c10.75,-2.02 19.2,-11.1 23.61,-3.3 4.83,8.54 18.95,22.58 12.76,28.26l-12.71 11.65 12.69 19.26c10.22,-0.78 18.91,-6.28 27.12,-4.66 6.32,2.98 10.45,10.71 18.63,14.66 61.5,-28.7 20.43,-66.06 2.42,-140 -3.63,-14.89 -5.67,-37.09 -10.43,-49.69 -11.81,1.94 -29.15,3.45 -29.94,-6.47 0.12,-8.13 16.75,-5.53 28.09,-8 2.2,-6.65 0.74,-35.06 -2.55,-41.94 -11.09,-1.73 -29.21,1.95 -27.41,-10.8 3.74,-11.4 17.82,-2.03 29.5,-5.83 3.04,-19.94 -2.38,-27.96 -11.62,-34.4 -12.27,-8.55 -42.17,-21.74 -57.01,-48.84 -28.54,-52.14 -3.93,-68.5 -16.4,-82.22 -13.55,-14.93 -58.86,-14.7 -89.25,1.68 -19.65,10.59 -56.1,50.28 -62.73,66.37zm-81.79 265.19l-39.41 -89.75 9.33 -17.09 39.41 89.74 -9.34 17.09zm64.97 72.43l1.16 -20.6 21.28 -7.54 -0.15 -22.51 -21.31 -7.6 0.15 -20.1c7.48,-5.1 13.78,-4.22 21.49,-9.22l0.04 -21.16 -21.49 -8.56c-2.63,-28.95 -0.68,-148.7 -0.68,-185.96l16.11 -11.02 0.52 -22.8c-10.17,-4.02 -22.16,-0.85 -21.74,-9.8 0.47,-9.8 -3.99,-29.21 4.28,-30.71l16.96 -3.08 -0.46 -23.06c-9.06,-4.78 -19.35,-4.77 -25.43,-10.52 -3.76,-5.89 -3.13,-14.63 -7.95,-22.34 -67.33,-8.52 -52.5,44.99 -76.7,117.15 -4.87,14.53 -14.98,34.4 -17.67,47.6 11.03,4.66 26.5,12.62 21.87,21.44 -4.44,6.81 -17.12,-4.25 -28.03,-8.21 -5.41,4.45 -19.32,29.26 -20.2,36.84 8.46,7.38 25.75,13.92 17.43,23.76 -9.24,7.65 -16.16,-7.79 -28.06,-10.79 -13.21,15.24 -12.89,24.93 -8.51,35.3 5.82,13.77 24.09,40.88 22.18,71.72 -3.66,59.33 -33.2,60.04 -29.97,78.3 3.5,19.86 41.96,43.82 76.4,46.17 22.27,1.51 74.27,-12.62 88.46,-22.7z"/>
 </g>
</svg>

 */