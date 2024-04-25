import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { MeleeWeaponSource, MeleeWeaponSystemData } from "@item/melee-weapon/data.ts"
import { RangedWeaponSource, RangedWeaponSystemData } from "@item/ranged-weapon/data.ts"
import {
	Int,
	LocalizeGURPS,
	StringBuilder,
	TooltipGURPS,
	display,
	feature,
	sheetDisplayNotes,
	skillsel,
	wsel,
	wswitch,
} from "@util"
import { WeaponStrength } from "./weapon-strength.ts"
import { ActorType, ItemFlags, ItemType, RollType, SYSTEM_NAME, gid } from "@module/data/constants.ts"
import { WeaponFlags } from "./data.ts"
import { ContainedWeightReduction, Feature, SkillBonus, SkillDefault, WeaponBonus } from "@system"
import { WeaponParry } from "./weapon-parry.ts"
import { WeaponDamage } from "./weapon-damage.ts"
import { WeaponBonusResolver } from "@module/util/resolvers.ts"

abstract class AbstractWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	declare damage: WeaponDamage

	get itemName(): string {
		return this.container?.name ?? ""
	}

	override get formattedName(): string {
		return this.system.usage
	}

	override get resolvedNotes(): string {
		return sheetDisplayNotes(this.secondaryText(display.Option.isInline), { unready: this.unready })
	}

	get usage(): string {
		return this.system.usage
	}

	get strength(): WeaponStrength {
		const ws = WeaponStrength.parse(this.system.strength)
		ws.current = ws.resolve(this, new TooltipGURPS()).toString()
		return ws
	}

	get unready(): boolean {
		return this.flags[SYSTEM_NAME][ItemFlags.Unready]
	}

	override secondaryText(_optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		if (this.container) buffer.appendToNewLine(this.container.notes)
		buffer.appendToNewLine(this.system.usage_notes)
		return buffer.toString()
	}

	get level(): number {
		return this.skillLevel()
	}

	get equipped(): boolean {
		if (!this.actor) return false
		if (!this.container) return false
		if (this.container.isOfType(ItemType.Equipment, ItemType.EquipmentContainer)) return this.container.equipped
		if (this.container.isOfType(ItemType.Trait)) return this.container.enabled
		return true
	}

	get defaults(): SkillDefault[] {
		return this.system.defaults.map(e => new SkillDefault(e))
	}

	skillLevel(tooltip?: TooltipGURPS): number {
		const actor = this.dummyActor || this.actor
		if (!actor) return 0
		if (actor instanceof ActorGURPS && actor.isOfType(ActorType.Character)) {
			let primaryTooltip = new TooltipGURPS()
			if (tooltip) primaryTooltip = tooltip
			const adj = this.skillLevelPostAdjustment(actor, primaryTooltip)
			let best = Number.MIN_SAFE_INTEGER
			for (const def of this.defaults) {
				let level = def.skillLevelFast(actor, false, null, true)
				if (level !== Number.MIN_SAFE_INTEGER) {
					level += adj
					if (best < level) best = level
				}
			}
			if (best === Number.MIN_SAFE_INTEGER) return 0
			if (tooltip && primaryTooltip && primaryTooltip.length !== 0) {
				if (tooltip.length !== 0) tooltip.push("\n")
				tooltip.push(primaryTooltip)
			}
			if (best < 0) best = 0
			return best
		}
		return 0
	}

	skillLevelBaseAdjustment(actor: WeaponBonusResolver, tooltip: TooltipGURPS | null): number {
		let adj = 0
		const minST = this.resolvedMinimumStrength - actor.strikingST
		if (minST > 0) adj -= minST
		const nameQualifier = this.container?.name
		for (const bonus of actor.namedWeaponSkillBonusesFor(
			nameQualifier!,
			this.usage,
			this.container?.tags ?? [],
			tooltip,
		)) {
			adj += bonus.adjustedAmount
		}
		for (const bonus of actor.namedWeaponSkillBonusesFor(
			nameQualifier!,
			this.usage,
			this.container?.tags ?? [],
			tooltip,
		)) {
			adj += bonus.adjustedAmount
		}
		if (this.container)
			for (const f of this.container.features) {
				adj += this.extractSkillBonusForThisWeapon(f, tooltip)
			}
		if (this.container?.isOfType(ItemType.Trait, ItemType.Equipment, ItemType.EquipmentContainer)) {
			for (const mod of this.container.modifiers) {
				for (const f of mod.features) {
					adj += this.extractSkillBonusForThisWeapon(f, tooltip)
				}
			}
		}
		return adj
	}

	skillLevelPostAdjustment(actor: WeaponBonusResolver, tooltip: TooltipGURPS | null): number {
		if (this.isOfType(ItemType.MeleeWeapon)) {
			const baseParry = WeaponParry.parse(this.system.parry)
			if (baseParry.fencing) return this.encumbrancePenalty(actor, tooltip)
		}
		return 0
	}

	encumbrancePenalty(actor: WeaponBonusResolver, tooltip: TooltipGURPS | null): number {
		const penalty = actor.encumbrance.current.penalty
		if (penalty !== 0 && tooltip) {
			tooltip.push("\n")
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.tooltip.encumbrance, {
					bonus: penalty.signedString(),
				}),
			)
		}
		return penalty
	}

	extractSkillBonusForThisWeapon(f: Feature, tooltip: TooltipGURPS | null): number {
		if (f instanceof SkillBonus) {
			if (f.selection_type === skillsel.Type.ThisWeapon) {
				if (f.specialization?.matches(this.usage)) {
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

	// get fastResolvedDamage(): string {
	// 	return this.damage.resolvedDamage(null)
	// }

	// get damage(): WeaponDamage {
	// 	return new WeaponDamage({ ...this.system.damage, owner: this })
	// }

	override prepareBaseData(): void {
		super.prepareBaseData()
		this.damage = new WeaponDamage({ ...this.system.damage, owner: this })
		this.damage.current = this.damage.resolvedDamage(null)
	}

	resolvedValue(input: string, baseDefaultType: string, tooltip?: TooltipGURPS): string {
		if (!this.actor || !this.actor.isOfType(ActorType.Character)) return ""
		input ??= ""
		input = input.trim()
		if (!input.match(/^[+-]?[0-9]+/)) return input
		let skillLevel = Number.MIN_SAFE_INTEGER
		const modifier = parseInt(input) || 0
		const re = new RegExp(`^${modifier >= 0 ? "\\+?" : ""}${modifier}`)
		let buffer = input.replace(re, "")
		while (skillLevel === Number.MIN_SAFE_INTEGER) {
			const primaryTooltip = new TooltipGURPS()
			let secondaryTooltip = new TooltipGURPS()
			const preAdj = this.skillLevelBaseAdjustment(this.actor, primaryTooltip)
			const postAdj = this.skillLevelPostAdjustment(this.actor, primaryTooltip)
			let adj = 3
			if (baseDefaultType === gid.Parry) adj += this.actor.parryBonus
			else adj += this.actor.blockBonus
			let best = Number.MIN_SAFE_INTEGER
			for (const def of this.defaults) {
				let level = def.skillLevelFast(this.actor, false, null, true)
				if (level === Number.MIN_SAFE_INTEGER) continue
				level += preAdj
				if (baseDefaultType !== def.type) level = Math.trunc(level / 2 + adj)
				level += postAdj
				const possibleTooltip = new TooltipGURPS()
				// TODO: localization
				if (def.type === gid.Skill && def.name === "Karate")
					level += this.encumbrancePenalty(this.actor, possibleTooltip)
				if (best < level) {
					best = level
					secondaryTooltip = possibleTooltip
				}
			}
			if (best !== Number.MIN_SAFE_INTEGER && tooltip) {
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

	resolveBoolFlag(switchType: wswitch.Type, initial: boolean): boolean {
		if (!this.actor || !this.actor.isOfType(ActorType.Character)) return initial
		let t = 0
		let f = 0
		for (const bonus of this.collectWeaponBonuses(1, null, feature.Type.WeaponSwitch)) {
			if (bonus.switch_type === switchType) t += 1
			else f += 1
		}
		if (t > f) return true
		if (f > t) return false
		return initial
	}

	collectWeaponBonuses(
		dieCount: number,
		tooltip: TooltipGURPS | null,
		...allowedFeatureTypes: feature.WeaponBonusType[]
	): WeaponBonus[] {
		if (!this.actor || !this.actor.isOfType(ActorType.Character)) return []
		const allowed = new Set(allowedFeatureTypes)
		let bestDef = new SkillDefault()
		let best = Number.MIN_SAFE_INTEGER
		for (const one of this.defaults) {
			if (one.skillBased) {
				const level = one.skillLevelFast(this.actor, false, null, true)
				if (best < level) {
					best = level
					bestDef = one
				}
			}
		}
		const bonusSet: Set<WeaponBonus> = new Set()
		const tags = this.container?.tags ?? []
		let [name, specialization] = ["", ""]
		if (bestDef) {
			name = bestDef.name ?? ""
			specialization = bestDef.specialization ?? ""
		}
		this.actor.addWeaponWithSkillBonusesFor(
			name,
			specialization,
			this.usage,
			tags,
			dieCount,
			tooltip,
			bonusSet,
			allowed,
		)
		const nameQualifier = this.formattedName
		this.actor.addNamedWeaponBonusesFor(nameQualifier, this.usage, tags, dieCount, tooltip, bonusSet, allowed)
		for (const f of this.container?.features ?? []) {
			this._extractWeaponBonus(f, bonusSet, allowed, Int.from(dieCount), tooltip)
		}
		if (
			!(this.container instanceof CompendiumCollection) &&
			this.container?.isOfType(
				ItemType.Trait,
				ItemType.TraitContainer,
				ItemType.Equipment,
				ItemType.EquipmentContainer,
			)
		) {
			this.container.modifiers.forEach((mod: any) => {
				let bonus: Feature
				for (const f of mod.features) {
					bonus = f
					if (!(bonus instanceof ContainedWeightReduction)) bonus.subOwner = mod
					this._extractWeaponBonus(f, bonusSet, allowed, Int.from(dieCount), tooltip)
				}
			})
		}
		if (bonusSet.size === 0) return []
		return Array.from(bonusSet.keys())
	}

	private _extractWeaponBonus(
		f: Feature,
		set: Set<WeaponBonus>,
		allowedFeatureTypes: Set<feature.Type>,
		dieCount: number,
		tooltip: TooltipGURPS | null,
	): void {
		if (!allowedFeatureTypes.has(f.type)) return
		if (f instanceof WeaponBonus) {
			const savedLevel = f.leveledAmount.level
			const savedDieCount = f.leveledAmount.dieCount
			f.leveledAmount.level = f.derivedLevel
			f.leveledAmount.dieCount = dieCount
			switch (f.selection_type) {
				case wsel.Type.WithRequiredSkill:
					break
				case wsel.Type.ThisWeapon:
					if (f.specialization?.matches(this.usage)) {
						if (!set.has(f)) {
							set.add(f)
							f.addToTooltip(tooltip)
						}
					}
					break
				case wsel.Type.WithName:
					if (
						f.name?.matches(this.formattedName) &&
						f.specialization?.matches(this.usage) &&
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						f.tags?.matchesList(...(this.container as any).tags)
					) {
						if (!set.has(f)) {
							set.add(f)
							f.addToTooltip(tooltip)
						}
					}
					break
				default:
					throw Error(`Unknown selection type ${(f as WeaponBonus).selection_type}`)
			}
			f.leveledAmount.level = savedLevel
			f.leveledAmount.dieCount = savedDieCount
		}
	}

	abstract checkUnready(type: RollType): void
}

interface AbstractWeaponGURPS<TParent extends ActorGURPS | null> extends ItemGURPS<TParent> {
	flags: WeaponFlags
	readonly _source: MeleeWeaponSource | RangedWeaponSource
	system: MeleeWeaponSystemData | RangedWeaponSystemData
}

export { AbstractWeaponGURPS }
