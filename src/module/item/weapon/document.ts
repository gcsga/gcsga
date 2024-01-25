import { ActorGURPS, CharacterGURPS } from "@actor/document.ts"
import { ItemGURPS } from "@item/base/document.ts"
import { BaseWeaponSystemData } from "./data.ts"
import { sheetDisplayNotes } from "@util/misc.ts"
import { display } from "@util/enum/display.ts"
import { WeaponStrength } from "./weapon_strength.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { ItemType, RollType, SYSTEM_NAME, gid } from "@module/data/misc.ts"
import { ItemFlags } from "@item/data.ts"
import { StringBuilder } from "@util/string_builder.ts"
import { EquipmentResolver } from "@util/resolvers.ts"
import { SkillDefault } from "@sytem/default/index.ts"
import { ContainerGURPS, ItemGCS, WeaponDamage } from "@item/index.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { SkillBonus } from "@feature/skill_bonus.ts"
import { skillsel } from "@util/enum/skillsel.ts"
import { Feature, WeaponBonus } from "@feature/index.ts"
import { wswitch } from "@util/enum/wswitch.ts"
import { feature } from "@util/enum/feature.ts"
import { Int } from "@util/fxp.ts"
import { wsel } from "@util/enum/wsel.ts"

export interface BaseWeaponGURPS<TParent extends ActorGURPS> extends ItemGURPS<TParent> {
	system: BaseWeaponSystemData
}

export abstract class BaseWeaponGURPS<TParent extends ActorGURPS = ActorGURPS> extends ItemGURPS<TParent> {
	get itemName(): string {
		if (this.container instanceof Item) return this.container?.name ?? ""
		return ""
	}

	get formattedName(): string {
		return this.system.usage
	}

	get resolvedNotes(): string {
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
		return (this.getFlag(SYSTEM_NAME, ItemFlags.Unready) as boolean) ?? false
	}

	secondaryText(_optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		if (this.getFlag(SYSTEM_NAME, ItemFlags.Unready))
			if (this.container instanceof Item) {
				buffer.appendToNewLine((this.container as any).notes)
			}
		buffer.appendToNewLine(this.system.usage_notes)
		return buffer.toString()
	}

	get level(): number {
		return this.skillLevel()
	}

	get equipped(): boolean {
		if (!this.actor) return false
		if ([ItemType.Equipment, ItemType.EquipmentContainer].includes((this.container as any)?.type))
			return (this.container as unknown as EquipmentResolver).equipped
		if ([ItemType.Trait, ItemType.TraitContainer].includes((this.container as any)?.type))
			return (this.container as unknown as EquipmentResolver).enabled
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
		const actor = this.actor || this.dummyActor
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

	skillLevelBaseAdjustment(actor: this["actor"], tooltip: TooltipGURPS | null): number {
		if (!actor) return 0
		if (!(actor instanceof CharacterGURPS)) return 0
		let adj = 0
		if (!(this.container instanceof ContainerGURPS)) return 0
		const minST = this.resolvedMinimumStrength - actor.strikingST
		if (minST > 0) adj -= minST
		const nameQualifier = this.container?.name
		for (const bonus of actor.namedWeaponSkillBonusesFor(
			nameQualifier!,
			this.usage,
			(this.container as any)?.tags,
			tooltip,
		)) {
			adj += bonus.adjustedAmount
		}
		for (const bonus of actor.namedWeaponSkillBonusesFor(
			nameQualifier!,
			this.usage,
			(this.container as any)?.tags,
			tooltip,
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

	skillLevelPostAdjustment(actor: this["actor"], tooltip: TooltipGURPS | null): number {
		if (this.type === ItemType.MeleeWeapon)
			if ((this.system as any).parry?.includes("F")) return this.encumbrancePenalty(actor, tooltip)
		return 0
	}

	encumbrancePenalty(actor: this["actor"], tooltip: TooltipGURPS | null): number {
		if (!actor) return 0
		if (!(actor instanceof CharacterGURPS)) return 0
		const penalty = actor.encumbranceLevel(true).penalty
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

	get fastResolvedDamage(): string {
		return this.damage.resolvedDamage(null)
	}

	get damage(): WeaponDamage {
		return new WeaponDamage({ ...this.system.damage, owner: this })
	}

	resolvedValue(input: string, baseDefaultType: string, tooltip?: TooltipGURPS): string {
		const actor = this.actor
		if (!(actor instanceof CharacterGURPS)) return ""
		input ??= ""
		input = input.trim()
		if (!input.match(/^[+-]?[0-9]+/)) return input
		if (!actor) return input
		let skillLevel = -Infinity
		const modifier = parseInt(input) || 0
		const re = new RegExp(`^${modifier >= 0 ? "\\+?" : ""}${modifier}`)
		let buffer = input.replace(re, "")
		while (skillLevel === -Infinity) {
			const primaryTooltip = new TooltipGURPS()
			let secondaryTooltip = new TooltipGURPS()
			const preAdj = this.skillLevelBaseAdjustment(actor, primaryTooltip)
			const postAdj = this.skillLevelPostAdjustment(actor, primaryTooltip)
			let adj = 3
			if (baseDefaultType === gid.Parry) adj += actor.parryBonus
			else adj += actor.blockBonus
			let best = -Infinity
			for (const def of this.defaults) {
				let level = def.skillLevelFast(actor, false, null, true)
				if (level === -Infinity) continue
				level += preAdj
				if (baseDefaultType !== def.type) level = Math.trunc(level / 2 + adj)
				level += postAdj
				const possibleTooltip = new TooltipGURPS()
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

	override exportSystemData(_keepOther: boolean): any {
		const system = this.system
		// system.damage.base = new DiceGURPS(this.damage.base).toString(false)
		// system.damage.fragmentation = new DiceGURPS(this.damage.fragmentation).toString(false)
		return system
	}

	resolveBoolFlag(switchType: wswitch.Type, initial: boolean): boolean {
		const actor = this.actor
		if (!actor) return initial
		let t = 0
		let f = 0
		for (const bonus of this.collectWeaponBonuses(1, null, feature.Type.WeaponSwitch)) {
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
		...allowedFeatureTypes: feature.WeaponBonusType[]
	): WeaponBonus[] {
		const actor = this.actor
		if (!actor || !(actor instanceof CharacterGURPS)) return []
		const allowed: Map<feature.WeaponBonusType, boolean> = new Map()
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
		const container = this.container
		if (container && container instanceof Item)
			for (const f of (container as ItemGCS).features)
				this._extractWeaponBonus(f, bonusSet, allowed, Int.from(dieCount), tooltip)
		if (
			!(this.container instanceof CompendiumCollection) &&
			[ItemType.Trait, ItemType.TraitContainer, ItemType.Equipment, ItemType.EquipmentContainer].includes(
				this.container?.type as ItemType,
			)
		) {
			;(this.container as any).modifiers.forEach((mod: any) => {
				let bonus: Feature
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
		allowedFeatureTypes: Map<feature.Type, boolean>,
		dieCount: number,
		tooltip: TooltipGURPS | null,
	): void {
		if (!allowedFeatureTypes.get(f.type)) return
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
							set.set(f, true)
							f.addToTooltip(tooltip)
						}
					}
					break
				case wsel.Type.WithName:
					if (
						f.name?.matches(this.formattedName) &&
						f.specialization?.matches(this.usage) &&
						f.tags?.matchesList(...(this.container as ItemGCS).tags)
					) {
						if (!set.has(f)) {
							set.set(f, true)
							f.addToTooltip(tooltip)
						}
					}
					break
				default:
					throw Error(`Unknown selection type ${(f as any).selection_type}`)
			}
			f.leveledAmount.level = savedLevel
			f.leveledAmount.dieCount = savedDieCount
		}
	}

	abstract checkUnready(type: RollType): void
}
