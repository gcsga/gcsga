import { ItemDataModel } from "@module/data/abstract.ts"
import fields = foundry.data.fields
import { SkillDefault, SkillDefaultSchema, WeaponBonus } from "@system"
import { TooltipGURPS, feature, stdmg, wsel, wswitch } from "@util"
import { ItemTemplateType } from "../types.ts"
import { ActorType, ItemType } from "@module/data/constants.ts"
import { Nameable } from "@module/util/nameable.ts"
import { Feature } from "@system/feature/types.ts"

class AbstractWeaponTemplate extends ItemDataModel<AbstractWeaponTemplateSchema> {
	static override defineSchema(): AbstractWeaponTemplateSchema {
		const fields = foundry.data.fields
		return {
			strength: new fields.StringField({
				required: true,
				nullable: false,
				choices: stdmg.Options,
				initial: stdmg.Option.Thrust,
			}),
			defaults: new fields.ArrayField(new fields.SchemaField(SkillDefault.defineSchema())),
			damage: new fields.SchemaField(WeaponDamage.defineSchema()),
			unready: new fields.BooleanField({ required: true, nullable: false, initial: false }),
		}
	}

	get processedName(): string {
		if (this.parent.container === null || this.parent.container instanceof Promise) return ""
		if (!this.parent.container.hasTemplate(ItemTemplateType.BasicInformation)) return ""
		return this.parent.container.system.name
	}

	resolveBoolFlag(switchType: wswitch.Type, initial: boolean): boolean {
		const actor = this.actor
		if (actor === null) return initial

		let t = 0
		let f = 0
		for (const bonus of this.collectWeaponBonuses(1, null, feature.Type.WeaponSwitch)) {
			if (bonus.switch_type === switchType) {
				if (bonus.switch_type_value) t += 1
				else f += 1
			}
		}
		if (t > f) return true
		if (f > t) return false
		return initial
	}

	collectWeaponBonuses(
		dieCount: number,
		tooltip: TooltipGURPS | null,
		...allowedFeatureTypes: feature.Type[]
	): WeaponBonus[] {
		const actor = this.actor
		if (actor === null || !actor.isOfType(ActorType.Character)) return []
		// HACK: to remove if this requires proper async support
		if (this.parent.container === null || this.parent.container instanceof Promise) return []
		const parent = this.parent.container

		const allowed = new Set(allowedFeatureTypes)
		let bestDef: SkillDefault | null = null
		let best = Number.MIN_SAFE_INTEGER
		const replacements = this.nameableReplacements
		for (const one of this.defaults) {
			if (one.skillBased) {
				const level = one.skillLevelFast(actor, replacements, false, new Set(), true)
				if (level > best) {
					best = level
					bestDef = one
				}
			}
		}
		const bonusSet = new Set<WeaponBonus>()
		const tags = parent.hasTemplate(ItemTemplateType.BasicInformation) ? parent.system.tags : []
		let [name, specialization] = ["", ""]
		if (bestDef !== null) {
			name = bestDef.nameWithReplacements(replacements)
			specialization = bestDef.specializationWithReplacements(replacements)
		}
		actor.system.addWeaponWithSkillBonusesFor(
			name,
			specialization,
			this.usageWithReplacements,
			tags,
			dieCount,
			tooltip,
			bonusSet,
			allowed,
		)
		const nameQualifier = this.processedName
		actor.system.addNamedWeaponBonusesFor(
			nameQualifier,
			this.usageWithReplacements,
			tags,
			dieCount,
			tooltip,
			bonusSet,
			allowed,
		)
		if (parent.hasTemplate(ItemTemplateType.Feature)) {
			for (const f of parent.system.features) {
				this.extractWeaponBonus(f, bonusSet, allowed, dieCount, tooltip)
			}
			if (parent.isOfType(ItemType.Trait, ItemType.Equipment, ItemType.EquipmentContainer)) {
				for (const mod of parent.system.allModifiers) {
					for (const f of mod.system.features) {
						const bonus = f.clone()
						bonus.subOwner = mod
						this.extractWeaponBonus(bonus, bonusSet, allowed, dieCount, tooltip)
					}
				}
			}
		}
		if (bonusSet.size === 0) return []
		return [...bonusSet]
	}

	extractWeaponBonus(
		f: Feature,
		set: Set<WeaponBonus>,
		allowedFeatureTypes: Set<feature.Type>,
		dieCount: number,
		tooltip: TooltipGURPS | null = null,
	): void {
		let tags: string[] = []
		if (
			this.parent.container !== null &&
			!(this.parent.container instanceof Promise) &&
			this.parent.container.hasTemplate(ItemTemplateType.BasicInformation)
		)
			tags = this.parent.container.system.tags

		if (allowedFeatureTypes.has(f.type)) {
			if (f.isOfType(...feature.WeaponBonusTypes)) {
				const savedLevel = f.featureLevel
				const savedDieCount = f.dieCount
				f.featureLevel = f.derivedLevel
				f.dieCount = dieCount
				const replacements = this.nameableReplacements

				switch (f.selection_type) {
					case wsel.Type.WithRequiredSkill:
						break
					case wsel.Type.ThisWeapon:
						{
							if (f.specialization.matches(replacements, this.usageWithReplacements)) {
								if (!set.has(f)) {
									set.add(f)
									f.addToTooltip(tooltip)
								}
							}
						}
						break
					case wsel.Type.WithName: {
						if (
							f.name.matches(replacements, this.processedName) &&
							f.specialization.matches(replacements, this.usageWithReplacements) &&
							f.tags.matchesList(replacements, ...tags)
						) {
							if (!set.has(f)) {
								set.add(f)
								f.addToTooltip(tooltip)
							}
						}
					}
				}
				f.featureLevel = savedLevel
				f.dieCount = savedDieCount
			}
		}
	}

	get usageWithReplacements(): string {
		if (!this.hasTemplate(ItemTemplateType.BasicInformation)) return ""
		return Nameable.apply(this.name, this.nameableReplacements)
	}
}

interface AbstractWeaponTemplate
	extends ItemDataModel<AbstractWeaponTemplateSchema>,
		Omit<ModelPropsFromSchema<AbstractWeaponTemplateSchema>, "defaults"> {
	constructor: typeof AbstractWeaponTemplate
	nameableReplacements: Map<string, string>
	defaults: SkillDefault[]
	tags: string[]
}

type AbstractWeaponTemplateSchema = {
	strength: fields.StringField<string, string, true, false, true>
	defaults: fields.ArrayField<fields.SchemaField<SkillDefaultSchema>>
	damage: fields.SchemaField<WeaponDamageSchema>
	unready: fields.BooleanField<boolean, boolean>
}

export { AbstractWeaponTemplate, type AbstractWeaponTemplateSchema }
