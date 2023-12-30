import { FeatureType, SkillBonus, WeaponBonus, WeaponBonusType, wsel } from "@feature"
import { BaseItemGURPS } from "@item/base"
import { ContainerGURPS } from "@item/container"
import { Bonus, Feature } from "@module/config"
import { ActorType, gid, ItemType } from "@module/data"
import { SkillDefault } from "@module/default"
import { TooltipGURPS } from "@module/tooltip"
import { LocalizeGURPS, stringCompare } from "@util"
import { HandlebarsHelpersGURPS } from "@util/handlebars_helpers"
import { WeaponDamage } from "./damage"
import { BaseWeaponSource, wswitch } from "./data"
import { Int } from "@util/fxp"
import { ItemGCS } from "@item/gcs"
import { CharacterGURPS } from "@actor"
import { TraitGURPS } from "@item/trait"
import { EquipmentGURPS } from "@item/equipment"
import { EquipmentContainerGURPS, TraitContainerGURPS } from "@item"
import { WeaponStrength } from "./weapon_strength"

export class BaseWeaponGURPS<SourceType extends BaseWeaponSource = BaseWeaponSource> extends BaseItemGURPS<SourceType> {
	get itemName(): string {
		if (this.container instanceof Item) return this.container?.name ?? ""
		return ""
	}

	get formattedName(): string {
		return this.system.usage
	}

	get usage(): string {
		return this.system.usage
	}

	get strength(): WeaponStrength {
		return WeaponStrength.parse(this.system.strength)
	}

	override get actor(): CharacterGURPS | null {
		const actor = super.actor
		if (actor?.type === ActorType.Character) return actor as CharacterGURPS
		return null
	}

	get secondaryText(): string {
		let outString = '<div class="item-notes">'
		if (this.container) {
			outString += HandlebarsHelpersGURPS.format((this.container as any).notes)
			if (this.system.usage_notes) outString += "<br>"
		}
		if (this.system.usage_notes) outString += HandlebarsHelpersGURPS.format(this.system.usage_notes)
		outString += "</div>"
		return outString
	}

	get level(): number {
		return this.skillLevel()
	}

	get equipped(): boolean {
		if (!this.actor) return false
		if ([ItemType.Equipment, ItemType.EquipmentContainer].includes((this.container as any)?.type))
			return (this.container as any).equipped
		if ([ItemType.Trait, ItemType.TraitContainer].includes((this.container as any)?.type))
			return (this.container as any).enabled
		return true
	}

	get defaults(): SkillDefault[] {
		if (this.system.hasOwnProperty("defaults")) {
			const defaults: SkillDefault[] = []
			const list = (this.system as any).defaults
			for (const f of list ?? []) {
				defaults.push(new SkillDefault(f))
			}
			return defaults
		}
		return []
	}

	skillLevel(tooltip?: TooltipGURPS): number {
		const actor = this.actor
		if (!actor) return 0
		let primaryTooltip = new TooltipGURPS()
		if (tooltip) primaryTooltip = tooltip
		const adj =
			this.skillLevelBaseAdjustment(actor, primaryTooltip) + this.skillLevelPostAdjustment(actor, primaryTooltip)
		let best = -Infinity
		for (const def of this.defaults) {
			let level = def.skillLevelFast(actor, false, null, true)
			if (level !== -Infinity) {
				level += adj
				if (best < level) best = level
			}
		}
		if (best === -Infinity) return 0
		if (tooltip && primaryTooltip && primaryTooltip.length !== 0) {
			if (tooltip.length !== 0) tooltip.push("\n")
			tooltip.push(primaryTooltip)
		}
		if (best < 0) best = 0
		return best
	}

	skillLevelBaseAdjustment(actor: this["actor"], tooltip: TooltipGURPS): number {
		if (!actor) return 0
		let adj = 0
		if (!(this.container instanceof ContainerGURPS)) return 0
		const minST = this.resolvedMinimumStrength - (actor.strengthOrZero + actor.striking_st_bonus)
		if (minST > 0) adj -= minST
		const nameQualifier = this.container?.name
		for (const bonus of actor.namedWeaponSkillBonusesFor(
			nameQualifier!,
			this.usage,
			(this.container as any)?.tags,
			tooltip
		)) {
			adj += bonus.adjustedAmount
		}
		for (const bonus of actor.namedWeaponSkillBonusesFor(
			nameQualifier!,
			this.usage,
			(this.container as any)?.tags,
			tooltip
		)) {
			adj += bonus.adjustedAmount
		}
		if (this.container)
			for (const f of (this.container as any).features) {
				adj += this.extractSkillBonusForThisWeapon(f, tooltip)
			}
		if ([ItemType.Trait, ItemType.Equipment, ItemType.EquipmentContainer].includes(this.container?.type as any)) {
			for (const mod of (this.container as any).modifiers) {
				for (const f of mod.features) {
					adj += this.extractSkillBonusForThisWeapon(f, tooltip)
				}
			}
		}
		return adj
	}

	skillLevelPostAdjustment(actor: this["actor"], tooltip: TooltipGURPS): number {
		if (this.type === ItemType.MeleeWeapon)
			if ((this.system as any).parry?.includes("F")) return this.encumbrancePenalty(actor, tooltip)
		return 0
	}

	encumbrancePenalty(actor: this["actor"], tooltip: TooltipGURPS): number {
		if (!actor) return 0
		const penalty = actor.encumbranceLevel(true).penalty
		if (penalty !== 0 && tooltip) {
			tooltip.push("\n")
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.tooltip.encumbrance, {
					bonus: penalty.signedString(),
				})
			)
		}
		return penalty
	}

	extractSkillBonusForThisWeapon(f: Feature, tooltip: TooltipGURPS): number {
		if (f instanceof SkillBonus) {
			if (f.selection_type === "this_weapon") {
				if (stringCompare(this.usage, f.specialization)) {
					f.addToTooltip(tooltip)
					return f.adjustedAmount
				}
			}
		}
		return 0
	}

	get resolvedMinimumStrength(): number {
		let started = false
		let value = 0
		for (const ch of this.system.strength) {
			if (ch.match(/[0-9]/)) {
				value *= 10
				value += parseInt(ch)
				started = true
			} else if (started) break
		}
		return value
	}

	get fastResolvedDamage(): string {
		return this.damage.resolvedDamage(null)
	}

	get damage(): WeaponDamage {
		return new WeaponDamage({ ...this.system.damage, owner: this })
	}

	resolvedValue(input: string, baseDefaultType: string, tooltip?: TooltipGURPS): string {
		const actor = this.actor
		input ??= ""
		input = input.trim()
		if (!input.match(/^[+-]?[0-9]+/)) return input
		if (!actor) return input
		let skillLevel = -Infinity
		let modifier = parseInt(input) || 0
		const re = new RegExp(`^${modifier >= 0 ? "\\+?" : ""}${modifier}`)
		let buffer = input.replace(re, "")
		while (skillLevel === -Infinity) {
			let primaryTooltip = new TooltipGURPS()
			let secondaryTooltip = new TooltipGURPS()
			let preAdj = this.skillLevelBaseAdjustment(actor, primaryTooltip)
			let postAdj = this.skillLevelPostAdjustment(actor, primaryTooltip)
			let adj = 3
			if (baseDefaultType === gid.Parry) adj += this.actor.parryBonus
			else adj += this.actor.blockBonus
			let best = -Infinity
			for (const def of this.defaults) {
				let level = def.skillLevelFast(actor, false, null, true)
				if (level === -Infinity) continue
				level += preAdj
				if (baseDefaultType !== def.type) level = Math.trunc(level / 2 + adj)
				level += postAdj
				let possibleTooltip = new TooltipGURPS()
				// TODO: localization
				if (def.type === gid.Skill && def.name === "Karate")
					level += this.encumbrancePenalty(actor, possibleTooltip)
				if (best < level) {
					best = level
					secondaryTooltip = possibleTooltip
				}
			}
			if (best !== -Infinity && tooltip) {
				if (primaryTooltip && primaryTooltip.length !== 0) {
					if (tooltip.length !== 0) tooltip.push("\n")
					tooltip.push(primaryTooltip)
				}
				if (secondaryTooltip && secondaryTooltip.length !== 0) {
					if (tooltip.length !== 0) tooltip.push("\n")
					tooltip.push(secondaryTooltip)
				}
			}
			skillLevel = Math.max(best, 0)
		}
		const num = String(Math.trunc(skillLevel + modifier))
		buffer = num + buffer
		return buffer
	}

	exportSystemData(_keepOther: boolean): any {
		const system = this.system
		console.log(system)
		// system.damage.base = new DiceGURPS(this.damage.base).toString(false)
		// system.damage.fragmentation = new DiceGURPS(this.damage.fragmentation).toString(false)
		return system
	}

	resolveBoolFlag(switchType: wswitch, initial: boolean): boolean {
		const actor = this.actor
		if (!actor) return initial
		let t = 0
		let f = 0
		for (const bonus of this.collectWeaponBonuses(1, null, FeatureType.WeaponSwitch)) {
			if (bonus.switch_type === switchType) t++
			else f++
		}
		if (t > f) return true
		if (f > t) return false
		return initial
	}

	collectWeaponBonuses(
		dieCount: number,
		tooltip: TooltipGURPS | null,
		...allowedFeatureTypes: WeaponBonusType[]
	): WeaponBonus[] {
		const actor = this.actor as CharacterGURPS
		if (!actor) return []
		const allowed: Map<WeaponBonusType, boolean> = new Map()
		for (const one of allowedFeatureTypes) allowed.set(one, true)
		let bestDef = new SkillDefault()
		let best = -Infinity
		for (const one of this.defaults) {
			if (one.skillBased) {
				const level = one.skillLevelFast(actor, false, null, true)
				if (best < level) {
					best = level
					bestDef = one
				}
			}
		}
		const bonusSet: Map<WeaponBonus, boolean> = new Map()
		const tags = (this.container as ItemGCS)?.tags
		let [name, specialization] = ["", ""]
		if (bestDef) {
			name = bestDef.name ?? ""
			specialization = bestDef.specialization ?? ""
		}
		actor.addWeaponWithSkillBonusesFor(name, specialization, this.usage, tags, dieCount, tooltip, bonusSet, allowed)
		const nameQualifier = this.formattedName
		actor.addNamedWeaponBonusesFor(nameQualifier, this.usage, tags, dieCount, tooltip, bonusSet, allowed)
		for (const f of (this.container as ItemGCS).features)
			this._extractWeaponBonus(f, bonusSet, allowed, Int.from(dieCount), tooltip)
		if (
			this.container instanceof TraitGURPS ||
			this.container instanceof TraitContainerGURPS ||
			this.container instanceof EquipmentGURPS ||
			this.container instanceof EquipmentContainerGURPS
		) {
			this.container.modifiers.forEach(mod => {
				let bonus: Bonus
				for (const f of mod.features) {
					bonus = f
					bonus.subOwner = mod
					this._extractWeaponBonus(f, bonusSet, allowed, Int.from(dieCount), tooltip)
				}
			})
		}
		if (bonusSet.size === 0) return []
		return Array.from(bonusSet.keys())
	}

	private _extractWeaponBonus(
		f: Feature,
		set: Map<WeaponBonus, boolean>,
		allowedFeatureTypes: Map<FeatureType, boolean>,
		dieCount: number,
		tooltip: TooltipGURPS | null
	): void {
		if (!allowedFeatureTypes.get(f.type)) return
		if (f instanceof WeaponBonus) {
			const savedLevel = f.leveledAmount.level
			const savedDieCount = f.leveledAmount.dieCount
			f.leveledAmount.level = f.derivedLevel
			f.leveledAmount.dieCount = dieCount
			switch (f.selection_type) {
				case wsel.WithRequiredSkill:
					break
				case wsel.ThisWeapon:
					if (stringCompare(this.usage, f.specialization)) {
						if (!set.has(f)) {
							set.set(f, true)
							f.addToTooltip(tooltip)
						}
					}
				case wsel.WithName:
					if (
						stringCompare(this.formattedName, f.name) &&
						stringCompare(this.usage, f.specialization) &&
						stringCompare((this.container as ItemGCS).tags, f.tags)
					) {
						if (!set.has(f)) {
							set.set(f, true)
							f.addToTooltip(tooltip)
						}
					}
				default:
					throw Error(`Unknown selection type ${f.selection_type}`)
			}
			f.leveledAmount.level = savedLevel
			f.leveledAmount.dieCount = savedDieCount
		}
	}
}
