// import { ItemType, SETTINGS, SYSTEM_NAME } from "@data"
// import {
// 	DnD,
// 	ErrorGURPS,
// 	LocalizeGURPS,
// 	applyBanding,
// 	createHTMLElement,
// 	fontAwesomeIcon,
// 	htmlQuery,
// 	htmlQueryAll,
// 	objectHasKey,
// 	setHasElement,
// } from "@util"
// // import Tagify from "@yaireo/tagify"
// import * as R from "remeda"
// import { BrowserTabs, PackInfo, SourceInfo, TabData, TabName } from "./data.ts"
// import {
// 	BrowserFilter,
// 	EffectFilters,
// 	EquipmentFilters,
// 	EquipmentModifierFilters,
// 	NoteFilters,
// 	RenderResultListOptions,
// 	SkillFilters,
// 	SpellFilters,
// 	TraitFilters,
// 	TraitModifierFilters,
// } from "./tabs/data.ts"
// import * as browserTabs from "./tabs/index.ts"
// import { PackLoader } from "./loader.ts"
// import { ItemGURPS2 } from "@module/document/item.ts"
// import { UserGURPS } from "@module/document/user.ts"
//
// class CompendiumBrowser extends Application {
// 	settings: CompendiumBrowserSettings
// 	dataTabsList = [
// 		TabName.Trait,
// 		TabName.TraitModifier,
// 		TabName.Skill,
// 		TabName.Spell,
// 		TabName.Equipment,
// 		TabName.EquipmentModifier,
// 		TabName.Note,
// 		TabName.Effect,
// 	] as const
//
// 	navigationTab: Tabs
// 	tabs: BrowserTabs
//
// 	packLoader = new PackLoader()
// 	declare activeTab: TabName
//
// 	constructor(options = {}) {
// 		super(options)
//
// 		this.settings = game.settings.get(SYSTEM_NAME, SETTINGS.COMPENDIUM_BROWSER_PACKS)
// 		this.navigationTab = this.hookTab()
// 		this.tabs = {
// 			[TabName.Trait]: new browserTabs.Trait(this),
// 			[TabName.TraitModifier]: new browserTabs.TraitModifier(this),
// 			[TabName.Skill]: new browserTabs.Skill(this),
// 			[TabName.Spell]: new browserTabs.Spell(this),
// 			[TabName.Equipment]: new browserTabs.Equipment(this),
// 			[TabName.EquipmentModifier]: new browserTabs.EquipmentModifier(this),
// 			[TabName.Note]: new browserTabs.Note(this),
// 			[TabName.Effect]: new browserTabs.Effect(this),
// 		}
//
// 		this.initCompendiumList()
// 	}
//
// 	override get title(): string {
// 		return LocalizeGURPS.translations.gurps.compendium_browser.title
// 	}
//
// 	static override get defaultOptions(): ApplicationOptions {
// 		return {
// 			...super.defaultOptions,
// 			id: "compendium-browser",
// 			classes: ["gurps"],
// 			template: `systems/${SYSTEM_NAME}/templates/compendium-browser/compendium-browser.hbs`,
// 			width: 800,
// 			height: 700,
// 			resizable: true,
// 			dragDrop: [{ dragSelector: "ul.items > li[data-item-id]" }],
// 			tabs: [
// 				{
// 					navSelector: "nav",
// 					contentSelector: "section.content",
// 					initial: "landing-page",
// 				},
// 			],
// 			scrollY: [".items"],
// 		}
// 	}
//
// 	/** Reset initial filtering */
// 	override async close(options?: { force?: boolean }): Promise<void> {
// 		for (const tab of Object.values(this.tabs)) {
// 			tab.filterData.search.text = ""
// 		}
// 		await super.close(options)
// 	}
//
// 	hookTab(): Tabs {
// 		const navigationTab = this._tabs[0]
// 		const tabCallback = navigationTab.callback
// 		navigationTab.callback = async (event: JQuery.TriggeredEvent | null, tabs: Tabs, active: TabName) => {
// 			tabCallback?.(event, tabs, active)
// 			await this.loadTab(active)
// 		}
// 		return navigationTab
// 	}
//
// 	initCompendiumList(): void {
// 		const settings: Omit<TabData<Record<string, PackInfo | undefined>>, TabName.Settings> = {
// 			[TabName.Trait]: {},
// 			[TabName.TraitModifier]: {},
// 			[TabName.Skill]: {},
// 			[TabName.Spell]: {},
// 			[TabName.Equipment]: {},
// 			[TabName.EquipmentModifier]: {},
// 			[TabName.Note]: {},
// 			[TabName.Effect]: {},
// 		}
//
// 		// Set packs to load by default
// 		const loadDefault: Record<string, boolean | undefined> = {}
//
// 		const browsableTypes = new Set([
// 			ItemType.Trait,
// 			ItemType.TraitModifier,
// 			ItemType.Skill,
// 			ItemType.Spell,
// 			ItemType.Equipment,
// 			ItemType.EquipmentModifier,
// 			ItemType.Note,
// 			ItemType.Effect,
// 		] as const)
// 		type BrowsableType = SetElement<typeof browsableTypes>
// 		const typeToTab = new Map<ItemType, Exclude<TabName, TabName.Settings>>([
// 			[ItemType.Trait, TabName.Trait],
// 			[ItemType.TraitModifier, TabName.TraitModifier],
// 			[ItemType.Skill, TabName.Skill],
// 			[ItemType.Spell, TabName.Spell],
// 			[ItemType.Equipment, TabName.Equipment],
// 			[ItemType.EquipmentModifier, TabName.EquipmentModifier],
// 			[ItemType.Note, TabName.Note],
// 			[ItemType.Effect, TabName.Effect],
// 		])
//
// 		for (const pack of game.packs) {
// 			const tabNames = R.unique(
// 				R.unique(pack.index.map(entry => entry.type))
// 					.filter((t): t is BrowsableType => setHasElement(browsableTypes, t))
// 					.flatMap(t => typeToTab.get(t) ?? []),
// 			)
//
// 			for (const tabName of tabNames) {
// 				const load =
// 					this.settings[tabName]?.[pack.collection]?.load ??
// 					loadDefault[tabName] ??
// 					!!loadDefault[pack.collection]
// 				settings[tabName]![pack.collection] = {
// 					load,
// 					name: pack.metadata.label,
// 					package: pack.metadata.packageName,
// 				}
// 			}
// 		}
//
// 		for (const tab of this.dataTabsList) {
// 			settings[tab] = Object.fromEntries(
// 				Object.entries(settings[tab]!).sort(([_collectionA, dataA], [_collectionB, dataB]) => {
// 					return (dataA?.name ?? "") > (dataB?.name ?? "") ? 1 : -1
// 				}),
// 			)
// 		}
//
// 		this.settings = settings
// 	}
//
// 	openTab(name: TabName.Trait, filter?: TraitFilters): Promise<void>
// 	openTab(name: TabName.TraitModifier, filter?: TraitModifierFilters): Promise<void>
// 	openTab(name: TabName.Skill, filter?: SkillFilters): Promise<void>
// 	openTab(name: TabName.Spell, filter?: SpellFilters): Promise<void>
// 	openTab(name: TabName.Equipment, filter?: EquipmentFilters): Promise<void>
// 	openTab(name: TabName.EquipmentModifier, filter?: EquipmentModifierFilters): Promise<void>
// 	openTab(name: TabName.Note, filter?: NoteFilters): Promise<void>
// 	openTab(name: TabName.Effect, filter?: EffectFilters): Promise<void>
// 	async openTab(tabName: TabName, filter?: BrowserFilter): Promise<void> {
// 		this.activeTab = tabName
// 		if (tabName !== TabName.Settings && filter) {
// 			return this.tabs[tabName].open(filter)
// 		}
// 		return this.loadTab(tabName)
// 	}
//
// 	async loadTab(tabName: TabName): Promise<void> {
// 		this.activeTab = tabName
// 		// Settings tab
// 		if (tabName === TabName.Settings) {
// 			await this.packLoader.updateSources(this.loadedPacksAll())
// 			this.render(true)
// 			return
// 		}
//
// 		if (!this.dataTabsList.includes(tabName)) {
// 			throw ErrorGURPS(`Unknown tab "${tabName}"`)
// 		}
//
// 		const currentTab = this.tabs[tabName]
//
// 		// Initialize Tab if it is not already initialzed
// 		if (!currentTab.isInitialized) {
// 			await currentTab.init()
// 		}
//
// 		this.render(true, { focus: true })
// 	}
//
// 	loadedPacks(tab: TabName): string[] {
// 		if (tab === TabName.Settings) return []
// 		return Object.entries(this.settings[tab] ?? []).flatMap(([collection, info]) => {
// 			return info?.load ? [collection] : []
// 		})
// 	}
//
// 	loadedPacksAll(): string[] {
// 		return R.unique(this.dataTabsList.flatMap(t => this.loadedPacks(t))).sort()
// 	}
//
// 	override activateListeners($html: JQuery): void {
// 		super.activateListeners($html)
// 		const html = $html[0]
// 		const activeTabName = this.activeTab
//
// 		// Set the navigation tab. This is only needed when the browser is openend
// 		// with CompendiumBrowserTab#open
// 		if (this.navigationTab.active !== activeTabName) {
// 			this.navigationTab.activate(activeTabName)
// 		}
//
// 		// Settings Tab
// 		if (activeTabName === TabName.Settings) {
// 			const settings = htmlQuery(html, ".compendium-browser-settings")
// 			const form = settings?.querySelector<HTMLFormElement>("form")
// 			if (!form) return
//
// 			htmlQuery(settings, "button[data-action=save-settings]")?.addEventListener("click", async () => {
// 				const formData = new FormData(form)
// 				for (const [t, packs] of Object.entries(this.settings) as [string, { [key: string]: PackInfo }][]) {
// 					for (const [key, pack] of Object.entries(packs) as [string, PackInfo][]) {
// 						pack.load = formData.has(`${t}-${key}`)
// 					}
// 				}
// 				await game.settings.set(SYSTEM_NAME, SETTINGS.COMPENDIUM_BROWSER_PACKS, this.settings)
//
// 				for (const [key, source] of Object.entries(this.packLoader.sourcesSettings.sources)) {
// 					if (!source?.name) {
// 						delete this.packLoader.sourcesSettings.sources[key] // just to make sure we clean up
// 						continue
// 					}
// 					source.load = formData.has(`source-${key}`)
// 				}
//
// 				this.packLoader.sourcesSettings.showEmptySources = formData.has("show-empty-sources")
// 				this.packLoader.sourcesSettings.showUnknownSources = formData.has("show-unknown-sources")
// 				this.packLoader.sourcesSettings.ignoreAsGM = formData.has("ignore-as-gm")
// 				await game.settings.set(
// 					SYSTEM_NAME,
// 					SETTINGS.COMPENDIUM_BROWSER_SOURCES,
// 					this.packLoader.sourcesSettings,
// 				)
//
// 				await this.#resetInitializedTabs()
// 				this.render(true)
// 				ui.notifications.info(LocalizeGURPS.translations.gurps.compendium_browser.settings_saved)
// 			})
//
// 			const sourceSearch = htmlQuery<HTMLInputElement>(form, "input[data-element=setting-sources-search]")
// 			const sourceToggle = htmlQuery<HTMLInputElement>(form, "input[data-action=setting-sources-toggle-visible]")
// 			const sourceSettings = htmlQueryAll<HTMLElement>(form, "label[data-element=setting-source]")
//
// 			sourceSearch?.addEventListener("input", () => {
// 				const value = sourceSearch.value?.trim().toLocaleLowerCase(game.i18n.lang)
//
// 				for (const element of sourceSettings) {
// 					const name = element.dataset.name?.toLocaleLowerCase(game.i18n.lang)
// 					const shouldBeHidden = !!value && !!name && !name.includes(value)
//
// 					element.classList.toggle("hidden", shouldBeHidden)
// 				}
//
// 				if (sourceToggle) {
// 					sourceToggle.checked = false
// 				}
// 			})
//
// 			sourceToggle?.addEventListener("click", () => {
// 				for (const element of sourceSettings) {
// 					const checkbox = htmlQuery<HTMLInputElement>(element, "input[type=checkbox]")
// 					if (!element.classList.contains("hidden") && checkbox) {
// 						checkbox.checked = sourceToggle.checked
// 					}
// 				}
// 			})
//
// 			const deleteButton = htmlQuery<HTMLInputElement>(form, "button[data-action=settings-sources-delete]")
// 			deleteButton?.addEventListener("click", async () => {
// 				const localize = LocalizeGURPS.translations.gurps.compendium_browser.sources
// 				const confirm = await Dialog.confirm({
// 					title: localize.delete_all_title,
// 					content: `
//                         <p>
//                             ${localize.delete_all_question}
//                         </p>
//                         <p>
//                             ${localize.delete_all_info}
//                         </p>
//                         `,
// 				})
//
// 				if (confirm) {
// 					await this.packLoader.hardReset(this.loadedPacksAll())
// 					await game.settings.set(
// 						SYSTEM_NAME,
// 						SETTINGS.COMPENDIUM_BROWSER_SOURCES,
// 						this.packLoader.sourcesSettings,
// 					)
// 					await this.#resetInitializedTabs()
// 					this.render(true)
// 				}
// 			})
// 			return
// 		}
//
// 		// Other tabs
// 		const currentTab = this.tabs[activeTabName]
// 		const controlArea = html.querySelector<HTMLDivElement>("div.control-area")
// 		if (!controlArea) return
//
// 		// Search field
// 		const search = controlArea.querySelector<HTMLInputElement>("input[name=textFilter]")
// 		if (search) {
// 			search.addEventListener("input", () => {
// 				currentTab.filterData.search.text = search.value
// 				this.#clearScrollLimit()
// 				this.#renderResultList({ replace: true })
// 			})
// 		}
//
// 		// Sort item list
// 		const sortContainer = controlArea.querySelector<HTMLDivElement>("div.sortcontainer")
// 		if (sortContainer) {
// 			const order = sortContainer.querySelector<HTMLSelectElement>("select.order")
// 			if (order) {
// 				order.addEventListener("change", () => {
// 					currentTab.filterData.order.by = order.value ?? "name"
// 					this.#clearScrollLimit(true)
// 				})
// 			}
// 			const directionAnchor = sortContainer.querySelector<HTMLAnchorElement>("a.direction")
// 			if (directionAnchor) {
// 				directionAnchor.addEventListener("click", () => {
// 					const direction = directionAnchor.dataset.direction ?? "asc"
// 					currentTab.filterData.order.direction = direction === "asc" ? "desc" : "asc"
// 					this.#clearScrollLimit(true)
// 				})
// 			}
// 		}
//
// 		// Clear all filters button
// 		controlArea.querySelector<HTMLButtonElement>("button.clear-filters")?.addEventListener("click", () => {
// 			this.#resetFilters()
// 			this.#clearScrollLimit(true)
// 		})
//
// 		// Create Roll Table button
// 		htmlQuery(html, "[data-action=create-roll-table]")?.addEventListener("click", () =>
// 			currentTab.createRollTable(),
// 		)
//
// 		// Add to Roll Table button
// 		htmlQuery(html, "[data-action=add-to-roll-table]")?.addEventListener("click", async () => {
// 			if (!game.tables.contents.length) return
// 			currentTab.addToRollTable()
// 		})
//
// 		// Filters
// 		const filterContainers = controlArea.querySelectorAll<HTMLDivElement>("div.filtercontainer")
// 		for (const container of Array.from(filterContainers)) {
// 			const { filterType, filterName } = container.dataset
//
// 			if (filterType === "multiselects") {
// 				// Multiselects using tagify
// 				const multiselects = currentTab.filterData.multiselects
// 				if (!multiselects) continue
// 				if (objectHasKey(multiselects, filterName)) {
// 					const multiselect = container.querySelector<HTMLInputElement>(
// 						`input[name=${filterName}][data-tagify-select]`,
// 					)
// 					if (!multiselect) continue
// 					// const data = multiselects[filterName]
//
// 					// const tagify = new Tagify(multiselect, {
// 					// 	enforceWhitelist: true,
// 					// 	keepInvalidTags: false,
// 					// 	editTags: false,
// 					// 	tagTextProp: "value",
// 					// 	dropdown: {
// 					// 		enabled: 0,
// 					// 		fuzzySearch: false,
// 					// 		mapValueTo: "label",
// 					// 		maxItems: data.options.length,
// 					// 		searchKeys: ["label"],
// 					// 	},
// 					// 	whitelist: data.options,
// 					// 	transformTag(tagData) {
// 					// 		const selected = data.selected.find(s => s.value === tagData.value)
// 					// 		if (selected?.not) {
// 					// 			;(tagData as unknown as { class: string }).class = "conjunction-not"
// 					// 		}
// 					// 	},
// 					// })
//
// 					// tagify.on("click", event => {
// 					// 	const target = event.detail.event.target as HTMLElement
// 					// 	if (!target) return
// 					// 	const action = htmlClosest(target, "[data-action]")?.dataset?.action
// 					// 	if (action === "toggle-not") {
// 					// 		const value = event.detail.data.value
// 					// 		const selected = data.selected.find(s => s.value === value)
// 					// 		if (selected) {
// 					// 			selected.not = !selected.not
// 					// 			this.render()
// 					// 		}
// 					// 	}
// 					// })
// 					// tagify.on("change", event => {
// 					// 	const selections: unknown = JSON.parse(event.detail.value || "[]")
// 					// 	const isValid =
// 					// 		Array.isArray(selections) &&
// 					// 		selections.every(
// 					// 			(s: unknown): s is { value: string; label: string } =>
// 					// 				// @ts-expect-error to look at later
// 					// 				R.isObject<{ value: unknown }>(s) && typeof s["value"] === "string",
// 					// 		)
// 					//
// 					// 	if (isValid) {
// 					// 		data.selected = selections
// 					// 		this.render()
// 					// 	}
// 					// })
//
// 					for (const tag of htmlQueryAll(container, "tag")) {
// 						const icon = fontAwesomeIcon("ban", { style: "solid" })
// 						icon.classList.add("fa-2xs")
// 						const notButton = createHTMLElement("a", {
// 							classes: ["conjunction-not-button"],
// 							children: [icon],
// 							dataset: { action: "toggle-not" },
// 						})
// 						tag.appendChild(notButton)
// 					}
// 				}
// 			}
// 		}
//
// 		const list = html.querySelector<HTMLUListElement>(".tab.active ul.items")
// 		if (!list) return
// 		list.addEventListener("scroll", () => {
// 			console.log("scroll")
// 			if (list.scrollTop + list.clientHeight >= list.scrollHeight - 5) {
// 				const currentValue = currentTab.scrollLimit
// 				const maxValue = currentTab.totalItemCount ?? 0
// 				if (currentValue < maxValue) {
// 					currentTab.scrollLimit = Math.clamp(currentValue + 100, 100, maxValue)
// 					this.#renderResultList({ list, start: currentValue })
// 				}
// 			}
// 		})
//
// 		// Initial result list render
// 		this.#renderResultList({ list })
// 	}
//
// 	async #resetInitializedTabs(): Promise<void> {
// 		for (const tab of Object.values(this.tabs)) {
// 			if (tab.isInitialized) {
// 				await tab.init()
// 				tab.scrollLimit = 100
// 			}
// 		}
// 	}
//
// 	/**
// 	 * Append new results to the result list
// 	 * @param options Render options
// 	 * @param options.list The result list HTML element
// 	 * @param options.start The index position to start from
// 	 * @param options.replace Replace the current list with the new results?
// 	 */
// 	async #renderResultList({ list, start = 0, replace = false }: RenderResultListOptions): Promise<void> {
// 		const currentTab = this.activeTab !== "settings" ? this.tabs[this.activeTab] : null
// 		const html = this.element[0]
// 		if (!currentTab) return
//
// 		if (!list) {
// 			const listElement = html.querySelector<HTMLUListElement>(".tab.active ul.items")
// 			if (!listElement) return
// 			list = listElement
// 		}
//
// 		// Get new results from index
// 		const newResults = await currentTab.renderResults(start)
// 		// Add listeners to new results only
// 		this.#activateResultListeners(newResults)
// 		// Add the results to the DOM
// 		const fragment = document.createDocumentFragment()
// 		fragment.append(...newResults)
// 		if (replace) {
// 			list.replaceChildren(fragment)
// 		} else {
// 			list.append(fragment)
// 		}
//
// 		// Re-apply drag drop handler
// 		for (const dragDropHandler of this._dragDrop) {
// 			dragDropHandler.bind(html)
// 		}
//
// 		applyBanding(html)
// 	}
//
// 	/** Activate click listeners on loaded actors and items */
// 	#activateResultListeners(liElements: HTMLLIElement[] = []): void {
// 		for (const liElement of liElements) {
// 			const { itemId } = liElement.dataset
// 			if (!itemId) continue
//
// 			const nameAnchor = liElement.querySelector<HTMLDivElement>("div.item-name")
// 			if (nameAnchor) {
// 				nameAnchor.addEventListener("dblclick", async () => {
// 					const document = await fromUuid(itemId)
// 					if (document instanceof ItemGURPS2) document.prepareSiblingData()
// 					if (document?.sheet) {
// 						document.sheet.render(true)
// 					}
// 				})
// 			}
//
// 			// if (this.activeTab === TabName.Equipment) {
// 			// 	// Add an item to selected tokens' actors' inventories
// 			// 	divElement
// 			// 		.querySelector<HTMLAnchorElement>("a[data-action=take-item]")
// 			// 		?.addEventListener("click", () => {
// 			// 			this.#takeEquipment(entryUuid)
// 			// 		})
// 			//
// 			// 	// Attempt to buy an item with the selected tokens' actors'
// 			// 	divElement
// 			// 		.querySelector<HTMLAnchorElement>("a[data-action=buy-item]")
// 			// 		?.addEventListener("click", () => {
// 			// 			this.#buyEquipment(entryUuid)
// 			// 		})
// 			// }
// 		}
// 	}
//
// 	// async #takeEquipment(uuid: string): Promise<void> {
// 	// 	const actors = getSelectedActors({ include: [ActorType.Character, ActorType.Loot], assignedFallback: true })
// 	// 	const item = await this.#getEquipment(uuid)
// 	//
// 	// 	if (actors.length === 0) {
// 	// 		ui.notifications.error(LocalizeGURPS.translations.gurps.error.no_token_selected)
// 	// 		return
// 	// 	}
// 	//
// 	// 	for (const actor of actors) {
// 	// 		await actor.createEmbeddedDocuments("Item", [item], {})
// 	// 	}
// 	//
// 	// 	if (actors.length === 1 && game.user.character && actors[0] === game.user.character) {
// 	// 		ui.notifications.info(
// 	// 			LocalizeGURPS.format(LocalizeGURPS.translations.gurps.compendium_browser.added_item_to_character, {
// 	// 				item: item.name,
// 	// 				character: game.user.character.name,
// 	// 			}),
// 	// 		)
// 	// 	} else {
// 	// 		ui.notifications.info(
// 	// 			LocalizeGURPS.format(LocalizeGURPS.translations.gurps.compendium_browser.added_item, {
// 	// 				item: item.name,
// 	// 			}),
// 	// 		)
// 	// 	}
// 	// }
// 	//
// 	// async #buyEquipment(uuid: string): Promise<void> {
// 	// 	const actors = getSelectedActors({ include: [ActorType.Character, ActorType.Loot], assignedFallback: true })
// 	// 	const item = await this.#getEquipment(uuid)
// 	//
// 	// 	if (actors.length === 0) {
// 	// 		if (game.user.character?.isOfType(ActorType.Character)) {
// 	// 			actors.push(game.user.character)
// 	// 		} else {
// 	// 			ui.notifications.error(LocalizeGURPS.translations.gurps.error.no_token_selected)
// 	// 			return
// 	// 		}
// 	// 	}
// 	//
// 	// 	// eslint-disable-next-line prefer-const
// 	// 	let purchaseSuccesses = 0
// 	//
// 	// 	// for (const actor of actors) {
// 	// 	// 	if (await actor.inventory.removeCoins(item.price.value)) {
// 	// 	// 		purchaseSuccesses = purchaseSuccesses + 1
// 	// 	// 		await actor.inventory.add(item, { stack: true })
// 	// 	// 	}
// 	// 	// }
// 	//
// 	// 	if (actors.length === 1) {
// 	// 		if (purchaseSuccesses === 1) {
// 	// 			ui.notifications.info(
// 	// 				LocalizeGURPS.format(
// 	// 					LocalizeGURPS.translations.gurps.compendium_browser.bought_item_with_character,
// 	// 					{
// 	// 						item: item.name,
// 	// 						characters: actors[0].name,
// 	// 					},
// 	// 				),
// 	// 			)
// 	// 		} else {
// 	// 			ui.notifications.info(
// 	// 				LocalizeGURPS.format(
// 	// 					LocalizeGURPS.translations.gurps.compendium_browser.failed_to_buy_item_with_character,
// 	// 					{
// 	// 						item: item.name,
// 	// 						characters: actors[0].name,
// 	// 					},
// 	// 				),
// 	// 			)
// 	// 		}
// 	// 	} else {
// 	// 		if (purchaseSuccesses === actors.length) {
// 	// 			ui.notifications.info(
// 	// 				LocalizeGURPS.format(
// 	// 					LocalizeGURPS.translations.gurps.compendium_browser.bought_item_with_all_characters,
// 	// 					{
// 	// 						item: item.name,
// 	// 						characters: actors[0].name,
// 	// 					},
// 	// 				),
// 	// 			)
// 	// 		} else {
// 	// 			ui.notifications.info(
// 	// 				LocalizeGURPS.format(
// 	// 					LocalizeGURPS.translations.gurps.compendium_browser.failed_to_buy_item_with_some_characters,
// 	// 					{
// 	// 						item: item.name,
// 	// 						characters: actors[0].name,
// 	// 					},
// 	// 				),
// 	// 			)
// 	// 		}
// 	// 	}
// 	// }
// 	//
// 	// async #getEquipment(uuid: string): Promise<EquipmentGURPS | EquipmentContainerGURPS> {
// 	// 	const item = await fromUuid(uuid)
// 	// 	if (!(item instanceof EquipmentGURPS || item instanceof EquipmentContainerGURPS)) {
// 	// 		throw ErrorGURPS("Unexpected failure retrieving compendium item")
// 	// 	}
// 	//
// 	// 	return item
// 	// }
//
// 	protected override _canDragStart(): boolean {
// 		return true
// 	}
//
// 	protected override _canDragDrop(): boolean {
// 		return true
// 	}
//
// 	/** Set drag data and lower opacity of the application window to reveal any tokens */
// 	protected override _onDragStart(event: DragEvent): void {
// 		if (!(event.currentTarget instanceof HTMLElement && event.dataTransfer)) {
// 			return super._onDragStart(event)
// 		}
//
// 		this.element.animate({ opacity: 0.125 }, 250)
//
// 		const item = event.currentTarget
// 		event.dataTransfer.setData(
// 			DnD.TEXT_PLAIN,
// 			JSON.stringify({
// 				type: "Item",
// 				uuid: item.dataset.itemId,
// 				itemType: item.dataset.type,
// 			}),
// 		)
// 		// awful hack (dataTransfer.types will include "from-browser")
// 		event.dataTransfer.setData("from-browser", "true")
//
// 		item.addEventListener(
// 			"dragend",
// 			() => {
// 				window.setTimeout(() => {
// 					this.element.animate({ opacity: 1 }, 250, () => {
// 						this.element.css({ pointerEvents: "" })
// 					})
// 				}, 500)
// 			},
// 			{ once: true },
// 		)
// 	}
//
// 	protected override _onDragOver(event: DragEvent): void {
// 		super._onDragOver(event)
// 		if (event.dataTransfer?.types.includes("from-browser")) {
// 			this.element.css({ pointerEvents: "none" })
// 		}
// 	}
//
// 	override getData(): CompendiumBrowserSheetData {
// 		const activeTab = this.activeTab
// 		const tab = objectHasKey(this.tabs, activeTab) ? this.tabs[activeTab] : null
//
// 		const settings = {
// 			settings: this.settings,
// 			sources: this.packLoader.sourcesSettings,
// 		}
//
// 		return {
// 			user: game.user,
// 			[activeTab]: activeTab === "settings" ? settings : { filterData: tab?.filterData },
// 			scrollLimit: tab?.scrollLimit,
// 		}
// 	}
//
// 	#resetFilters(): void {
// 		const activeTab = this.activeTab
// 		if (activeTab !== "settings") {
// 			this.tabs[activeTab].resetFilters()
// 		}
// 	}
//
// 	#clearScrollLimit(render = false): void {
// 		const tab = this.activeTab
// 		if (tab === "settings") return
//
// 		const list = htmlQuery(this.element[0], ".tab.active ul.items")
// 		if (!list) return
// 		list.scrollTop = 0
// 		this.tabs[tab].scrollLimit = 100
//
// 		if (render) {
// 			this.render()
// 		}
// 	}
// }
//
// type CompendiumBrowserSettings = Omit<TabData<Record<string, PackInfo | undefined>>, "settings">
//
// type CompendiumBrowserSourcesList = Record<string, SourceInfo | undefined>
// interface CompendiumBrowserSources {
// 	ignoreAsGM: boolean
// 	showEmptySources: boolean
// 	showUnknownSources: boolean
// 	sources: CompendiumBrowserSourcesList
// }
//
// interface CompendiumBrowserSheetData {
// 	user: Active<UserGURPS>
// 	settings?: { settings: CompendiumBrowserSettings; sources: CompendiumBrowserSources }
// 	scrollLimit?: number
// }
//
// export { CompendiumBrowser }
// export type { CompendiumBrowserSettings, CompendiumBrowserSources }
