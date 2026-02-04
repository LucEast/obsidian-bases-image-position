import { App, PluginSettingTab, Setting } from 'obsidian';
import type BasesImagePositionPlugin from './main';
import { DEFAULT_SETTINGS } from './types';

export class BasesImagePositionSettingTab extends PluginSettingTab {
	plugin: BasesImagePositionPlugin;

	constructor(app: App, plugin: BasesImagePositionPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Image position property')
			.setDesc(`The frontmatter property for preset positions (default: "${DEFAULT_SETTINGS.imagePositionKey}")`)
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.imagePositionKey)
				.setValue(this.plugin.settings.imagePositionKey)
				.onChange(async (value) => {
					this.plugin.settings.imagePositionKey = value || DEFAULT_SETTINGS.imagePositionKey;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Horizontal offset property')
			.setDesc(`The frontmatter property for horizontal offset (default: "${DEFAULT_SETTINGS.imageOffsetXKey}")`)
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.imageOffsetXKey)
				.setValue(this.plugin.settings.imageOffsetXKey)
				.onChange(async (value) => {
					this.plugin.settings.imageOffsetXKey = value || DEFAULT_SETTINGS.imageOffsetXKey;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Vertical offset property')
			.setDesc(`The frontmatter property for vertical offset (default: "${DEFAULT_SETTINGS.imageOffsetYKey}")`)
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.imageOffsetYKey)
				.setValue(this.plugin.settings.imageOffsetYKey)
				.onChange(async (value) => {
					this.plugin.settings.imageOffsetYKey = value || DEFAULT_SETTINGS.imageOffsetYKey;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Debug')
			.setHeading();

		new Setting(containerEl)
			.setName('Debug mode')
			.setDesc('Enable debug logging to the console')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.debugMode)
				.onChange(async (value) => {
					this.plugin.settings.debugMode = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Usage')
			.setHeading();

		const usageDiv = containerEl.createDiv({ cls: 'setting-item-description' });
		usageDiv.createEl('p', { text: 'Add these properties to your note frontmatter:' });

		const presetExample = usageDiv.createEl('pre');
		presetExample.createEl('code', {
			text: `---\n${this.plugin.settings.imagePositionKey}: top\n---`
		});

		usageDiv.createEl('p', {
			text: 'Available presets: center, top, bottom, left, right, top left, top right, bottom left, bottom right'
		});

		usageDiv.createEl('p', { text: 'For precise control, use offset properties:' });

		const offsetExample = usageDiv.createEl('pre');
		offsetExample.createEl('code', {
			text: `---\n${this.plugin.settings.imageOffsetXKey}: 30%\n${this.plugin.settings.imageOffsetYKey}: 70%\n---`
		});

		usageDiv.createEl('p', {
			text: 'Note: offset properties take precedence over the position preset.'
		});
	}
}
