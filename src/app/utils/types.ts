/**
 * Global format for excel imported data.
 */
export type InputData = {
	[key: string]: string | number;
};

/**
 * Standard types for editable colors.
 */
export type EditableColors = {
	counterColor: string,
	glyphColor: string,
	perforationColor: string;
};