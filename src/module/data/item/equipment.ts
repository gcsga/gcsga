import { ItemType } from "@module/data/constants.ts"
import { EquipmentFieldsTemplate } from "./templates/equipment-fields.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { MaybePromise } from "../types.ts"
import { ItemInst } from "./helpers.ts"
import { ItemTemplateType } from "./types.ts"
import { ItemDataModel } from "./abstract.ts"
import { BasicInformationTemplate } from "./templates/basic-information.ts"
import { ContainerTemplate } from "./templates/container.ts"
import { FeatureTemplate } from "./templates/features.ts"
import { PrereqTemplate } from "./templates/prereqs.ts"
import { ReplacementTemplate } from "./templates/replacements.ts"
import { FeatureSet } from "../feature/types.ts"
import { Nameable } from "@module/util/nameable.ts"

class EquipmentData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	FeatureTemplate,
	ContainerTemplate,
	ReplacementTemplate,
	EquipmentFieldsTemplate,
) {
	static override modifierTypes = new Set([ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer])
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-equipment", "gurps.details-prereqs", "gurps.details-features"]
		context.embedsParts = [
			"gurps.embeds-effect",
			"gurps.embeds-equipment-modifier",
			"gurps.embeds-weapon-melee",
			"gurps.embeds-weapon-ranged",
		]
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
	override fillWithNameableKeys(
		m: Map<string, string>,
		existing: Map<string, string> = this.nameableReplacements,
	): void {
		super.fillWithNameableKeys(m, existing)

		Nameable.extract(this.notes, m, existing)

		this._fillWithNameableKeysFromPrereqs(m, existing)
		this._fillWithNameableKeysFromFeatures(m, existing)
		this._fillWithNameableKeysFromEmbeds(m, existing)
	}
}

interface EquipmentData {
	get weapons(): MaybePromise<Collection<ItemInst<ItemType.WeaponMelee | ItemType.WeaponRanged>>>
}

export { EquipmentData }
