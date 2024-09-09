import { ActorDataModel } from "@module/data/abstract.ts"
import { ActorType, ItemType, gid } from "@module/data/constants.ts"
import { equalFold } from "@module/util/index.ts"
import { Nameable } from "@module/util/nameable.ts"
import {
	AttributeBonus,
	CostReduction,
	DRBonus,
	SkillBonus,
	SkillPointBonus,
	SpellBonus,
	SpellPointBonus,
	WeaponBonus,
	MoveBonus,
	SheetSettings,
} from "@system"
import { Feature } from "@system/feature/types.ts"
import { ErrorGURPS, TooltipGURPS, feature, selfctrl, skillsel, stlimit, wsel } from "@util"

class FeatureHolderTemplate extends ActorDataModel<FeatureHolderTemplateSchema> {
	declare features: FeatureSet

	static override defineSchema(): FeatureHolderTemplateSchema {
		return {}
	}

	// Placeholder used for size modifier bonus
	get baseSizeModifier(): number {
		return 0
	}

	get adjustedSizeModifier(): number {
		return this.baseSizeModifier + this.attributeBonusFor(gid.SizeModifier)
	}

	prepareEmbeddedDocuments(): void {}

	processFeatures(): void {
		const itemCollections = this.parent.itemCollections
		itemCollections.traits.forEach(trait => {
			let levels = 0
			if (trait.isOfType(ItemType.Trait)) {
				if (trait.system.isLeveled) levels = Math.max(trait.system.levels, 0)
				for (const f of trait.system.features) this._processFeature(trait, null, f, levels)
				for (const f of featuresForSelfControlRoll(trait.system.cr, trait.system.cr_adj))
					this._processFeature(trait, null, f, levels)
				trait.system.allModifiers.forEach(mod => {
					for (const f of mod.system.features) this._processFeature(mod, null, f, mod.system.currentLevel)
				})
			}
		})
		itemCollections.skills.forEach(skill => {
			if (skill.isOfType(ItemType.Skill, ItemType.Technique)) {
				for (const f of skill.system.features) this._processFeature(skill, null, f, skill.system.level.level)
			}
		})
		itemCollections.carriedEquipment.forEach(equipment => {
			if (!equipment.system.equipped || equipment.system.quantity <= 0) return
			for (const f of equipment.system.features)
				this._processFeature(equipment, null, f, Math.max(equipment.system.level, 0))
			equipment.system.allModifiers.forEach(mod => {
				for (const f of mod.system.features)
					this._processFeature(mod, null, f, Math.max(equipment.system.level, 0))
			})
		})
		itemCollections.effects.forEach(effect => {
			for (const f of effect.system.features) this._processFeature(effect, null, f, effect.system.levels.current)
		})
	}

	private _processFeature(
		owner: Feature["owner"],
		subOwner: Feature["subOwner"],
		bonus: Feature,
		levels: number,
	): void {
		bonus.owner = owner
		bonus.subOwner = subOwner
		bonus.featureLevel = levels

		switch (true) {
			case bonus.isOfType(feature.Type.AttributeBonus):
				this.features.attributeBonuses.push(bonus)
				break
			case bonus.isOfType(feature.Type.CostReduction):
				this.features.costReductions.push(bonus)
				break
			case bonus.isOfType(feature.Type.DRBonus):
				{
					// "this armor"
					if (bonus.locations.length === 0) {
						const eqp = bonus.owner
						if (eqp?.isOfType(ItemType.Equipment, ItemType.EquipmentContainer)) {
							const allLocations = new Set<string>()
							const locationsMatched = new Set<string>()
							for (const f2 of eqp.system.features) {
								if (f2.isOfType(feature.Type.DRBonus) && f2.locations.length !== 0) {
									for (const loc of f2.locations) {
										allLocations.add(loc)
									}
									if (f2.specialization === bonus.specialization) {
										for (const loc of f2.locations) {
											locationsMatched.add(loc)
										}
										const additionalDRBonus = new DRBonus({
											type: feature.Type.DRBonus,
											locations: f2.locations,
											specialization: bonus.specialization,
											amount: bonus.amount,
											per_level: bonus.per_level,
										})
										additionalDRBonus.owner = owner
										additionalDRBonus.subOwner = subOwner
										additionalDRBonus.featureLevel = levels
										this.features.drBonuses.push(additionalDRBonus)
									}
								}
							}
							locationsMatched.forEach(e => {
								allLocations.delete(e)
							})
							if (allLocations.size !== 0) {
								const locations = Array.from(allLocations)
								const additionalDRBonus = new DRBonus({
									type: feature.Type.DRBonus,
									locations,
									specialization: bonus.specialization,
									amount: bonus.amount,
									per_level: bonus.per_level,
								})
								additionalDRBonus.owner = owner
								additionalDRBonus.subOwner = subOwner
								additionalDRBonus.featureLevel = levels
								this.features.drBonuses.push(additionalDRBonus)
							}
						}
					} else {
						this.features.drBonuses.push(bonus)
					}
				}
				break
			case bonus.isOfType(feature.Type.SkillBonus):
				this.features.skillBonuses.push(bonus)
				break
			case bonus.isOfType(feature.Type.SkillPointBonus):
				this.features.skillPointBonuses.push(bonus)
				break
			case bonus.isOfType(feature.Type.SpellBonus):
				this.features.spellBonuses.push(bonus)
				break
			case bonus.isOfType(feature.Type.SpellPointBonus):
				this.features.spellPointBonuses.push(bonus)
				break
			case bonus.isOfType(...feature.WeaponBonusTypes):
				this.features.weaponBonuses.push(bonus)
				break
			case bonus.isOfType(
				feature.Type.ConditionalModifierBonus,
				feature.Type.ContainedWeightReduction,
				feature.Type.ReactionBonus,
			):
				break
			default:
				throw ErrorGURPS(`Unhandled feature type: "${bonus.type}"`)
		}
	}

	/**
	 * @param attributeId - ID of attribute
	 * @param limitation - Strength attribute limitation
	 * @param tooltip - Tooltip to append bonus annotation to
	 * @param temporary - Is this feature provided by a temporary active effect?
	 * @returns Total bonus value
	 */
	attributeBonusFor(
		attributeId: string,
		limitation: stlimit.Option = stlimit.Option.None,
		tooltip: TooltipGURPS | null = null,
		temporary = false,
	): number {
		let total = 0
		for (const bonus of this.features.attributeBonuses) {
			if (
				bonus.actualLimitation === limitation &&
				bonus.attribute === attributeId &&
				bonus.temporary === temporary
			) {
				total += bonus.adjustedAmount
				bonus.addToTooltip(tooltip)
			}
		}
		return total
	}

	/**
	 * @param attributeId - ID of attribute
	 * @param temporary - Is this feature provided by a temporary active effect?
	 * @returns Total bonus value
	 */
	costReductionFor(attributeId: string, temporary = false): number {
		let total = 0
		for (const bonus of this.features.costReductions) {
			if (bonus.attribute === attributeId && bonus.temporary === temporary) {
				total += bonus.adjustedAmount
			}
		}
		return total
	}

	/**
	 * @param locationId - ID of location
	 * @param tooltip - Tooltip to append to
	 * @param drMap - Existing DR map
	 * @param temporary - Is this bonus provided by a temporary active effect?
	 */
	addDRBonusesFor(
		locationId: string,
		tooltip: TooltipGURPS,
		drMap: Map<string, number> = new Map(),
		temporary = false,
	): Map<string, number> {
		let isTopLevel = false
		for (const location of SheetSettings.for(this.parent).body_type.locations) {
			if (location.id === locationId) {
				isTopLevel = true
				break
			}
		}
		for (const bonus of this.features.drBonuses) {
			for (const location of bonus.locations) {
				if (
					((location === gid.All && isTopLevel) || equalFold(location, locationId)) &&
					bonus.temporary === temporary
				) {
					const spec = bonus.specialization.toLowerCase()
					drMap.set(spec, (drMap.get(spec) ?? 0) + bonus.adjustedAmount)
					bonus.addToTooltip(tooltip)
					break
				}
			}
		}
		return drMap
	}

	/**
	 * @param name - Name of skill/technique
	 * @param specialization - Specialization of skill/technique. Can be blank
	 * @param tags - Tags of skill/technique.
	 * @param tooltip - Reference to tooltip to which bonuses are appended
	 * @param temporary - Is this feature provided by a temporary active effect?
	 * @returns Total skill level bonus for the provided Skill(s).
	 */
	skillBonusFor(
		name: string,
		specialization: string,
		tags: string[],
		tooltip: TooltipGURPS | null = null,
		temporary = false,
	): number {
		let total = 0
		for (const bonus of this.features.skillBonuses) {
			if (bonus.selection_type === skillsel.Type.Name) {
				let replacements: Map<string, string> = new Map()
				const na = bonus.owner
				if (Nameable.isAccesser(na)) {
					replacements = na.nameableReplacements
				}
				if (
					bonus.name.matches(replacements, name) &&
					bonus.specialization.matches(replacements, specialization) &&
					bonus.tags.matchesList(replacements, ...tags) &&
					bonus.temporary === temporary
				) {
					total += bonus.adjustedAmount
					bonus.addToTooltip(tooltip)
				}
			}
		}
		return total
	}

	/**
	 * @param name - Name of skill/technique
	 * @param specialization - Specialization of skill/technique. Can be blank
	 * @param tags - Tags of skill/technique.
	 * @param tooltip - Reference to tooltip to which bonuses are appended
	 * @param temporary - Is this feature provided by a temporary active effect?
	 * @returns Total skill level bonus for the provided Skill(s).
	 */
	skillPointBonusFor(
		name: string,
		specialization: string,
		tags: string[],
		tooltip: TooltipGURPS | null = null,
		temporary = false,
	): number {
		let total = 0
		for (const bonus of this.features.skillPointBonuses) {
			let replacements: Map<string, string> = new Map()
			const na = bonus.owner
			if (Nameable.isAccesser(na)) {
				replacements = na.nameableReplacements
			}
			if (
				bonus.name.matches(replacements, name) &&
				bonus.specialization.matches(replacements, specialization) &&
				bonus.tags.matchesList(replacements, ...tags) &&
				bonus.temporary === temporary
			) {
				total += bonus.adjustedAmount
				bonus.addToTooltip(tooltip)
			}
		}
		return total
	}

	spellBonusFor(
		name: string,
		powerSource: string,
		colleges: string[],
		tags: string[],
		tooltip: TooltipGURPS | null = null,
		temporary = false,
	): number {
		let total = 0
		for (const bonus of this.features.spellBonuses) {
			let replacements: Map<string, string> = new Map()
			const na = bonus.owner
			if (Nameable.isAccesser(na)) {
				replacements = na.nameableReplacements
			}
			if (
				bonus.tags.matchesList(replacements, ...tags) &&
				bonus.matchForType(replacements, name, powerSource, colleges) &&
				bonus.temporary === temporary
			) {
				total += bonus.adjustedAmount
				bonus.addToTooltip(tooltip)
			}
		}
		return total
	}

	spellPointBonusFor(
		name: string,
		powerSource: string,
		colleges: string[],
		tags: string[],
		tooltip: TooltipGURPS | null = null,
		temporary = false,
	): number {
		let total = 0
		for (const bonus of this.features.spellPointBonuses) {
			let replacements: Map<string, string> = new Map()
			const na = bonus.owner
			if (Nameable.isAccesser(na)) {
				replacements = na.nameableReplacements
			}
			if (
				bonus.tags.matchesList(replacements, ...tags) &&
				bonus.matchForType(replacements, name, powerSource, colleges) &&
				bonus.temporary === temporary
			) {
				total += bonus.adjustedAmount
				bonus.addToTooltip(tooltip)
			}
		}
		return total
	}

	addWeaponWithSkillBonusesFor(
		name: string,
		specialization: string,
		usage: string,
		tags: string[],
		dieCount: number,
		tooltip: TooltipGURPS | null = null,
		m: Set<WeaponBonus> = new Set(),
		allowedFeatureTypes: Set<feature.Type> = new Set(),
		temporary = false,
	): Set<WeaponBonus> {
		if (!this.isOfType(ActorType.Character)) {
			console.error(`Adding weapon bonuses for actor type "${this.parent.type}" is not yet supported.`)
			return m
		}
		let rsl = Number.MIN_SAFE_INTEGER
		for (const sk of this.skillNamed(name, specialization, true)) {
			if (rsl < sk.system.level.relativeLevel) rsl = sk.system.level.relativeLevel
		}
		for (const bonus of this.features.weaponBonuses) {
			if (
				allowedFeatureTypes.has(bonus.type) &&
				bonus.selection_type === wsel.Type.WithRequiredSkill &&
				bonus.level.matches(rsl) &&
				bonus.temporary === temporary
			) {
				let replacements: Map<string, string> = new Map()
				const na = bonus.owner
				if (Nameable.isAccesser(na)) {
					replacements = na.nameableReplacements
				}
				if (
					bonus.name.matches(replacements, name) &&
					bonus.specialization.matches(replacements, specialization) &&
					bonus.usage.matches(replacements, usage) &&
					bonus.tags.matchesList(replacements, ...tags)
				) {
					addWeaponBonusToSet(bonus, dieCount, tooltip, m)
				}
			}
		}
		return m
	}

	addNamedWeaponBonusesFor(
		name: string,
		usage: string,
		tags: string[],
		dieCount: number,
		tooltip: TooltipGURPS | null = null,
		m: Set<WeaponBonus> = new Set(),
		allowedFeatureTypes: Set<feature.Type> = new Set(),
		temporary = false,
	): void {
		for (const bonus of this.features.weaponBonuses) {
			if (
				allowedFeatureTypes.has(bonus.type) &&
				bonus.selection_type === wsel.Type.WithName &&
				bonus.temporary === temporary
			) {
				let replacements: Map<string, string> = new Map()
				const na = bonus.owner
				if (Nameable.isAccesser(na)) {
					replacements = na.nameableReplacements
				}
				if (
					bonus.name.matches(replacements, name) &&
					bonus.specialization.matches(replacements, usage) &&
					bonus.tags.matchesList(replacements, ...tags)
				) {
					addWeaponBonusToSet(bonus, dieCount, tooltip, m)
				}
			}
		}
	}
}

function addWeaponBonusToSet(
	bonus: WeaponBonus,
	dieCount: number,
	tooltip: TooltipGURPS | null = null,
	m: Set<WeaponBonus>,
): void {
	const savedLevel = bonus.featureLevel
	const savedDieCount = bonus.dieCount
	bonus.dieCount = dieCount
	bonus.featureLevel = bonus.derivedLevel
	bonus.addToTooltip(tooltip)
	bonus.featureLevel = savedLevel
	bonus.dieCount = savedDieCount
	m.add(bonus)
}

function featuresForSelfControlRoll(cr: selfctrl.Roll, adj: selfctrl.Adjustment): Feature[] {
	if (adj !== selfctrl.Adjustment.MajorCostOfLivingIncrease) return []

	const f = new SkillBonus({ name: { qualifier: "Merchant" }, amount: selfctrl.Roll.penalty(cr) })
	return [f]
}

interface FeatureHolderTemplate extends ModelPropsFromSchema<FeatureHolderTemplateSchema> {}

type FeatureHolderTemplateSchema = {}

type FeatureSet = {
	attributeBonuses: AttributeBonus[]
	costReductions: CostReduction[]
	drBonuses: DRBonus[]
	skillBonuses: SkillBonus[]
	skillPointBonuses: SkillPointBonus[]
	spellBonuses: SpellBonus[]
	spellPointBonuses: SpellPointBonus[]
	weaponBonuses: WeaponBonus[]
	moveBonuses: MoveBonus[]
}

export { FeatureHolderTemplate, type FeatureHolderTemplateSchema }
