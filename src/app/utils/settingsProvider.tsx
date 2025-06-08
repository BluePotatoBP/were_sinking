'use client';

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { EditableColors } from '@/app/utils/types';
import SettingsMenu from "@/app/components/ui/settingsMenu";

interface fontSize {
	nike: number;
	puma: number;
	impact: number;
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

type Category = 'TRANSFER' | 'MASTERFILE';

export interface SettingsContext {
	settings: Settings;
	setSettings: React.Dispatch<React.SetStateAction<Settings>>;
	isMenuOpen: boolean;
	toggleMenu: (category?: Category) => void;
}

const SettingsContext = createContext<SettingsContext | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode; }> = ({ children }) => {
	const [settings, setSettings] = useState<Settings>({
		transfer: {
			fontSize: {
				nike: 26,
				puma: 32,
				impact: 24
			},
			colors: {
				glyphColor: "#ff0000",
				counterColor: "#0000ff",
				perforationColor: "#008000"
			}
		},
		masterfile: {
			pruneEmpty: true,
			separateColor: true,
			separateCountry: true
		}
	});
	const [isMenuOpen, setMenuOpen] = useState(false);
	const [activeCategory, setActiveCategory] = useState<Category | null>(null);

	const updateSettings = (value: React.SetStateAction<Settings>) => {
		setSettings(value);
	};

	const toggleMenu = useCallback((category?: Category) => {
		setMenuOpen(!isMenuOpen);
		setActiveCategory(category || null);
	}, [isMenuOpen])

	return (
		<SettingsContext.Provider value={{ settings, setSettings: updateSettings, isMenuOpen, toggleMenu }}>
			{children}
			<SettingsMenu isOpen={isMenuOpen} onClose={() => toggleMenu()} activeCategory={activeCategory} />
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

export const useSettingsMenuToggle = () => {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error("useSettingsMenuToggle must be used inside the SettingsProvider wrapper.");
	}

	return context;
};