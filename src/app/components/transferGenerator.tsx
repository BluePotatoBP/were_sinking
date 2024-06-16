'use client';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
/* import * as opentype from 'opentype.js'; */

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
	const [pageSizes, setPageSizes] = useState<number[]>([]);

	useEffect(() => {
		// Function to measure text width
		const measureText = (text: string, fontSize: number) => {
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			if (context) {
				context.font = `${fontSize}px Arial`; // Adjust font as needed
				return context.measureText(text).width;
			}
			return 0;
		};

		// Calculate page sizes
		const sizes = data.map((rowData) => {
			const {
				"Asset Name": playerName,
				"Team Name": clubName,
				"ID LEFT INSIDE": idLeftInside,
				"ID LEFT OUTSIDE": idLeftOutside,
				"ID RIGHT INSIDE": idRightInside,
				"ID RIGHT OUTSIDE": idRightOutside
			}: any = rowData;

			const text = `${playerName} / ${clubName}`;
			const idText = `${idLeftInside || ''} ${idLeftOutside || ''} ${idRightInside || ''} ${idRightOutside || ''}`;

			const textWidth = measureText(text, 19.85);
			const idWidth = measureText(idText, 19.85);

			return Math.max(textWidth, idWidth) * 1.2 * (72 / 96) + 150;
		});

		setPageSizes(sizes);
	}, [data]);

	const renderTransfer = (rowData: InputData, index: number) => {
		const {
			"Asset Name": playerName,
			"Team Name": clubName,
			"ID LEFT INSIDE": idLeftInside,
			"ID LEFT OUTSIDE": idLeftOutside,
			"ID RIGHT INSIDE": idRightInside,
			"ID RIGHT OUTSIDE": idRightOutside
		}: any = rowData;

		const styles = StyleSheet.create({
			text: {
				'color': 'red',
				'fontSize': '7mm',
				'fontFamily': 'Helvetica'
			}
		});

		return (
			<Page size={[pageSizes[index] + 10]} wrap={false} key={index} style={{ 'display': 'flex', 'flexDirection': 'row', 'border': '0.01mm solid rgb(0, 255, 0)' }}>

				<View style={{ 'display': 'flex', 'flexDirection': 'column', 'gap': "3.5mm", 'margin': '2mm', 'width': '100%' }}>
					{/** Player Name / Club */}
					<Text style={styles.text} >{`${playerName} / ${clubName}`}</Text>
					{/** IDs */}
					<View style={{ 'display': 'flex', 'alignItems': 'center', 'gap': "3.5mm", }}>
						<Text style={styles.text} >
							{`${idLeftInside ? idLeftInside : ''} ${idLeftOutside ? idLeftOutside : ''} ${idRightInside ? idRightInside : ''} ${idRightOutside ? idRightOutside : ''}`}
						</Text>
						<Text style={styles.text} >
							{`${idLeftInside ? idLeftInside : ''} ${idLeftOutside ? idLeftOutside : ''} ${idRightInside ? idRightInside : ''} ${idRightOutside ? idRightOutside : ''}`}
						</Text>
						<Text style={styles.text} >
							{`${idLeftInside ? idLeftInside : ''} ${idLeftOutside ? idLeftOutside : ''} ${idRightInside ? idRightInside : ''} ${idRightOutside ? idRightOutside : ''}`}
						</Text>
						<Text style={styles.text} >
							{`${idLeftInside ? idLeftInside : ''} ${idLeftOutside ? idLeftOutside : ''} ${idRightInside ? idRightInside : ''} ${idRightOutside ? idRightOutside : ''}`}
						</Text>
					</View>
				</View>

			</Page>
		);
	};

	return (
		<div className="transfer-container flex flex-col min-w-[30vw] w-full h-full">
			<PDFViewer showToolbar={true} height="100%" width="100%">
				<Document>
					{data.map((rowData, index) => renderTransfer(rowData, index))}
				</Document>
			</PDFViewer>
		</div>
	);
};


export default TransferGenerator;