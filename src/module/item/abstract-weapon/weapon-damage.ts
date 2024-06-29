import fields = foundry.data.fields
import { Int } from "@util/fxp.ts"
import { feature } from "@util/enum/feature.ts"
import { stdmg } from "@util/enum/stdmg.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { progression } from "@util/enum/progression.ts"
import { CharacterGURPS } from "@actor"
import { ItemType } from "@data"
import { AbstractWeaponGURPS } from "./document.ts"
import { TooltipGURPS } from "@util"
import { sheetSettingsFor } from "@module/data/sheet-settings.ts"

export type WeaponDamageSchema = {
	type: fields.StringField<string, string, true, false, true>
	st: fields.StringField<stdmg.Option>
	base: fields.StringField
	armor_divisor: fields.NumberField<number, number, true, false, true>
	fragmentation: fields.StringField
	fragmentation_armor_divisor: fields.NumberField<number, number, true, false, true>
	fragmentation_type: fields.StringField
	modifier_per_die: fields.NumberField<number, number, true, false, true>
}

export class WeaponDamage {
	owner?: AbstractWeaponGURPS

	type: string

	st: stdmg.Option

	base?: DiceGURPS

	armor_divisor?: number

	fragmentation?: DiceGURPS

	fragmentation_armor_divisor?: number

	fragmentation_type?: string

	modifier_per_die?: number

	current?: string

	constructor(data: SourceFromSchema<WeaponDamageSchema> & { owner?: AbstractWeaponGURPS }) {
		this.owner = data.owner
		this.type = data.type
		this.st = data.st ?? stdmg.Option.None
		this.base = new DiceGURPS(data.base)
		this.armor_divisor = data.armor_divisor
		this.fragmentation = new DiceGURPS(data.fragmentation)
		this.fragmentation_armor_divisor = data.fragmentation_armor_divisor
		this.fragmentation_type = data.fragmentation_type
		this.modifier_per_die = data.modifier_per_die
	}

	static defineSchema(): WeaponDamageSchema {
		return {
			type: new fields.StringField({ required: true, initial: "cr" }),
			st: new fields.StringField<stdmg.Option>(),
			base: new fields.StringField(),
			armor_divisor: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
			fragmentation: new fields.StringField(),
			fragmentation_armor_divisor: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
			fragmentation_type: new fields.StringField(),
			modifier_per_die: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
		}
	}

	toString(): string {
		let buffer = ""
		if (this.st !== stdmg.Option.None) buffer += LocalizeGURPS.translations.gurps.weapon.damage_display[this.st]
		const convertMods = sheetSettingsFor(this.owner?.actor ?? null).use_modifying_dice_plus_adds
		if (this.base) {
			const base = this.base.stringExtra(convertMods)
			if (base !== "0") {
				if (buffer.length !== 0 && base[0] !== "+" && base[0] !== "-") buffer += "+"
				buffer += base
			}
			if (this.armor_divisor !== 1) buffer += `(${this.armor_divisor})`
			if (this.modifier_per_die !== 0) {
				if (buffer.length !== 0) buffer += " "
				buffer += `(${this.modifier_per_die?.signedString()} ${LocalizeGURPS.translations.gurps.feature.per_die
					})`
			}
			const t = this.type.trim()
			if (t !== "") buffer += ` ${t}`
			if (this.fragmentation) {
				const frag = this.fragmentation.stringExtra(convertMods)
				if (frag !== "0") {
					buffer += `[${frag}`
					if (this.fragmentation_armor_divisor !== 1) buffer += `(${this.fragmentation_armor_divisor})`
					buffer += ` ${this.fragmentation_type}]`
				}
			}
		}
		return buffer
	}

	get baseDamageDice(): DiceGURPS {
		if (!this.owner) return new DiceGURPS({ sides: 6, multiplier: 1 })
		const actor = this.owner.actor as CharacterGURPS
		if (!actor) return new DiceGURPS({ sides: 6, multiplier: 1 })
		const maxST = (this.owner.strength.resolve(this.owner, null).min ?? 0) * 3
		let st = 0
		if (this.owner.container?.isOfType(ItemType.Equipment, ItemType.EquipmentContainer)) {
			st = this.owner.container.system.rated_strength ?? st
		}
		if (st === 0) st = actor.strikingST
		if (maxST > 0 && maxST < st) st = maxST
		let base = new DiceGURPS({ sides: 6, multiplier: 1 })
		if (this.base) base = this.base
		if (
			!(this.owner.container instanceof CompendiumCollection) &&
			this.owner.container?.isOfType(ItemType.Trait) &&
			this.owner.container.isLeveled
		)
			multiplyDice(Int.from(this.owner.container.levels), base)
		const intST = Int.from(st)
		switch (this.st) {
			case stdmg.Option.Thrust:
				base = addDice(base, actor.thrustFor(intST))
				break
			case stdmg.Option.LeveledThrust: {
				const thrust = actor.thrustFor(intST)
				if (
					!(this.owner.container instanceof CompendiumCollection) &&
					this.owner.container?.isOfType(ItemType.Trait) &&
					this.owner.container.isLeveled
				)
					multiplyDice(Int.from(this.owner.container.levels), base)
				base = addDice(base, thrust)
				break
			}
			case stdmg.Option.Swing:
				base = addDice(base, actor.swingFor(intST))
				break
			case stdmg.Option.LeveledSwing: {
				const swing = actor.swingFor(intST)
				if (
					!(this.owner.container instanceof CompendiumCollection) &&
					this.owner.container?.isOfType(ItemType.Trait) &&
					this.owner.container.isLeveled
				)
					multiplyDice(Int.from(this.owner.container.levels), base)
				base = addDice(base, swing)
				break
			}
		}
		return base
	}

	resolvedDamage(tooltip: TooltipGURPS | null): string {
		// TODO: change
		if (!this.owner) return ""
		let base = this.baseDamageDice
		if (base.count === 0 && base.modifier === 0) return this.toString()
		const actor = this.owner.actor as CharacterGURPS
		const adjustForPhoenixFlame =
			actor?.settings.damage_progression === progression.Option.PhoenixFlameD3 && base.sides === 3
		let [percentDamageBonus, percentDRDivisorBonus] = [0, 0]
		let armorDivisor = this.armor_divisor ?? 1
		for (const bonus of this.owner.collectWeaponBonuses(
			base.count,
			tooltip,
			feature.Type.WeaponBonus,
			feature.Type.WeaponDRDivisorBonus,
		)) {
			if (bonus.type === feature.Type.WeaponBonus) {
				bonus.leveledAmount.dieCount = Int.from(base.count)
				let amt = bonus.adjustedAmountForWeapon(this.owner)
				if (bonus.percent) percentDamageBonus += amt
				else {
					if (adjustForPhoenixFlame) {
						if (bonus.leveledAmount.leveled) amt /= 2
						if (bonus.leveledAmount.per_die) amt /= 2
					}
					base.modifier += Int.from(amt)
				}
			} else if (bonus.type === feature.Type.WeaponDRDivisorBonus) {
				const amt = bonus.adjustedAmountForWeapon(this.owner)
				if (bonus.percent) percentDRDivisorBonus += amt
				else armorDivisor += amt
			}
		}
		if (this.modifier_per_die && this.modifier_per_die !== 0) {
			let amt = this.modifier_per_die * Int.from(base.count)
			if (adjustForPhoenixFlame) amt /= 2
			base.modifier += Int.from(amt)
		}
		if (percentDamageBonus !== 0) base = adjustDiceForPercentBonus(base, percentDamageBonus)
		if (percentDRDivisorBonus !== 0) armorDivisor = (armorDivisor * percentDRDivisorBonus) / 100
		let buffer = ""
		if (base.count !== 0 || base.modifier !== 0)
			buffer += base.stringExtra(actor?.settings.use_modifying_dice_plus_adds ?? false)
		if (armorDivisor !== 1) buffer += `(${armorDivisor})`
		if (this.type.trim() !== "") {
			if (buffer.length !== 0) buffer += " "
			buffer += this.type
		}
		if (this.fragmentation) {
			const frag = this.fragmentation.stringExtra(actor?.settings.use_modifying_dice_plus_adds ?? false)
			if (frag !== "0") {
				if (buffer.length !== 0) buffer += " "
				buffer += "[]"
				buffer += frag
				if (this.fragmentation_armor_divisor !== 1) buffer += `(${this.fragmentation_armor_divisor})`
				buffer += ` ${this.fragmentation_type}]`
			}
		}
		return buffer
	}
}

function multiplyDice(multiplier: number, d: DiceGURPS) {
	d.count *= multiplier
	d.modifier *= multiplier
	if (d.multiplier !== 1) d.multiplier *= multiplier
}

function addDice(left: DiceGURPS, right: DiceGURPS): DiceGURPS {
	if (left.sides > 1 && right.sides > 1 && left.sides !== right.sides) {
		const sides = Math.min(left.sides, right.sides)
		const average = Int.from(sides + 1) / 2
		const averageLeft = Int.from(((left.count * (left.sides + 1)) / 2) * Int.from(left.multiplier))
		const averageRight = Int.from(((right.count * (right.sides + 1)) / 2) * Int.from(right.multiplier))
		const averageBoth = averageLeft + averageRight
		return new DiceGURPS({
			count: Int.from(averageBoth / average),
			sides: sides,
			modifier: Int.from(Math.round(averageBoth % average)) + left.modifier + right.modifier,
			multiplier: 1,
		})
	}
	return new DiceGURPS({
		count: left.count + right.count,
		sides: Math.max(left.sides, right.sides),
		modifier: left.modifier + right.modifier,
		multiplier: left.multiplier + right.multiplier - 1,
	})
}

function adjustDiceForPercentBonus(d: DiceGURPS, percent: number): DiceGURPS {
	let count = d.count
	let modifier = d.modifier
	const averagePerDie = (d.sides + 1) / 2
	let average = averagePerDie * count + modifier
	modifier = (modifier * (100 + percent)) / 100
	if (average < 0) count = Math.max((count * (100 + percent)) / 100, 0)
	else {
		average = (average * (100 + percent)) / 100 - modifier
		count = Math.max(Math.trunc(average / averagePerDie), 0)
		modifier += Math.round(average - count * averagePerDie)
	}
	return new DiceGURPS({
		count: count,
		sides: d.sides,
		modifier: modifier,
		multiplier: d.multiplier,
	})
}
