import { App, TFile } from 'obsidian';
import { BasesImagePositionSettings, POSITION_PRESETS, ImagePositionPreset } from './types';

export class ImagePositionProcessor {
	private app: App;
	private settings: BasesImagePositionSettings;
	private observer: MutationObserver | null = null;
	private processedCards: WeakSet<HTMLElement> = new WeakSet();

	constructor(app: App, settings: BasesImagePositionSettings) {
		this.app = app;
		this.settings = settings;
	}

	updateSettings(settings: BasesImagePositionSettings): void {
		this.settings = settings;
		this.reprocessAllCards();
	}

	private log(message: string, ...args: unknown[]): void {
		if (this.settings.debugMode) {
			console.log(`[Bases Image Position] ${message}`, ...args);
		}
	}

	start(): void {
		this.log('Starting ImagePositionProcessor');
		this.setupMutationObserver();
		this.processAllCards();
	}

	stop(): void {
		this.log('Stopping ImagePositionProcessor');
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}
	}

	private setupMutationObserver(): void {
		this.observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === 'childList') {
					mutation.addedNodes.forEach((node) => {
						if (node instanceof HTMLElement) {
							this.processElement(node);
						}
					});
				}
			}
		});

		this.observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		this.log('MutationObserver started');
	}

	private processElement(element: HTMLElement): void {
		// Check if the element itself is a card item
		if (element.classList.contains('bases-cards-item')) {
			this.processCard(element);
		}

		// Check for card items within the element
		const cardItems = element.querySelectorAll('.bases-cards-item');
		cardItems.forEach((card) => {
			if (card instanceof HTMLElement) {
				this.processCard(card);
			}
		});
	}

	processAllCards(): void {
		this.log('Processing all cards');
		const cardItems = document.querySelectorAll('.bases-cards-item');
		cardItems.forEach((card) => {
			if (card instanceof HTMLElement) {
				this.processCard(card);
			}
		});
	}

	reprocessAllCards(): void {
		this.log('Reprocessing all cards (clearing cache)');
		this.processedCards = new WeakSet();
		this.processAllCards();
	}

	private processCard(card: HTMLElement): void {
		// Skip if already processed
		if (this.processedCards.has(card)) {
			return;
		}

		const coverElement = card.querySelector('.bases-cards-cover');
		if (!(coverElement instanceof HTMLElement)) {
			return;
		}

		// Get the file path from the card
		const filePath = this.getFilePathFromCard(card);
		if (!filePath) {
			this.log('Could not determine file path for card');
			return;
		}

		// Get the file and its metadata
		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (!(file instanceof TFile)) {
			this.log('File not found:', filePath);
			return;
		}

		const cache = this.app.metadataCache.getFileCache(file);
		if (!cache?.frontmatter) {
			this.log('No frontmatter for:', filePath);
			return;
		}

		const frontmatter = cache.frontmatter;
		const position = this.calculatePosition(frontmatter);

		if (position) {
			coverElement.style.backgroundPosition = position;
			this.log(`Applied position "${position}" to:`, filePath);
		}

		// Mark as processed
		this.processedCards.add(card);
	}

	private getFilePathFromCard(card: HTMLElement): string | null {
		// Method 1: Check for data-path attribute
		const dataPath = card.getAttribute('data-path');
		if (dataPath) {
			return dataPath;
		}

		// Method 2: Read file.path directly from the displayed card property
		const filePathProp = card.querySelector('[data-property="file.path"] .bases-cards-line');
		if (filePathProp?.textContent?.trim()) {
			return filePathProp.textContent.trim();
		}

		// Method 3: Check for internal link within the card
		const internalLink = card.querySelector('a.internal-link');
		if (internalLink) {
			const href = internalLink.getAttribute('href');
			if (href) {
				const file = this.app.metadataCache.getFirstLinkpathDest(href, '');
				if (file) {
					return file.path;
				}
			}
		}

		// Method 4: Check for data-href on any element
		const elemWithHref = card.querySelector('[data-href]');
		if (elemWithHref) {
			const href = elemWithHref.getAttribute('data-href');
			if (href) {
				const file = this.app.metadataCache.getFirstLinkpathDest(href, '');
				if (file) {
					return file.path;
				}
			}
		}

		// Method 5: Match via the card title against file basenames / frontmatter titles
		const titleElement = card.querySelector('.bases-cards-property.mod-title .bases-cards-line');
		if (titleElement) {
			const title = titleElement.textContent?.trim();
			if (title) {
				const files = this.app.vault.getMarkdownFiles();
				for (const file of files) {
					const fileCache = this.app.metadataCache.getFileCache(file);
					const frontmatterTitle = fileCache?.frontmatter?.title;
					if (frontmatterTitle === title || file.basename === title) {
						return file.path;
					}
				}
			}
		}

		return null;
	}

	private calculatePosition(frontmatter: Record<string, unknown>): string | null {
		const { imagePositionKey, imageOffsetXKey, imageOffsetYKey } = this.settings;

		// Priority: Offset properties take precedence
		const offsetX = frontmatter[imageOffsetXKey];
		const offsetY = frontmatter[imageOffsetYKey];

		if (offsetX !== undefined || offsetY !== undefined) {
			const x = this.normalizeOffsetValue(offsetX, '50%');
			const y = this.normalizeOffsetValue(offsetY, '50%');
			return `${x} ${y}`;
		}

		// Fallback to preset position
		const positionValue = frontmatter[imagePositionKey];
		if (typeof positionValue === 'string') {
			const normalizedPosition = positionValue.toLowerCase().trim() as ImagePositionPreset;
			if (normalizedPosition in POSITION_PRESETS) {
				return POSITION_PRESETS[normalizedPosition];
			}
			this.log(`Unknown position preset: "${positionValue}"`);
		}

		return null;
	}

	private normalizeOffsetValue(value: unknown, defaultValue: string): string {
		if (value === undefined || value === null) {
			return defaultValue;
		}

		const strValue = String(value).trim();

		// If it's already a valid CSS value (has unit), return as-is
		if (/^-?\d+(\.\d+)?(px|%|em|rem|vh|vw)$/.test(strValue)) {
			return strValue;
		}

		// If it's just a number, assume pixels
		if (/^-?\d+(\.\d+)?$/.test(strValue)) {
			return `${strValue}px`;
		}

		// Return the value as-is (might be a CSS keyword like 'center')
		return strValue;
	}

	handleMetadataChange(file: TFile): void {
		this.log('Metadata changed for:', file.path);

		// Find and reprocess cards that reference this file
		const cardItems = document.querySelectorAll('.bases-cards-item');
		cardItems.forEach((card) => {
			if (card instanceof HTMLElement) {
				const cardPath = this.getFilePathFromCard(card);
				if (cardPath === file.path) {
					// Remove from processed set to allow reprocessing
					this.processedCards.delete(card);
					this.processCard(card);
				}
			}
		});
	}
}
