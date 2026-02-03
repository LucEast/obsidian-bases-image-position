import { Plugin, TFile } from 'obsidian';
import { BasesImagePositionSettings, DEFAULT_SETTINGS } from './types';
import { BasesImagePositionSettingTab } from './settings';
import { ImagePositionProcessor } from './imagePositionProcessor';

export default class BasesImagePositionPlugin extends Plugin {
	settings: BasesImagePositionSettings;
	private processor: ImagePositionProcessor;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.processor = new ImagePositionProcessor(this.app, this.settings);

		// Add settings tab
		this.addSettingTab(new BasesImagePositionSettingTab(this.app, this));

		// Wait for layout to be ready before starting processor
		this.app.workspace.onLayoutReady(() => {
			this.processor.start();
		});

		// Register event handlers
		this.registerEvent(
			this.app.metadataCache.on('changed', (file: TFile) => {
				this.processor.handleMetadataChange(file);
			})
		);

		this.registerEvent(
			this.app.workspace.on('layout-change', () => {
				// Reprocess cards when layout changes (e.g., switching views)
				this.processor.processAllCards();
			})
		);

		// Also handle active leaf changes for when bases views are opened
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				// Small delay to allow DOM to update
				setTimeout(() => {
					this.processor.processAllCards();
				}, 100);
			})
		);

		if (this.settings.debugMode) {
			console.log('[Bases Image Position] Plugin loaded');
		}
	}

	onunload(): void {
		this.processor?.stop();

		if (this.settings.debugMode) {
			console.log('[Bases Image Position] Plugin unloaded');
		}
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.processor?.updateSettings(this.settings);
	}
}
