import { ContainerGURPS } from "@item/container"
import { MeleeWeaponGURPS } from "@item/melee_weapon"
import { RangedWeaponGURPS } from "@item/ranged_weapon"
import { BaseWeaponGURPS } from "@item/weapon"
import { Feature, ItemDataGURPS } from "@module/config"
import { ActorType, gid, ItemType, SYSTEM_NAME } from "@module/data"
import { PrereqList } from "@prereq"
import { LocalizeGURPS, Study } from "@util"
import { HandlebarsHelpersGURPS } from "@util/handlebars_helpers"
import { DocumentModificationOptions } from "types/foundry/common/abstract/document.mjs"
import { ItemDataConstructorData } from "types/foundry/common/data/data.mjs/itemData"
import { BaseUser } from "types/foundry/common/documents.mjs"
import { MergeObjectOptions } from "types/foundry/common/utils/helpers.mjs"
import { ItemGCSSource } from "./data"
import { feature, study } from "@util/enum"
import { AttributeBonus } from "@feature"

export abstract class ItemGCS<SourceType extends ItemGCSSource = ItemGCSSource> extends ContainerGURPS<SourceType> {
	unsatisfied_reason = ""

	protected async _preCreate(
		data: ItemDataGURPS,
		options: DocumentModificationOptions,
		user: BaseUser
	): Promise<void> {
		let type = data.type.replace("_container", "")
		if (type === ItemType.Technique) type = ItemType.Skill
		else if (type === ItemType.RitualMagicSpell) type = ItemType.Spell
		else if (type === ItemType.Equipment) type = "equipment"
		else if (type === ItemType.LegacyEquipment) type = "legacy_equipment"
		if (this._source.img === (foundry.documents.BaseItem as any).DEFAULT_ICON)
			this._source.img = data.img = `systems/${SYSTEM_NAME}/assets/icons/${type}.svg`
		let gcs_type: string = data.type
		if (gcs_type === ItemType.Equipment) gcs_type = "equipment"
			; (this._source.system as any).type = gcs_type
		await super._preCreate(data, options, user)
	}

	override async update(
		data: DeepPartial<ItemDataConstructorData | (ItemDataConstructorData & Record<string, unknown>)>,
		context?: DocumentModificationContext & MergeObjectOptions & { noPrepare?: boolean }
	): Promise<this | undefined> {
		if (!(this.parent instanceof Item)) return super.update(data, context)
		data._id = this.id
		await this.container?.updateEmbeddedDocuments("Item", [data])
		// @ts-expect-error type not properly declared, to do later
		this.render(false, { action: "update", data: data })
	}

	override get actor(): (typeof CONFIG.GURPS.Actor.documentClasses)[ActorType.Character] | null {
		const actor = super.actor
		if (actor?.type === ActorType.Character) return actor
		return null
	}

	get ratedStrength(): number {
		return 0
	}

	get formattedName(): string {
		return this.name ?? ""
	}

	get enabled(): boolean {
		return true
	}

	get tags(): string[] {
		return this.system.tags
	}

	get secondaryText(): string {
		let outString = '<div class="item-notes">'
		if (this.system.notes) outString += HandlebarsHelpersGURPS.format(this.system.notes)
		if (this.studyHours !== 0)
			outString += LocalizeGURPS.format(LocalizeGURPS.translations.gurps.study.studied, {
				hours: this.studyHours,
				total: (this.system as any).study_hours_needed,
			})
		if (this.unsatisfied_reason) outString += HandlebarsHelpersGURPS.unsatisfied(this.unsatisfied_reason)
		outString += "</div>"
		return outString
	}

	get reference(): string {
		return this.system.reference
	}

	get features(): Feature[] {
		if (this.system.hasOwnProperty("features")) {
			return (this.system as any).features.map((e: Partial<Feature>) => {
				const FeatureConstructor = CONFIG.GURPS.Feature.classes[e.type as feature.Type]
				if (FeatureConstructor) {
					const f = FeatureConstructor.fromObject(e)
					return f
				}
				return new AttributeBonus(gid.Strength) // default
			})
		}
		return []
	}

	get prereqs() {
		if (!(this.system as any).prereqs) return new PrereqList()
		return new PrereqList((this.system as any).prereqs)
	}

	get prereqsEmpty(): boolean {
		if (!(this.system as any).prereqs.prereqs) return true
		return this.prereqs?.prereqs.length === 0
	}

	get meleeWeapons(): Collection<MeleeWeaponGURPS> {
		const meleeWeapons: Collection<MeleeWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof MeleeWeaponGURPS) meleeWeapons.set(item._id, item)
		}
		return meleeWeapons
	}

	get rangedWeapons(): Collection<RangedWeaponGURPS> {
		const rangedWeapons: Collection<RangedWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof RangedWeaponGURPS) rangedWeapons.set(item._id, item)
		}
		return rangedWeapons
	}

	get weapons(): Collection<BaseWeaponGURPS> {
		const weapons: Collection<BaseWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof BaseWeaponGURPS) weapons.set(item._id, item)
		}
		return weapons
	}

	get studyHours(): number {
		if (
			![ItemType.Trait, ItemType.Skill, ItemType.Technique, ItemType.Spell, ItemType.RitualMagicSpell].includes(
				this.type as ItemType
			)
		)
			return 0
		return (this.system as any).study
			.map((e: Study) => study.Type.multiplier(e.type))
			.reduce((partialSum: number, a: number) => partialSum + a, 0)
	}

	exportSystemData(_keepOther: boolean): any {
		const system: any = this.system
		system.name = this.name
		if (system.features)
			system.features = system.features.map((e: Feature) => {
				const { effective: _, ...rest } = e
				return rest
			})
		if ((this as any).children)
			system.children = (this as any).children.map((e: ItemGCS) => e.exportSystemData(false))
		if ((this as any).modifiers)
			system.modifiers = (this as any).modifiers.map((e: ItemGCS) => e.exportSystemData(false))
		if ((this as any).weapons)
			system.weapons = (this as any).weapons.map((e: BaseWeaponGURPS) => e.exportSystemData(false))
		// if (!keepOther) delete system.other
		return system
	}

	protected _getCalcValues(): this["system"]["calc"] {
		return {
			name: this.formattedName,
			indent: this.parents.length,
			resolved_notes: this.secondaryText,
		}
	}

	prepareDerivedData(): void {
		this.system.calc = this._getCalcValues()
	}
}
