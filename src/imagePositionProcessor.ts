import { App, TFile } from 'obsidian';
import { BasesImagePositionSettings, POSITION_PRESETS, ImagePositionPreset } from './types';

export class ImagePositionProcessor {
	private app: App;
	private settings: BasesImagePositionSettings;
	private observer: MutationObserver | null = null;
	/**
	 * What was last written to each cover: the position we asked for and the
	 * value the browser stored. Used only to skip redundant writes -- never to
	 * skip a card. Bases' cards view virtualizes: as rows scroll out of view,
	 * their card elements are detached and reused for the rows scrolling in, so
	 * one element shows several notes over its lifetime and has to be
	 * re-resolved every time its contents change.
	 */
	private appliedPositions: WeakMap<HTMLElement, { wanted: string; stored: string }> = new WeakMap();
	private pendingCards: Set<HTMLElement> = new Set();
	private frameId: number | null = null;

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
			console.debug(`[Bases Image Position] ${message}`, ...args);
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
		if (this.frameId !== null) {
			window.cancelAnimationFrame(this.frameId);
			this.frameId = null;
		}
		this.pendingCards.clear();
	}

	private setupMutationObserver(): void {
		this.observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === 'attributes') {
					// Bases swapping a recycled cover's image in place
					const target = mutation.target;
					if (target instanceof HTMLElement && target.classList.contains('bases-cards-cover')) {
						this.queueCardContaining(target);
					}
					continue;
				}
				// A card's contents being rewritten (e.g. its title, when the card is reused)
				this.queueCardContaining(mutation.target);
				mutation.addedNodes.forEach((node) => {
					if (node instanceof HTMLElement) {
						this.processElement(node);
					}
				});
			}
		});

		this.observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['style']
		});

		this.log('MutationObserver started');
	}

	private processElement(element: HTMLElement): void {
		// Check if the element itself is a card item
		if (element.classList.contains('bases-cards-item')) {
			this.queueCard(element);
		}

		// Check for card items within the element
		const cardItems = element.querySelectorAll('.bases-cards-item');
		cardItems.forEach((card) => {
			if (card instanceof HTMLElement) {
				this.queueCard(card);
			}
		});
	}

	private queueCardContaining(node: Node): void {
		const element = node instanceof Element ? node : node.parentElement;
		const card = element?.closest('.bases-cards-item');
		if (card instanceof HTMLElement) {
			this.queueCard(card);
		}
	}

	/**
	 * Cards are processed on the next animation frame, once Bases has finished
	 * filling a recycled card, and each card at most once per frame.
	 */
	private queueCard(card: HTMLElement): void {
		this.pendingCards.add(card);
		if (this.frameId !== null) {
			return;
		}
		this.frameId = window.requestAnimationFrame(() => {
			this.frameId = null;
			const cards = Array.from(this.pendingCards);
			this.pendingCards.clear();
			for (const pending of cards) {
				if (pending.isConnected) {
					this.processCard(pending);
				}
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
		this.appliedPositions = new WeakMap();
		this.processAllCards();
	}

	private processCard(card: HTMLElement): void {
		const coverElement = card.querySelector('.bases-cards-cover');
		if (!(coverElement instanceof HTMLElement)) {
			return;
		}

		// Get the file path from the card
		const filePath = this.getFilePathFromCard(card);
		if (!filePath) {
			this.log('Could not determine file path for card');
			this.applyPosition(coverElement, null);
			return;
		}

		// Get the file and its metadata
		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (!(file instanceof TFile)) {
			this.log('File not found:', filePath);
			this.applyPosition(coverElement, null);
			return;
		}

		const cache = this.app.metadataCache.getFileCache(file);
		const position = cache?.frontmatter ? this.calculatePosition(cache.frontmatter) : null;

		// A null position still has to be applied: a reused card element would
		// otherwise keep the previous note's position.
		if (this.applyPosition(coverElement, position)) {
			this.log(`Applied position "${position ?? '(default)'}" to:`, filePath);
		}
	}

	/**
	 * Sets the cover's position, or clears it for null. Returns whether it
	 * wrote anything. A write fires a style mutation that queues the card
	 * again, so a cover that still holds what was last written for the same
	 * request is left alone. The browser's stored form is compared rather than
	 * the request (it may normalize, e.g. "right" to "100% 50%").
	 */
	private applyPosition(coverElement: HTMLElement, position: string | null): boolean {
		const wanted = position ?? '';
		const last = this.appliedPositions.get(coverElement);
		if (last && last.wanted === wanted && last.stored === coverElement.style.backgroundPosition) {
			return false;
		}
		if (!last && wanted === '' && coverElement.style.backgroundPosition === '') {
			return false;
		}
		coverElement.style.backgroundPosition = wanted;
		this.appliedPositions.set(coverElement, { wanted, stored: coverElement.style.backgroundPosition });
		return true;
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
					const frontmatterTitle = fileCache?.frontmatter?.title as string | undefined;
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
		if (value === undefined || value === null || (typeof value !== 'string' && typeof value !== 'number')) {
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
					this.processCard(card);
				}
			}
		});
	}
}
