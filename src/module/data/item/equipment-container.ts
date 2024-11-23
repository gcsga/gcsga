import { ItemType } from "../constants.ts"
import { FeatureSet } from "../feature/types.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { ItemTemplateType } from "./types.ts"
import { MaybePromise } from "../types.ts"
import { ItemInst } from "./helpers.ts"
import { ItemDataModel } from "./abstract.ts"
import { Nameable } from "@module/util/nameable.ts"
import {
	ActionTemplate,
	BasicInformationTemplate,
	ContainerTemplate,
	EquipmentFieldsTemplate,
	FeatureTemplate,
	PrereqTemplate,
	ReplacementTemplate,
} from "./templates/index.ts"

class EquipmentContainerData extends ItemDataModel.mixin(
	ActionTemplate,
	BasicInformationTemplate,
	PrereqTemplate,
	FeatureTemplate,
	ContainerTemplate,
	ReplacementTemplate,
	EquipmentFieldsTemplate,
) {
	static override childTypes = new Set([ItemType.Equipment, ItemType.EquipmentContainer])
	static override modifierTypes = new Set([ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer])
	// static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-equipment", "gurps.details-prereqs", "gurps.details-features"]
		context.embedsParts = [
			"gurps.embeds-equipment-modifier",
			"gurps.embeds-attack-melee",
			"gurps.embeds-attack-ranged",
			"gurps.embeds-equipment",
		]
	}

	override get extendedValue(): MaybePromise<number> {
		if (this.quantity <= 0) return 0
		if (this.parent?.pack) return this.#extendedValue()

		let value = this.adjustedValue as number
		const children = this.children as Collection<ItemGURPS2>
		for (const child of children) {
			if (child.hasTemplate(ItemTemplateType.EquipmentFields)) value += child.system.extendedValue as number
		}
		return value * this.quantity
	}

	async #extendedValue(): Promise<number> {
		let value = await this.adjustedValue
		const children = this.children as Collection<ItemGURPS2>
		for (const child of children) {
			if (child.hasTemplate(ItemTemplateType.EquipmentFields)) value += await child.system.extendedValue
		}
		return value * this.quantity
	}

	override get allModifiers(): MaybePromise<Collection<ItemInst<ItemType.EquipmentModifier>>> {
		if (!this.parent) return new Collection()
		if (this.parent.pack) return this.#allModifiers()

		const allModifiers = new Collection<ItemInst<ItemType.EquipmentModifier>>()

		for (const item of this.contents as Collection<ItemGURPS2>) {
			if (item.type === ItemType.EquipmentModifier)
				allModifiers.set(item.id, <ItemInst<ItemType.EquipmentModifier>>item)

			if (item.hasTemplate(ItemTemplateType.Container))
				for (const contents of <Collection<ItemGURPS2>>item.system.allContents) {
					if (contents.type === ItemType.EquipmentModifier)
						allModifiers.set(contents.id, <ItemInst<ItemType.EquipmentModifier>>contents)
				}
		}
		return allModifiers
	}

	async #allModifiers(): Promise<Collection<ItemInst<ItemType.EquipmentModifier>>> {
		const allModifiers = new Collection<ItemInst<ItemType.EquipmentModifier>>()

		for (const item of <Collection<ItemGURPS2>>(this as any).contents) {
			if (item.type === ItemType.EquipmentModifier)
				allModifiers.set(item.id, <ItemInst<ItemType.EquipmentModifier>>item)

			if (item.hasTemplate(ItemTemplateType.Container))
				for (const contents of await item.system.allContents) {
					if (contents.type === ItemType.EquipmentModifier)
						allModifiers.set(contents.id, <ItemInst<ItemType.EquipmentModifier>>contents)
				}
		}
		return allModifiers
	}

	/** Features */
	override addFeaturesToSet(featureSet: FeatureSet): void {
		if (!this.equipped) return

		for (const f of this.features) {
			this._addFeatureToSet(f, featureSet, 0)
		}
	}

	/** Nameables */
	override fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string> = this.replacements): void {
		super.fillWithNameableKeys(m, existing)

		Nameable.extract(this.notes, m, existing)

		this._fillWithNameableKeysFromPrereqs(m, existing)
		this._fillWithNameableKeysFromFeatures(m, existing)
		this._fillWithNameableKeysFromEmbeds(m, existing)
	}
}

interface EquipmentContainerData {
	get children(): MaybePromise<Collection<ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>>>
	get modifiers(): MaybePromise<
		Collection<ItemInst<ItemType.EquipmentModifier | ItemType.EquipmentModifierContainer>>
	>
	// get weapons(): MaybePromise<Collection<ItemInst<ItemType.WeaponMelee | ItemType.WeaponRanged>>>
}

export { EquipmentContainerData }
