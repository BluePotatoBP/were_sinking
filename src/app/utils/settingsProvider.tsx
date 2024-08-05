'use client';

import { createContext, ReactNode, useContext, useState } from "react";
import { EditableColors } from '@/app/utils/types';

interface fontSize {
	nike: number;
	puma: number;
}

interface transferSettings {
	fontSize: fontSize;
	colors: EditableColors;
}

interface masterfileSettings {
	pruneEmpty: boolean;
	separateColor: boolean;
	separateCountry: boolean;
}

interface Settings {
	transfer: transferSettings;
	masterfile: masterfileSettings;
}

export interface SettingsContext {
	settings: Settings;
	setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}
const SettingsContext = createContext<SettingsContext | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode; }> = ({ children }) => {
	const [settings, setSettings] = useState<Settings>({
		transfer: {
			fontSize: {
				nike: 26,
				puma: 32
			},
			colors: {
				glyphColor: "#test",
				counterColor: "#test",
				perforationColor: "test"
			}
		},
		masterfile: {
			pruneEmpty: true,
			separateColor: true,
			separateCountry: true
		}
	});

	return (
		<SettingsContext.Provider value={{ settings, setSettings }}>
			{children}
		</SettingsContext.Provider>
	);
};

export const useSettings = (): SettingsContext => {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error("useSettings must be used inside the SettingsProvider wrapper.");
	}
	return context;
};