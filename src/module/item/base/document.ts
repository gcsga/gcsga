import { ActorGURPS } from "@actor/base.ts"
import { ItemFlagsGURPS, ItemSourceGURPS } from "./data/index.ts"
import { ItemSystemSource } from "./data/system.ts"
import { CharacterResolver } from "@util"
import { ItemFlags, ItemType, SYSTEM_NAME } from "@data"
import type { ContainerGURPS } from "@item/container/document.ts"
import { ItemInstances } from "@item/types.ts"
import { MigrationList, MigrationRunner } from "@module/migration/index.ts"

interface ItemModificationContextGURPS<TParent extends ActorGURPS | null> extends DocumentModificationContext<TParent> {
	noPrepare?: boolean
}

interface ItemGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends Item<TParent> {
	flags: ItemFlagsGURPS
	readonly _source: ItemSourceGURPS
	system: ItemSystemSource

	type: ItemType

	get actor(): TParent
}

class ItemGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends Item<TParent> {
	declare _dummyActor: CharacterResolver | null

	// _source!: SourceType

	// // @ts-expect-error this is in fact always defined
	// private _dummyActor: CharacterResolver | null

	// // @ts-expect-error improperly defined type but stuff breaks otherwise so idc
	// type: SourceType["type"]
	//
	// system!: SourceType["system"]
	//
	// flags!: ItemFlagsGURPS
	//
	// parent!: BaseActorGURPS | null
	//

	override update(
		data: Record<string, unknown>,
		context?: ItemModificationContextGURPS<TParent> | undefined,
	): Promise<this | undefined> {
		return super.update(data, context)
	}

	static override async createDialog<ItemGURPS>(
		data: { folder?: string } = {},
		options: Partial<FormApplicationOptions> = {},
	): Promise<ItemGURPS | null> {
		const original = game.system.documentTypes.Item
		game.system.documentTypes.Item = original.filter(
			itemType => ![ItemType.Condition].includes(itemType as ItemType),
		)
		options = { ...options, classes: [...(options.classes ?? []), "dialog-item-create"] }
		const newItem = super.createDialog(data, options) as Promise<ItemGURPS | null>
		game.system.documentTypes.Item = original
		return newItem
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

	// static override getDefaultArtwork(itemData: ItemData): { img: string } {
	// 	let type = itemData.type.replace("_container", "")
	// 	if (type === ItemType.Technique) type = ItemType.Skill
	// 	else if (type === ItemType.RitualMagicSpell) type = ItemType.Spell
	// 	else if (type === ItemType.Equipment) type = "equipment"
	// 	else if (type === ItemType.LegacyEquipment) type = "legacy_equipment"
	// 	return { img: `systems/${SYSTEM_NAME}/assets/icons/${type}.svg` }
	// }

	get dummyActor(): CharacterResolver | null {
		return this._dummyActor
	}

	set dummyActor(actor: CharacterResolver | null) {
		this._dummyActor = actor
	}

	get container(): ActorGURPS | ContainerGURPS | CompendiumCollection<CompendiumDocument> | null {
		if (!this.actor && !this.pack) return null
		const id = this.flags[SYSTEM_NAME][ItemFlags.Container]
		if (id === null) return this.actor ?? this.compendium ?? null
		if (this.actor) {
			// @ts-expect-error avoiding circular dependencies
			return this.actor.items.get(id)
		}
		if (this.compendium) return (fromUuidSync(`Compendium.${this.pack}.Item.${id}`) as ContainerGURPS) ?? null
		return null
	}

	get parents(): (CompendiumCollection<CompendiumDocument> | Item | Actor)[] {
		if (!this.container && !this.compendium) return []
		const grandparents = this.container instanceof ItemGURPS ? this.container.parents : []
		if (!this.container && this.compendium) return [this.compendium, ...grandparents]
		if (this.container) return [this.container, ...grandparents]
		return [...grandparents]
	}

	get schemaVersion(): number | null {
		return Number(this.system._migration?.version) || null
	}

	exportSystemData(_keepOther: boolean): Record<string, unknown> {
		return this.system as unknown as Record<string, unknown>
	}

	// override prepareData(): void {
	// 	if (this.parent && !this.parent.flags?.[SYSTEM_NAME]) return
	// 	super.prepareData()
	// }

	sameSection(_compare: ItemGURPS): boolean {
		// const traits = ["trait", "trait_container"]
		// const skills = [ItemType.Skill, ItemType.Technique, ItemType.SkillContainer]
		// const spells = [ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer]
		// const equipment = [ItemType.Equipment, ItemType.EquipmentContainer]
		// const notes = [ItemType.Note, ItemType.NoteContainer]
		// const sections = [traits, skills, spells, equipment, notes]
		// for (const i of sections) {
		// 	if (i.includes(this.type) && i.includes(compare.type)) return true
		// }
		return false
	}

	/** A means of checking this actor's type without risk of circular import references */
	isOfType<T extends ItemType>(...types: T[]): this is ItemInstances<TParent>[T]
	isOfType(...types: string[]): boolean {
		return types.some(t => this.type === t)
	}
}

const ItemProxyGURPS = new Proxy(ItemGURPS, {
	construct(_target, args: [source: ItemSourceGURPS, context: DocumentConstructionContext<ActorGURPS | null>]) {
		const source = args[0]
		const type = source.type
		const ItemClass: typeof ItemGURPS = CONFIG.GURPS.Item.documentClasses[type] ?? ItemGURPS
		return new ItemClass(...args)
	},
})

export { ItemGURPS, ItemProxyGURPS }
