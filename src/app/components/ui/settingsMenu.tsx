import React, { useEffect, useRef } from 'react';
import { useSettings } from '@/app/utils/settingsProvider';
import { type Font } from '@/app/utils/types';

interface SettingsMenuProps {
	isOpen: boolean;
	onClose: () => void;
	activeCategory?: 'TRANSFER' | 'MASTERFILE' | null;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose, activeCategory }) => {
	const { settings, setSettings } = useSettings();
	const transferRef = useRef<HTMLDetailsElement>(null);
	const masterfileRef = useRef<HTMLDetailsElement>(null);

	useEffect(() => {
		if (isOpen && activeCategory) {
			const targetRef = activeCategory === 'TRANSFER' ? transferRef : masterfileRef;
			if (targetRef.current) {
				targetRef.current.open = true;
				targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}
	}, [isOpen, activeCategory]);

	if (!isOpen) return null;

	const handleFontSizeChange = (fontType: Font, value: number) => {
		setSettings(prev => ({
			...prev,
			transfer: {
				...prev.transfer,
				fontSize: {
					...prev.transfer.fontSize,
					[fontType]: value
				}
			}
		}));
	};

	const handleColorChange = (colorType: keyof typeof settings.transfer.colors, value: string) => {
		setSettings(prev => ({
			...prev,
			transfer: {
				...prev.transfer,
				colors: {
					...prev.transfer.colors,
					[colorType]: value
				}
			}
		}));
	};

	const handleMasterfileSettingChange = (setting: keyof typeof settings.masterfile, value: boolean) => {
		setSettings(prev => ({
			...prev,
			masterfile: {
				...prev.masterfile,
				[setting]: value
			}
		}));
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
			<div className="bg-slate-500 dark:bg-gray-800 rounded-2xl w-[30vw] h-[60vh] overflow-y-auto flex flex-col justify-between gap-4 pb-4">
				<div className="options-subcontainer flex flex-col p-4 gap-4 overflow-auto">
					<h2 className="text-2xl font-bold text-slate-300 dark:text-slate-400 text-center">Settings</h2>
					{/* TRANSFERS */}
					<details className='text-slate-600 dark:text-slate-200 bg-slate-300 dark:bg-slate-700 rounded-lg' ref={transferRef}>
						<summary className="cursor-pointer font-semibold hover:text-slate-400 text-center p-4">Transfer Settings</summary>
						<div className="flex flex-col gap-2 p-4">
							<details className="flex flex-col gap-4">
								<summary className="cursor-pointer hover:text-slate-400 mb-4">Font Sizes</summary>
								<div className="flex flex-col justify-between gap-2">
									<div className="flex flex-col gap-2">
										<label className="block mb-1 text-slate-700 dark:text-slate-100 font-semibold">Eurostile Font Size</label>
										<input type="number" value={settings.transfer.fontSize.nike} onChange={(e) => handleFontSizeChange('nike', Number(e.target.value))} className="p-2 border rounded text-black" />
									</div>
									<div className="flex flex-col gap-2">
										<label className="block mb-1 text-slate-700 dark:text-slate-100 font-semibold">Puma Font Size</label>
										<input type="number" value={settings.transfer.fontSize.puma} onChange={(e) => handleFontSizeChange('puma', Number(e.target.value))} className="p-2 border rounded text-black" />
									</div>
									<div className="flex flex-col gap-2">
										<label className="block mb-1 text-slate-700 dark:text-slate-100 font-semibold">Impact Font Size</label>
										<input type="number" value={settings.transfer.fontSize.impact} onChange={(e) => handleFontSizeChange('impact', Number(e.target.value))} className="p-2 border rounded text-black" />
									</div>
								</div>
							</details>
							<details className="flex flex-col gap-2">
								<summary className="cursor-pointer hover:text-slate-400">Colors</summary>
								<div className="pl-4 mt-2">
									{Object.entries(settings.transfer.colors).map(([colorType, colorValue]) => (
										<div key={colorType} className="flex flex-col gap-2">
											<label className="block mb-1 capitalize font-semibold">{colorType.replace(/([A-Z])/g, ' $1').trim()}</label>
											<input type="color" value={colorValue} onChange={(e) => handleColorChange(colorType as keyof typeof settings.transfer.colors, e.target.value)} className="w-full p-1 border rounded cursor-pointer" />
										</div>
									))}
								</div>
							</details>
						</div>
					</details>
					{/* MASTERFILE */}
					<details className='text-slate-600 dark:text-slate-200 bg-slate-300 dark:bg-slate-700 rounded-lg' ref={masterfileRef}>
						<summary className="cursor-pointer font-semibold hover:text-slate-400 text-center p-4">Masterfile Settings</summary>
						<div className="flex flex-col m-4 gap-4">
							{Object.entries(settings.masterfile).map(([setting, value]) => (
								<div key={setting} className="flex justify-between">
									<label htmlFor={setting} className="capitalize">{setting.replace(/([A-Z])/g, ' $1').trim()}</label>
									<input type="checkbox" id={setting} disabled checked={value} onChange={(e) => handleMasterfileSettingChange(setting as keyof typeof settings.masterfile, e.target.checked)} className="cursor-not-allowed" />
								</div>
							))}
						</div>
					</details>
				</div>
				{/* CLOSE */}
				<button onClick={onClose} className="bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold px-6 py-4 rounded hover:bg-slate-400 self-center leading-none" >Close</button>
			</div>
		</div>
	);
};

export default SettingsMenu;