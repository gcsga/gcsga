import { AbstractWeaponTemplate } from "../templates/index.ts"
import { WeaponField, WeaponFieldSchema } from "./weapon-field.ts"
import fields = foundry.data.fields
import { Int, LocalizeGURPS, StringBuilder, TooltipGURPS, feature, stdmg } from "@util"
import { DiceGURPS, DiceSchema, SheetSettings } from "@system"
import { ActorType, ItemType, gid } from "@module/data/constants.ts"

class WeaponDamage extends WeaponField<AbstractWeaponTemplate, WeaponDamageSchema> {
	static override defineSchema(): WeaponDamageSchema {
		const fields = foundry.data.fields
		return {
			type: new fields.StringField({ required: true, nullable: false, initial: "" }),
			st: new fields.StringField({
				required: true,
				nullable: false,
				choices: stdmg.Options,
				initial: stdmg.Option.Thrust,
			}),
			leveled: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			st_mul: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			base: new fields.SchemaField(DiceGURPS.defineSchema()),
			armor_divisor: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			fragmentation: new fields.SchemaField(DiceGURPS.defineSchema()),
			fragmentation_armor_divisor: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			fragmentation_type: new fields.StringField({ required: true, nullable: false, initial: "" }),
			modifier_per_die: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
		}
	}

	override toString(): string {
		const buffer = new StringBuilder()
		if (this.st !== stdmg.Option.None) {
			if (this.leveled) buffer.push(stdmg.Option.toStringLeveled(this.st))
			else buffer.push(stdmg.Option.toString(this.st))
		}
		let convertMods = false
		if (this.parent !== null) convertMods = SheetSettings.for(this.parent.actor).use_modifying_dice_plus_adds
		if (this.base !== null) {
			const base = this.base.stringExtra(convertMods)
			if (base !== "0") {
				if (buffer.length !== 0 && base[0] !== "+" && base[0] !== "-") {
					buffer.push("+")
				}
				buffer.push(base)
			}
		}
		if (this.armor_divisor !== 1) {
			buffer.push(`(${this.armor_divisor})`)
		}
		if (this.modifier_per_die !== 0) {
			if (buffer.length !== 0) buffer.push(" ")
		}
		buffer.push(
			LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Weapon.ModifierPerDie, {
				value: this.modifier_per_die.signedString(),
			}),
		)
		const t = this.type.trim()
		if (t !== "") {
			buffer.push(" ", t)
		}
		if (this.fragmentation !== null) {
			const frag = this.fragmentation.stringExtra(convertMods)
			if (frag !== "0") {
				buffer.push(" [", frag)
				if (this.fragmentation_armor_divisor !== 1) buffer.push(`(${this.fragmentation_armor_divisor})`)
				buffer.push(` ${this.fragmentation_type}]`)
			}
		}
		return buffer.toString().trim()
	}

	resolvedValue(tooltip: TooltipGURPS | null): string {
		const base = this.baseDamageDice
		if (base.count === 0 && base.modifier === 0) return this.toString()
		const actor = this.parent.actor
		if (actor === null || !actor.isOfType(ActorType.Character)) return this.toString()
	}

	get baseDamageDice(): DiceGURPS {
		if (this.parent === null) return new DiceGURPS({ sides: 6, multiplier: 1 })
		const actor = this.parent.actor
		if (actor === null || !actor.isOfType(ActorType.Character)) return new DiceGURPS({ sides: 6, multiplier: 1 })
		const maxSt = this.parent.strength.resolveValue(this.parent, null).min * 3
		let st = 0
		const container = this.parent.parent.container
		if (
			container !== null &&
			!(container instanceof Promise) &&
			container.isOfType(ItemType.Equipment, ItemType.EquipmentContainer)
		) {
			st = container.system.rated_strength
		}
		if (st === 0) {
			switch (this.st) {
				case stdmg.Option.Thrust:
				case stdmg.Option.Swing:
					st = actor.system.strikingStrength
					break
				case stdmg.Option.LiftingThrust:
				case stdmg.Option.LiftingSwing:
					st = actor.system.liftingStrength
					break
				case stdmg.Option.TelekineticThrust:
				case stdmg.Option.TelekineticSwing:
					st = actor.system.telekineticStrength
					break
				default:
					st = Math.trunc(Math.max(actor.system.resolveAttributeCurrent(gid.Strength), 0))
			}
		}
		let percentMin = 0
		for (const bonus of this.parent.collectWeaponBonuses(1, null, feature.Type.WeaponEffectiveSTBonus)) {
			const amt = bonus.adjustedAmountForWeapon(this.parent)
			if (bonus.percent) percentMin += amt
			else st += amt
		}
		if (percentMin !== 0) st += Math.trunc((st * percentMin) / 100)
		if (st < 0) st = 0
		if (maxSt > 0 && maxSt < st) st = maxSt
		if (this.st_mul > 0) st *= this.st_mul
		let base = new DiceGURPS({ sides: 6, multiplier: 6 })
		if (this.base !== null) base = this.base
		if (container !== null && !(container instanceof Promise) && container.isOfType(ItemType.Trait)) {
			if (container.system.can_level) multiplyDice(container.system.levels, base)
		}
		let stDamage: DiceGURPS
		switch (this.st) {
			case stdmg.Option.Thrust:
			case stdmg.Option.LiftingThrust:
			case stdmg.Option.TelekineticThrust:
				stDamage = actor.system.thrustFor(st)
				break
			case stdmg.Option.Swing:
			case stdmg.Option.LiftingSwing:
			case stdmg.Option.TelekineticSwing:
				stDamage = actor.system.swingFor(st)
				break
			default:
				return base
		}
		if (
			this.leveled &&
			container !== null &&
			!(container instanceof Promise) &&
			container.isOfType(ItemType.Trait)
		) {
			multiplyDice(container.system.levels, stDamage)
		}
		base = addDice(base, stDamage)
		return base
	}

	override clean(): void {}
}

function multiplyDice(multiplier: number, d: DiceGURPS): void {
	d.count *= multiplier
	d.modifier *= multiplier
	if (d.multiplier !== 1) d.multiplier *= multiplier
}

function addDice(left: DiceGURPS, right: DiceGURPS): DiceGURPS {
	if (left.sides > 1 && right.sides > 1 && left.sides !== right.sides) {
		const sides = Math.min(left.sides, right.sides)
		const average = Int.from((sides + 1) / 2)
		const averageLeft = Int.from(((left.count * (left.sides + 1)) / 2) * left.multiplier)
		const averageRight = Int.from(((right.count * (right.sides + 1)) / 2) * right.multiplier)
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

interface WeaponDamage
	extends WeaponField<AbstractWeaponTemplate, WeaponDamageSchema>,
		ModelPropsFromSchema<WeaponDamageSchema> {}

type WeaponDamageSchema = {
	type: fields.StringField<string, string, true, false, true>
	st: fields.StringField<stdmg.Option, stdmg.Option, true, false, true>
	leveled: fields.BooleanField<boolean, boolean, true, false, true>
	st_mul: fields.NumberField<number, number, true, false, true>
	base: fields.SchemaField<DiceSchema, SourceFromSchema<DiceSchema>, DiceGURPS, true, true, true>
	armor_divisor: fields.NumberField<number, number, true, false, true>
	fragmentation: fields.SchemaField<DiceSchema, SourceFromSchema<DiceSchema>, DiceGURPS, true, true, true>
	fragmentation_armor_divisor: fields.NumberField<number, number, true, false, true>
	fragmentation_type: fields.StringField<string, string, true, false, true>
	modifier_per_die: fields.NumberField<number, number, true, false, true>
}

export { WeaponDamage, type WeaponDamageSchema }
