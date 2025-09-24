export type LocalizationType = 'all' | 'en';

export const createLocalizedValues = (text: string, localization: LocalizationType) => {
	const values: { [key: string]: string } = {};
	values[localization] = text;
	return values;
}; 