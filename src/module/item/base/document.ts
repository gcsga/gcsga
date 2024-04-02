import { ActorGURPS } from "@actor"
import {
	AbstractContainerGURPS,
	EquipmentContainerGURPS,
	EquipmentModifierContainerGURPS,
	NoteContainerGURPS,
	SkillContainerGURPS,
	SpellContainerGURPS,
	TraitContainerGURPS,
	TraitModifierContainerGURPS,
} from "@item"
import type { ItemSourceGURPS } from "@item/data/index.ts"
import { ABSTRACT_CONTAINER_TYPES, CONTAINER_TYPES, ItemFlags, ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { MigrationList, MigrationRunner } from "@module/migration/index.ts"
import {
	EvalEmbeddedRegex,
	SkillDefaultResolver,
	display,
	replaceAllStringFunc,
	setHasElement,
	sheetDisplayNotes,
} from "@util"
import * as R from "remeda"
import type { ItemFlagsGURPS, ItemSystemData } from "./data.ts"
import type { ItemSheetGURPS } from "./sheet.ts"
import { ItemInstances } from "@item/types.ts"
import { ContainedWeightReduction, ContainedWeightReductionObj, Feature, PrereqList } from "@system"
import { getItemArtworkName, itemIsOfType } from "@item/helpers.ts"

/** The basic `Item` subclass for the system */
class ItemGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends Item<TParent> {
	/** Has this document completed `DataModel` initialization? */
	declare initialized: boolean
	/**
	 * The cached container of this item, if in a container, or null
	 * @ignore
	 */
	private declare _container: AbstractContainerGURPS | null

	// Cache for list of unsatisfied prerequisites
	declare unsatisfiedReason: string

	// Dummy actor, used for actor substitution for skill defaults
	private declare _dummyActor: SkillDefaultResolver | null

	get dummyActor(): SkillDefaultResolver | null {
		return this._dummyActor
	}

	set dummyActor(actor: SkillDefaultResolver | null) {
		this._dummyActor = actor
	}

	override get visible(): boolean {
		// @ts-expect-error they can be equal but whatever
		if (this.collection !== game.items) return super.visible
		return super.visible && this.flags[SYSTEM_NAME][ItemFlags.Container] === null
	}

	/** The recorded schema version of this item, updated after each data migration */
	get schemaVersion(): number | null {
		return Number(this.system._migration?.version) || null
	}

	get features(): Feature[] {
		if (
			itemIsOfType(
				this,
				ItemType.Trait,
				ItemType.TraitModifier,
				ItemType.Skill,
				ItemType.Technique,
				ItemType.Equipment,
				ItemType.EquipmentContainer,
				ItemType.EquipmentModifier,
			)
		) {
			return (
				this.system.features?.map(feature => {
					const FeatureConstructor = CONFIG.GURPS.Feature.classes[feature.type]
					// @ts-expect-error conflicting type definitions, probably ok
					const f = FeatureConstructor.fromObject(feature as ContainedWeightReductionObj)
					if (this.isOfType(ItemType.Trait)) {
						// @ts-expect-error maybe fine? idk
						if (this.isLeveled && !(f instanceof ContainedWeightReduction)) f.setLevel(this.levels)
					}
					return f
				}) ?? []
			)
		}
		return []
	}

	get prereqsEmpty(): boolean {
		if (
			itemIsOfType(
				this,
				ItemType.Trait,
				ItemType.Skill,
				ItemType.Technique,
				ItemType.Spell,
				ItemType.RitualMagicSpell,
				ItemType.Equipment,
				ItemType.EquipmentContainer,
			)
		) {
			if (!this.system.prereqs) return true
			return this.system.prereqs?.prereqs ? this.system.prereqs.prereqs.length > 1 : false
		}
		return true
	}

	get prereqs(): PrereqList {
		if (
			itemIsOfType(
				this,
				ItemType.Trait,
				ItemType.Skill,
				ItemType.Technique,
				ItemType.Spell,
				ItemType.RitualMagicSpell,
				ItemType.Equipment,
				ItemType.EquipmentContainer,
			)
		) {
			if (!this.system.prereqs) return new PrereqList()
			return PrereqList.fromObject(this.system.prereqs, this.actor)
		}
		return new PrereqList()
	}

	// protected override async _preCreate(
	// 	data: this["_source"],
	// 	options: DocumentModificationContext<TParent>,
	// 	user: User<Actor<null>>,
	// ): Promise<boolean | void> {
	// 	super._preCreate(data, options, user)
	// 	this.updateSource({ name: LocalizeGURPS.translations.TYPES.Item[data.type] })
	// }

	static override getDefaultArtwork(itemData: foundry.documents.ItemSource): {
		img: ImageFilePath
		texture: { src: ImageFilePath | VideoFilePath }
	} {
		const type = getItemArtworkName(itemData.type)
		const img: ImageFilePath = `systems/${SYSTEM_NAME}/icons/default-icons/${type}.svg`
		return { img, texture: { src: img } }
	}

	/** Don't allow the user to create a condition or spellcasting entry from the sidebar. */
	static override createDialog<TDocument extends foundry.abstract.Document>(
		this: ConstructorOf<TDocument>,
		data?: Record<string, unknown>,
		context?: {
			parent?: TDocument["parent"]
			pack?: Collection<TDocument> | null
		} & Partial<FormApplicationOptions>,
	): Promise<TDocument | null>
	static override async createDialog(
		data: { folder?: string } = {},
		context: {
			parent?: ActorGURPS | null
			pack?: Collection<ItemGURPS<null>> | null
		} & Partial<FormApplicationOptions> = {},
	): Promise<Item<ActorGURPS | null> | null> {
		const omittedTypes: ItemType[] = []
		if (BUILD_MODE === "production") omittedTypes.push(ItemType.Condition)

		// Create the dialog, temporarily changing the list of allowed items
		const original = game.system.documentTypes.Item
		try {
			game.system.documentTypes.Item = R.difference(original, omittedTypes)
			return super.createDialog<ItemGURPS>(data, {
				...context,
				classes: [...(context.classes ?? []), "dialog-item-create"],
			})
		} finally {
			game.system.documentTypes.Item = original
		}
	}

	/** Include the item type along with data from upstream */
	override toDragData(): { type: string; itemType: string; [key: string]: unknown } {
		return { ...super.toDragData(), itemType: this.type }
	}

	static override async createDocuments<TDocument extends foundry.abstract.Document>(
		this: ConstructorOf<TDocument>,
		data?: (TDocument | PreCreate<TDocument["_source"]>)[],
		context?: DocumentModificationContext<TDocument["parent"]>,
	): Promise<TDocument[]>
	static override async createDocuments(
		data: (ItemGURPS | PreCreate<ItemSourceGURPS>)[] = [],
		context: DocumentModificationContext<ActorGURPS | null> = {},
	): Promise<foundry.abstract.Document[]> {
		// Convert all `ItemGURPS`s to source objects
		const sources: PreCreate<ItemSourceGURPS>[] = data.map(
			(d): PreCreate<ItemSourceGURPS> => (d instanceof ItemGURPS ? d.toObject() : d),
		)

		// Migrate source in case of importing from an old compendium
		for (const source of [...sources]) {
			source.effects = [] // Never

			const item = new CONFIG.Item.documentClass(source)
			await MigrationRunner.ensureSchemaVersion(item, MigrationList.constructFromVersion(item.schemaVersion))
			data.splice(data.indexOf(source), 1, item.toObject())
		}

		const actor = context.parent
		if (!actor) return super.createDocuments(sources, context)

		// Check if this item is valid for this actor
		if (sources.some(s => !actor.checkItemValidity(s))) {
			return []
		}

		return super.createDocuments(sources, context)
	}

	static override async deleteDocuments<TDocument extends foundry.abstract.Document>(
		this: ConstructorOf<TDocument>,
		ids?: string[],
		context?: DocumentModificationContext<TDocument["parent"]>,
	): Promise<TDocument[]>
	static override async deleteDocuments(
		ids: string[] = [],
		context: DocumentModificationContext<ActorGURPS | null> = {},
	): Promise<foundry.abstract.Document[]> {
		ids = Array.from(new Set(ids))
		const actor = context.parent
		if (actor) {
			const items = ids.flatMap(id => actor.items.get(id) ?? [])

			// If a container is being deleted, its contents are also deleted
			const containers = items.filter((i): i is AbstractContainerGURPS<ActorGURPS> =>
				i.isOfType("abstract-container"),
			)
			for (const container of containers) {
				items.push(...container.deepContents)
			}

			ids = Array.from(new Set(items.map(i => i.id))).filter(id => actor.items.has(id))
		}

		return super.deleteDocuments(ids, context)
	}

	get container(): AbstractContainerGURPS | null {
		if (this.flags[SYSTEM_NAME][ItemFlags.Container] === null) return (this._container = null)
		return (this._container ??=
			(this.collection.get(this.flags[SYSTEM_NAME][ItemFlags.Container]) as unknown as AbstractContainerGURPS) ??
			null)
	}

	get parents(): (CompendiumCollection<CompendiumDocument> | AbstractContainerGURPS | ActorGURPS)[] {
		if (!this.container && !this.parent && !this.compendium) return []
		const parents: (CompendiumCollection<CompendiumDocument> | AbstractContainerGURPS | ActorGURPS)[] = []
		if (this.container) parents.push(this.container, ...this.container.parents)
		if (this.actor || this.compendium) parents.push((this.actor || this.compendium)!)
		return parents
	}

	get parentIds(): string[] {
		const parents = this.parents.filter(parent => !(parent instanceof CompendiumCollection)) as (
			| AbstractContainerGURPS
			| ActorGURPS
		)[]
		return parents.map(e => e.id)
	}

	/** Check this item's type (or whether it's one among multiple types) without a call to `instanceof` */
	isOfType<T extends ItemType>(...types: T[]): this is ItemInstances<TParent>[T]
	isOfType(type: "abstract-container"): this is AbstractContainerGURPS<TParent>
	isOfType(
		type: "container",
	): this is
		| TraitContainerGURPS<TParent>
		| TraitModifierContainerGURPS<TParent>
		| SkillContainerGURPS<TParent>
		| SpellContainerGURPS<TParent>
		| EquipmentContainerGURPS<TParent>
		| EquipmentModifierContainerGURPS<TParent>
		| NoteContainerGURPS<TParent>
	isOfType<T extends "abstract-container" | "container" | ItemType>(
		...types: T[]
	): this is T extends "abstract-container"
		? AbstractContainerGURPS<TParent>
		: T extends "container"
			?
					| TraitContainerGURPS<TParent>
					| TraitModifierContainerGURPS<TParent>
					| SkillContainerGURPS<TParent>
					| SpellContainerGURPS<TParent>
					| EquipmentContainerGURPS<TParent>
					| EquipmentModifierContainerGURPS<TParent>
					| NoteContainerGURPS<TParent>
			: T extends ItemType
				? ItemInstances<TParent>[T]
				: never
	isOfType(...types: string[]): boolean {
		return types.some(t =>
			t === "abstract-container"
				? setHasElement(ABSTRACT_CONTAINER_TYPES, this.type)
				: t === "container"
					? setHasElement(CONTAINER_TYPES, this.type)
					: this.type === t,
		)
	}

	// The name of the item displayed on the character sheet
	get formattedName(): string {
		return this.name ?? ""
	}

	get resolvedNotes(): string {
		return sheetDisplayNotes(this.secondaryText(display.Option.isInline), { unsatisfied: this.unsatisfiedReason })
	}

	// The notes of the item displayed on the character sheet
	secondaryText(_optionChecker: (option: display.Option) => boolean): string {
		return ""
	}

	get localNotes(): string {
		// @ts-expect-error doesn't exist here but does elsewhere
		return this.system.notes ?? ""
	}

	// Notes with variables replaced with their values
	get notes(): string {
		return replaceAllStringFunc(EvalEmbeddedRegex, this.localNotes, this.actor)
	}

	get tags(): string[] {
		if (
			this.isOfType(
				ItemType.Trait,
				ItemType.TraitContainer,
				ItemType.Skill,
				ItemType.Technique,
				ItemType.Spell,
				ItemType.RitualMagicSpell,
				ItemType.Equipment,
				ItemType.EquipmentContainer,
				ItemType.EquipmentModifier,
				ItemType.EquipmentModifierContainer,
			)
		) {
			return this.system.tags ?? []
		}
		return []
	}

	protected override _initialize(options?: Record<string, unknown>): void {
		this.initialized = false
		this._container = null
		super._initialize(options)
	}

	/**
	 * Never prepare data except as part of `DataModel` initialization. If embedded, don't prepare data if the parent is
	 * not yet initialized. See https://github.com/foundryvtt/foundryvtt/issues/7987
	 */
	override prepareData(): void {
		if (this.initialized) return
		if (!this.parent || this.parent.initialized) {
			this.initialized = true
			super.prepareData()
		}
	}

	/** Ensure the presence of the gcsga flag scope with default properties and values */
	override prepareBaseData(): void {
		super.prepareBaseData()

		this.system.slug ||= null

		const flags = this.flags
		flags[SYSTEM_NAME] ??= fu.mergeObject(flags[SYSTEM_NAME] ?? {}, {})

		this.flags = flags
		this.flags[SYSTEM_NAME].container ||= null

		if (this._container?.id !== this.flags[SYSTEM_NAME].container) {
			this._container = null
		}
	}

	prepareSiblingData(): void {
		if (!this.collection) return

		// Clear the container reference if it turns out to be stale
		if (this._container && !this.collection.has(this._container.id)) {
			this.setFlag(SYSTEM_NAME, ItemFlags.Container, null)
			this._container = this.flags[SYSTEM_NAME][ItemFlags.Container] = null
		}
		// if (!this.actor) return
		//
		// // Clear the container reference if it turns out to be stale
		// if (this._container && !this.actor.items.has(this._container.id)) {
		// 	this.setFlag(SYSTEM_NAME, ItemFlags.Container, null)
		// 	this._container = this.flags[SYSTEM_NAME][ItemFlags.Container] = null
		// }
	}

	getContextMenuItems(): ContextMenuEntry[] {
		return []
	}
}

interface ItemGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends Item<TParent> {
	constructor: typeof ItemGURPS
	flags: ItemFlagsGURPS
	readonly _source: ItemSourceGURPS
	readonly type: ItemType
	system: ItemSystemData

	_sheet: ItemSheetGURPS<this> | null

	get sheet(): ItemSheetGURPS<this>
}

/** A `Proxy` to to get Foundry to construct `ItemGURPS` subclasses */
const ItemProxyGURPS = new Proxy(ItemGURPS, {
	construct(
		_target,
		args: [source: PreCreate<ItemSourceGURPS>, context?: DocumentConstructionContext<ActorGURPS | null>],
	) {
		const source = args[0]
		const type = source?.type
		const ItemClass: typeof ItemGURPS = CONFIG.GURPS.Item.documentClasses[type] ?? ItemGURPS
		return new ItemClass(...args)
	},
})

export { ItemGURPS, ItemProxyGURPS }
