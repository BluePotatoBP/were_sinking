import { useEffect, useRef, useState } from "react";
import { Document, Page, Text, Rect, StyleSheet, Svg } from '@react-pdf/renderer';
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
	{ ssr: false }
);

interface InputData {
	[key: string]: string | number;
}

interface transferProps {
	data: InputData[];
}

const TransferGenerator = ({ data }: transferProps) => {
	const [isTextWidthComputed, setIsTextWidthComputed] = useState<boolean>(false);
	const textRef = useRef<Text>(null);
	const nameClubTextRef = useRef<Text>(null);
	const [textWidth, setTextWidth] = useState<number | undefined>(undefined);
	const [nameClubWidth, setNameClubWidth] = useState<number | undefined>(undefined);

	const renderTransfer = (rowData: InputData, index: number) => {
		const {
			"Asset Name": playerName,
			"Team Name": clubName,
			"ID LEFT INSIDE": idLeftInside,
			"ID LEFT OUTSIDE": idLeftOutside,
			"ID RIGHT INSIDE": idRightInside,
			"ID RIGHT OUTSIDE": idRightOutside
		} = rowData;

		const rectWidth: number = (textWidth && nameClubWidth) ? textWidth > nameClubWidth ? textWidth : nameClubWidth + 13 : 100;
		const idStyles = StyleSheet.create({
			text: {
				fontSize: "5mm"
			}
		});

		return (
			<Svg key={index} height="42mm">
				{/** Player Name / Club */}
				<Text x="2mm" y="6mm" fill="none" stroke="rgb(255, 0, 0)" strokeWidth="1" ref={nameClubTextRef} >{`${playerName} / ${clubName}`}</Text>
				{/** IDs */}
				<Text x="20mm" y="13mm" fill="none" stroke="rgb(255, 0, 0)" strokeWidth="1" ref={textRef} style={idStyles.text} >
					{`${idLeftInside ? idLeftInside : ''} ${idLeftOutside ? idLeftOutside : ''} ${idRightInside ? idRightInside : ''} ${idRightOutside ? idRightOutside : ''}`}
				</Text>
				<Text x="20mm" y="20mm" fill="none" stroke="rgb(255, 0, 0)" strokeWidth="1" ref={textRef} style={idStyles.text} >
					{`${idLeftInside ? idLeftInside : ''} ${idLeftOutside ? idLeftOutside : ''} ${idRightInside ? idRightInside : ''} ${idRightOutside ? idRightOutside : ''}`}
				</Text>
				<Text x="20mm" y="27mm" fill="none" stroke="rgb(255, 0, 0)" strokeWidth="1" ref={textRef} style={idStyles.text} >
					{`${idLeftInside ? idLeftInside : ''} ${idLeftOutside ? idLeftOutside : ''} ${idRightInside ? idRightInside : ''} ${idRightOutside ? idRightOutside : ''}`}
				</Text>
				<Text x="20mm" y="34mm" fill="none" stroke="rgb(255, 0, 0)" strokeWidth="1" ref={textRef} style={idStyles.text} >
					{`${idLeftInside ? idLeftInside : ''} ${idLeftOutside ? idLeftOutside : ''} ${idRightInside ? idRightInside : ''} ${idRightOutside ? idRightOutside : ''}`}
				</Text>
				{/** Rectangle */}
				<Rect x={0} y={0} width={rectWidth} height="38mm" fill="none" stroke="rgb(0, 255, 0)" strokeWidth="1" />
			</Svg>
		);
	};

	useEffect(() => {
		if (textRef.current instanceof SVGTextElement) {
			setTextWidth(textRef.current?.getComputedTextLength() + 150);
		}
		if (nameClubTextRef.current instanceof SVGTextElement) {
			setNameClubWidth(nameClubTextRef.current?.getComputedTextLength());
		}
		if (textWidth && nameClubWidth) {
			setIsTextWidthComputed(true);
		}
	}, [textRef, nameClubTextRef, isTextWidthComputed, renderTransfer]);

	const MyDocument = () => (
		<Document>
			<Page>
				{data.map((rowData, index) => renderTransfer(rowData, index))}
			</Page>
		</Document>
	);

	return (
		<div className="transfer-container flex flex-col p-8">
			<PDFViewer>
				<MyDocument />
			</PDFViewer>
			{/* {data.map((rowData, index) => renderTransfer(rowData, index))} */}
		</div>
	);
};


export default TransferGenerator;