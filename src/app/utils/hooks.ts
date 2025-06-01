import { useCallback, useRef, useState, useEffect } from "react";
import opentype from 'opentype.js';
import { FontRefs } from "@/app/utils/types";

export const useDebounce = <T extends (...args: any[]) => any>(callback: T, delay: number) => {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
	return useCallback((...args: Parameters<T>) => {
	  if (timeoutRef.current) {
		clearTimeout(timeoutRef.current);
	  }
  
	  timeoutRef.current = setTimeout(() => {
		callback(...args);
		timeoutRef.current = null;
	  }, delay);
	}, [callback, delay]);
  };

export function useFontLoader() {
	const [fontRefs, setFontRefs] = useState<FontRefs | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		async function loadFonts() {
			try {
				const [condensed, nike, puma] = await Promise.all([
					opentype.load('fonts/condensed.ttf'),
					opentype.load('fonts/nike.ttf'),
					opentype.load('fonts/puma.ttf'),
				]);

				setFontRefs({
					condensedFontRef: condensed,
					nikeFontRef: nike,
					pumaFontRef: puma,
				});
			} catch (err) {
				setError(err instanceof Error ? err : new Error('Failed to load fonts'));
			} finally {
				setIsLoading(false);
			}
		}

		loadFonts();
	}, []);

	return { fontRefs, isLoading, error };
}

export function getAppVersion() {
	const packageJson = require('../../../package.json');
	return packageJson.version || '0.0.0';
}