'use client';

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { EditableColors } from '@/app/utils/types';
import SettingsMenu from "@/app/components/ui/settingsMenu";
import { useDebounce } from "@/app/utils/hooks";

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
	isMenuOpen: boolean;
	toggleMenu: (category?: 'TRANSFER' | 'MASTERFILE') => void;
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
	const [activeCategory, setActiveCategory] = useState<'TRANSFER' | 'MASTERFILE' | null>(null);
	const debouncedSetSettings = useDebounce(setSettings, 300);
	const toggleMenu = useCallback((category?: 'TRANSFER' | 'MASTERFILE') => {
		setMenuOpen(!isMenuOpen);
		setActiveCategory(category || null);
	}, [isMenuOpen])

	return (
		<SettingsContext.Provider value={{ settings, setSettings: debouncedSetSettings, isMenuOpen, toggleMenu }}>
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