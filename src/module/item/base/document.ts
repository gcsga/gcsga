import { ContainerGURPS } from "@item/container"
import { ItemType, SYSTEM_NAME } from "@module/data"
import { ItemData } from "types/foundry/common/data/module.mjs"
import { BaseItemSourceGURPS, ItemFlags, ItemFlagsGURPS } from "./data"
import { ItemDataConstructorData } from "types/foundry/common/data/data.mjs/itemData"
import { MergeObjectOptions } from "types/foundry/common/utils/helpers.mjs"
import { CharacterResolver } from "@util"
import { BaseActorGURPS } from "@actor"

export class BaseItemGURPS<SourceType extends BaseItemSourceGURPS = BaseItemSourceGURPS> extends Item {
	_id!: string

	_source!: SourceType

	// @ts-expect-error this is in fact always defined
	private _dummyActor: CharacterResolver | null

	// @ts-expect-error improperly defined type but stuff breaks otherwise so idc
	type: SourceType["type"]

	system!: SourceType["system"]

	flags!: ItemFlagsGURPS

	parent!: BaseActorGURPS | null

	// constructor(data: ItemDataGURPS | any, context: Context<Actor> & ItemConstructionContextGURPS = {}) {
	// 	if (context.gurps?.ready) {
	// 		super(data, context)
	// 		this._dummyActor = null
	// 	} else {
	// 		mergeObject(context, {
	// 			gurps: {
	// 				ready: true,
	// 			},
	// 		})
	// 		const ItemConstructor = CONFIG.GURPS.Item.documentClasses[data.type as ItemType]
	// 		if (ItemConstructor) return new ItemConstructor(data, context)
	// 		throw Error(`Invalid Item Type "${data.type}"`)
	// 	}
	// }

	// get type(): ItemType {
	// 	return super.type as ItemType
	// }

	// override async update(
	// 	data: DeepPartial<ItemDataConstructorData | Record<string, unknown>>,
	// 	context?: DocumentModificationContext & MergeObjectOptions & { noPrepare?: boolean }
	// ): Promise<this | undefined> {
	// 	console.trace("update", this.name)
	// 	return super.update(data, context)
	// }

	static override async createDialog(
		data: { folder?: string } = {},
		options: Partial<FormApplicationOptions> = {}
	): Promise<any | undefined> {
		const original = game.system.documentTypes.Item
		game.system.documentTypes.Item = original.filter(
			(itemType: string) => ![ItemType.Condition].includes(itemType as any)
		)
		options = { ...options, classes: [...(options.classes ?? []), "dialog-item-create"] }
		const newItem = super.createDialog(data, options) as Promise<BaseItemGURPS | undefined>
		game.system.documentTypes.Item = original
		return newItem
	}

	static override getDefaultArtwork(itemData: ItemData): { img: string } {
		let type = itemData.type.replace("_container", "")
		if (type === ItemType.Technique) type = ItemType.Skill
		else if (type === ItemType.RitualMagicSpell) type = ItemType.Spell
		else if (type === ItemType.Equipment) type = "equipment"
		else if (type === ItemType.LegacyEquipment) type = "legacy_equipment"
		return { img: `systems/${SYSTEM_NAME}/assets/icons/${type}.svg` }
	}

	get dummyActor(): CharacterResolver | null {
		return this._dummyActor
	}

	set dummyActor(actor: CharacterResolver | null) {
		this._dummyActor = actor
	}

	get container(): Actor | ContainerGURPS | null {
		if (!this.actor && !this.pack) return null
		const id = this.getFlag(SYSTEM_NAME, ItemFlags.Container) as string | null
		if (id === null) return this.actor ?? this.compendium
		if (this.actor) return (this.actor?.items.get(id) as ContainerGURPS) ?? null
		if (this.compendium) return (fromUuidSync(`Compendium.${this.pack}.Item.${id}`) as ContainerGURPS) ?? null
		return null
	}

	get parents(): Array<any> {
		if (!this.container && !this.compendium) return []
		const grandparents = this.container instanceof BaseItemGURPS ? this.container.parents : []
		if (!this.container) return [this.compendium, ...grandparents]
		return [this.container, ...grandparents]
	}

	exportSystemData(_keepOther: boolean): any {
		return {}
	}

	prepareData(): void {
		if (this.parent && !this.parent.flags?.[SYSTEM_NAME]) return
		super.prepareData()
	}

	sameSection(compare: Item): boolean {
		const traits = [ItemType.Trait, ItemType.TraitContainer]
		const skills = [ItemType.Skill, ItemType.Technique, ItemType.SkillContainer]
		const spells = [ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer]
		const equipment = [ItemType.Equipment, ItemType.EquipmentContainer]
		const notes = [ItemType.Note, ItemType.NoteContainer]
		const sections = [traits, skills, spells, equipment, notes]
		for (const i of sections) {
			if (i.includes(this.type as any) && i.includes(compare.type as any)) return true
		}
		return false
	}
}

export const ItemProxyGURPS = new Proxy(BaseItemGURPS, {
	construct(_target, args: [source: any, context: any]) {
		const ItemClass = CONFIG.GURPS.Item.documentClasses[args[0]?.type] ?? BaseItemGURPS
		return new ItemClass(...args)
	},
})
