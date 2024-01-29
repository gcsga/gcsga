import { ActorGURPS } from "@actor/base.ts"
import { ContainerGURPS } from "@item/container/document.ts"
import { SYSTEM_NAME } from "@module/data/index.ts"
import { CharacterResolver } from "@util/resolvers.ts"
import { ItemFlags } from "./data/values.ts"
import { ItemSourceGURPS } from "@item/data/index.ts"
import { ItemModificationContextGURPS, ItemType } from "@item/types.ts"

export interface ItemGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends Item<TParent> {
	type: ItemType
	system: ItemSourceGURPS["system"]
}

export class ItemGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends Item<TParent> {
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
			(itemType: string) => ![ItemType.Condition].includes(itemType as ItemType),
		)
		options = { ...options, classes: [...(options.classes ?? []), "dialog-item-create"] }
		const newItem = super.createDialog(data, options) as Promise<ItemGURPS | null>
		game.system.documentTypes.Item = original
		return newItem
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

	get container(): Actor | ContainerGURPS | CompendiumCollection<CompendiumDocument> | null {
		if (!this.actor && !this.pack) return null
		const id = this.getFlag(SYSTEM_NAME, ItemFlags.Container) as string | null
		if (id === null) return this.actor ?? this.compendium ?? null
		if (this.actor) return (this.actor?.items.get(id) as unknown as ContainerGURPS) ?? null
		if (this.compendium)
			return (fromUuidSync(`Compendium.${this.pack}.Item.${id}`) as unknown as ContainerGURPS) ?? null
		return null
	}

	get parents(): (CompendiumCollection<CompendiumDocument> | Item | Actor)[] {
		if (!this.container && !this.compendium) return []
		const grandparents = this.container instanceof ItemGURPS ? this.container.parents : []
		if (!this.container && this.compendium) return [this.compendium, ...grandparents]
		if (this.container) return [this.container, ...grandparents]
		return [...grandparents]
	}

	exportSystemData(_keepOther: boolean): object {
		return {}
	}

	override prepareData(): void {
		if (this.parent && !this.parent.flags?.[SYSTEM_NAME]) return
		super.prepareData()
	}

	sameSection(compare: ItemGURPS): boolean {
		const traits = [ItemType.Trait, ItemType.TraitContainer]
		const skills = [ItemType.Skill, ItemType.Technique, ItemType.SkillContainer]
		const spells = [ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer]
		const equipment = [ItemType.Equipment, ItemType.EquipmentContainer]
		const notes = [ItemType.Note, ItemType.NoteContainer]
		const sections = [traits, skills, spells, equipment, notes]
		for (const i of sections) {
			if (i.includes(this.type) && i.includes(compare.type)) return true
		}
		return false
	}
}

export const ItemProxyGURPS = new Proxy(ItemGURPS, {
	construct(_target, args: [source: ItemSourceGURPS, context: DocumentConstructionContext<ActorGURPS | null>]) {
		const ItemClass = CONFIG.GURPS.Item.documentClasses[args[0]?.type as ItemType] ?? ItemGURPS
		return new ItemClass(...args)
	},
})
