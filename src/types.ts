export interface BasesImagePositionSettings {
	imagePositionKey: string;
	imageOffsetXKey: string;
	imageOffsetYKey: string;
	debugMode: boolean;
}

export const DEFAULT_SETTINGS: BasesImagePositionSettings = {
	imagePositionKey: 'image-position',
	imageOffsetXKey: 'image-offset-x',
	imageOffsetYKey: 'image-offset-y',
	debugMode: false
};

export type ImagePositionPreset =
	| 'center'
	| 'top'
	| 'bottom'
	| 'left'
	| 'right'
	| 'top left'
	| 'top right'
	| 'bottom left'
	| 'bottom right';

export const POSITION_PRESETS: Record<ImagePositionPreset, string> = {
	'center': '50% 50%',
	'top': '50% 0%',
	'bottom': '50% 100%',
	'left': '0% 50%',
	'right': '100% 50%',
	'top left': '0% 0%',
	'top right': '100% 0%',
	'bottom left': '0% 100%',
	'bottom right': '100% 100%'
};
