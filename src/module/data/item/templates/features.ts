import fields = foundry.data.fields
import { SystemDataModel } from "@module/data/abstract.ts"
import { Feature, FeatureSet, FeatureTypes } from "@module/data/feature/types.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { ActiveEffectGURPS } from "@module/document/active-effect.ts"
import { ErrorGURPS, feature } from "@util"
import { ItemType } from "@module/data/constants.ts"
import { DRBonus } from "@module/data/feature/dr-bonus.ts"

class FeatureTemplate extends SystemDataModel<ItemGURPS2 | ActiveEffectGURPS, FeatureTemplateSchema> {
	static override defineSchema(): FeatureTemplateSchema {
		const fields = foundry.data.fields
		return {
			features: new fields.ArrayField(new fields.TypedSchemaField(FeatureTypes)),
		}
	}

	addFeaturesToSet(featureSet: FeatureSet): void {
		for (const f of this.features) {
			this._addFeatureToSet(f, featureSet)
		}
	}

	protected _addFeatureToSet(f: Feature, featureSet: FeatureSet, levels = 0): void {
		f.featureLevel = levels

		switch (true) {
			case f.isOfType(feature.Type.AttributeBonus):
				featureSet.attributeBonuses.push(f)
				break
			case f.isOfType(feature.Type.CostReduction):
				featureSet.costReductions.push(f)
				break
			case f.isOfType(feature.Type.SkillBonus):
				featureSet.skillBonuses.push(f)
				break
			case f.isOfType(feature.Type.SkillPointBonus):
				featureSet.skillPointBonuses.push(f)
				break
			case f.isOfType(feature.Type.SpellBonus):
				featureSet.spellBonuses.push(f)
				break
			case f.isOfType(feature.Type.SpellPointBonus):
				featureSet.spellPointBonuses.push(f)
				break
			case f.isOfType(...feature.WeaponBonusTypes):
				featureSet.weaponBonuses.push(f)
				break
			case f.isOfType(
				feature.Type.ConditionalModifierBonus,
				feature.Type.ContainedWeightReduction,
				feature.Type.ReactionBonus,
			):
				break
			case f.isOfType(feature.Type.DRBonus): {
				// Option "This Armor"
				if (f.locations.length === 0) {
					if (
						this.parent instanceof ItemGURPS2 &&
						this.parent.isOfType(ItemType.Equipment, ItemType.EquipmentContainer)
					) {
						const allLocations = new Set<string>()
						const locationsMatched = new Set<string>()
						for (const f2 of this.features) {
							if (f2.isOfType(feature.Type.DRBonus) && f2.locations.length !== 0) {
								for (const loc of f2.locations) {
									allLocations.add(loc)
								}
								if (f2.specialization === f.specialization) {
									for (const loc of f2.locations) {
										locationsMatched.add(loc)
									}
									const additionalDRBonus = new DRBonus({
										type: feature.Type.DRBonus,
										locations: f2.locations,
										specialization: f.specialization,
										amount: f.amount,
										per_level: f.per_level,
									})
									// additionalDRBonus.owner = owner
									// additionalDRBonus.subOwner = subOwner
									additionalDRBonus.featureLevel = levels
									featureSet.drBonuses.push(additionalDRBonus)
								}
							}
						}
					}
				}
				break
			}
			default:
				throw ErrorGURPS(`Unhandled feature type: "${f.type}"`)
		}
	}

	protected _fillWithNameableKeysFromFeatures(m: Map<string, string>, existing: Map<string, string>): void {
		for (const feature of this.features) {
			feature.fillWithNameableKeys(m, existing)
		}
	}
}

interface FeatureTemplate extends ModelPropsFromSchema<FeatureTemplateSchema> {
	features: Feature[]
}

type FeatureTemplateSchema = {
	features: fields.ArrayField<fields.TypedSchemaField<Record<feature.Type, ConstructorOf<Feature>>>>
}

export { FeatureTemplate, type FeatureTemplateSchema }
