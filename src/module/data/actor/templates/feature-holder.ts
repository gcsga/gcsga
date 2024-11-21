import { ActorDataModel } from "@module/data/actor/abstract.ts"
import { ActorType, EffectType, gid } from "@module/data/constants.ts"
import { SkillBonus, WeaponBonus } from "@module/data/feature/index.ts"
import { MoveBonusType } from "@module/data/feature/move-bonus.ts"
import { FeatureSet } from "@module/data/feature/types.ts"
import { equalFold } from "@module/data/item/components/index.ts"
import { ItemTemplateType } from "@module/data/item/types.ts"
import { SheetSettings } from "@module/data/sheet-settings.ts"
import { MaybePromise } from "@module/data/types.ts"
import { Nameable } from "@module/util/index.ts"
import { TooltipGURPS, feature, skillsel, stlimit, wsel } from "@util"

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

	processFeatures(): MaybePromise<void> {
		const features: FeatureSet = {
			attributeBonuses: [],
			costReductions: [],
			drBonuses: [],
			skillBonuses: [],
			skillPointBonuses: [],
			spellBonuses: [],
			spellPointBonuses: [],
			weaponBonuses: [],
			moveBonuses: [],
		}

		this.parent.items.forEach(item => {
			if (item.hasTemplate(ItemTemplateType.Feature)) item.system.addFeaturesToSet(features)
		})
		this.parent.effects.forEach(effect => {
			if (effect.isOfType(EffectType.Effect, EffectType.Condition)) effect.system.addFeaturesToSet(features)
		})
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
		temporary: boolean | null = null,
	): number {
		let total = 0
		for (const bonus of this.features.attributeBonuses) {
			if (
				bonus.actualLimitation === limitation &&
				bonus.attribute === attributeId &&
				(temporary === null || bonus.temporary === temporary)
			) {
				total += bonus.adjustedAmount
				bonus.addToTooltip(tooltip)
			}
		}
		return total
	}

	/**
	 * @param moveTypeId - ID of move type
	 * @param limitation - Strength attribute limitation
	 * @param tooltip - Tooltip to append bonus annotation to
	 * @param temporary - Is this feature provided by a temporary active effect?
	 * @returns Total bonus value
	 */
	moveBonusFor(
		moveTypeId: string,
		limitation: MoveBonusType,
		tooltip: TooltipGURPS | null = null,
		temporary: boolean | null = null,
	): number {
		let total = 0
		if (this.features)
			for (const bonus of this.features.moveBonuses) {
				if (
					bonus.limitation === limitation &&
					bonus.move_type === moveTypeId &&
					(temporary === null || bonus.temporary === temporary)
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
	costReductionFor(attributeId: string, temporary: boolean | null = null): number {
		let total = 0
		for (const bonus of this.features.costReductions) {
			if (bonus.attribute === attributeId && (temporary === null || bonus.temporary === temporary)) {
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
		tooltip: TooltipGURPS | null,
		drMap: Map<string, number> = new Map(),
		temporary: boolean | null = null,
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
					(temporary === null || bonus.temporary === temporary)
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
		temporary: boolean | null = null,
	): number {
		let total = 0
		for (const bonus of this.features.skillBonuses) {
			if (bonus.selection_type === skillsel.Type.Name) {
				let replacements: Map<string, string> = new Map()
				const na = bonus.owner
				if (Nameable.isAccesser(na)) {
					replacements = na.replacements
				}
				if (
					bonus.name.matches(replacements, name) &&
					bonus.specialization.matches(replacements, specialization) &&
					bonus.tags.matchesList(replacements, ...tags) &&
					(temporary === null || bonus.temporary === temporary)
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
		temporary: boolean | null = null,
	): number {
		let total = 0
		for (const bonus of this.features.skillPointBonuses) {
			let replacements: Map<string, string> = new Map()
			const na = bonus.owner
			if (Nameable.isAccesser(na)) {
				replacements = na.replacements
			}
			if (
				bonus.name.matches(replacements, name) &&
				bonus.specialization.matches(replacements, specialization) &&
				bonus.tags.matchesList(replacements, ...tags) &&
				(temporary === null || bonus.temporary === temporary)
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
		temporary: boolean | null = null,
	): number {
		let total = 0
		for (const bonus of this.features.spellBonuses) {
			let replacements: Map<string, string> = new Map()
			const na = bonus.owner
			if (Nameable.isAccesser(na)) {
				replacements = na.replacements
			}
			if (
				bonus.tags.matchesList(replacements, ...tags) &&
				bonus.matchForType(replacements, name, powerSource, colleges) &&
				(temporary === null || bonus.temporary === temporary)
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
		temporary: boolean | null = null,
	): number {
		let total = 0
		for (const bonus of this.features.spellPointBonuses) {
			let replacements: Map<string, string> = new Map()
			const na = bonus.owner
			if (Nameable.isAccesser(na)) {
				replacements = na.replacements
			}
			if (
				bonus.tags.matchesList(replacements, ...tags) &&
				bonus.matchForType(replacements, name, powerSource, colleges) &&
				(temporary === null || bonus.temporary === temporary)
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
		temporary: boolean | null = null,
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
				bonus.level?.matches(rsl) &&
				(temporary === null || bonus.temporary === temporary)
			) {
				let replacements: Map<string, string> = new Map()
				const na = bonus.owner
				if (Nameable.isAccesser(na)) {
					replacements = na.replacements
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
		temporary: boolean | null = null,
	): void {
		for (const bonus of this.features.weaponBonuses) {
			if (
				allowedFeatureTypes.has(bonus.type) &&
				bonus.selection_type === wsel.Type.WithName &&
				(temporary === null || bonus.temporary === temporary)
			) {
				let replacements: Map<string, string> = new Map()
				const na = bonus.owner
				if (Nameable.isAccesser(na)) {
					replacements = na.replacements
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

	namedWeaponSkillBonusesFor(
		name: string,
		usage: string,
		tags: string[],
		temporary: boolean,
		tooltip: TooltipGURPS | null,
	): SkillBonus[] {
		const bonuses: SkillBonus[] = []
		for (const bonus of this.features.skillBonuses) {
			if (bonus.selection_type === skillsel.Type.Name) {
				let replacements: Map<string, string> = new Map()
				const na = bonus.owner
				if (Nameable.isAccesser(na)) {
					replacements = na.replacements
				}
				if (
					bonus.name.matches(replacements, name) &&
					bonus.specialization.matches(replacements, usage) &&
					bonus.tags.matchesList(replacements, ...tags) &&
					(temporary === null || bonus.temporary === temporary)
				) {
					bonuses.push(bonus)
					bonus.addToTooltip(tooltip)
				}
			}
		}
		return bonuses
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

interface FeatureHolderTemplate extends ModelPropsFromSchema<FeatureHolderTemplateSchema> {}

type FeatureHolderTemplateSchema = {}

export { FeatureHolderTemplate, type FeatureHolderTemplateSchema }
