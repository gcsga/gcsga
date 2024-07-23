import { WeaponDamage } from "@item/abstract-weapon/weapon-damage.ts";
import { ItemType, gid } from "@module/data/constants.ts";
import { StringBuilder, difficulty, selfctrl } from "@util";
import {
	MookEquipmentSchema,
	MookItemSchema,
	MookMeleeSchema,
	MookNoteSchema,
	MookRangedSchema,
	MookSkillSchema,
	MookSpellSchema,
	MookTraitModifierSchema,
	MookTraitSchema,
	MookWeaponSchema,
	regex_points
} from "./data.ts";
import { Mook } from "./document.ts";

abstract class MookItem<
	TSchema extends MookItemSchema,
	TParent extends Mook | MookItem<MookItemSchema> = Mook
> extends foundry.abstract.DataModel<TParent, TSchema> {

	static override defineSchema(): MookItemSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({ choices: Object.values(ItemType), required: true, nullable: false }),
			name: new fields.StringField({ required: true, nullable: false }),
			notes: new fields.StringField({ required: true, nullable: false }),
			reference: new fields.StringField({ required: true, nullable: false }),
		}
	}

	abstract toText(): string

	static fromText<T extends MookItem<MookItemSchema>>(
		this: new (data: DeepPartial<SourceFromSchema<MookItemSchema>>, options: DataModelConstructionOptions<Mook>) => T,
		text: string
	): T {
		const self = new this({ type: ItemType.Note, name: text }, {})
		return self
	}
}

class MookTrait extends MookItem<MookTraitSchema> {

	constructor(
		data: SourceFromSchema<MookTraitSchema>,
		options: DataModelConstructionOptions<Mook>
	) {
		super(data, options)

		this.modifiers = data.modifiers.map(e => new MookTraitModifier(e, { parent: this }))
	}

	static override defineSchema(): MookTraitSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			points: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			cr: new fields.NumberField({ choices: selfctrl.Rolls, required: true, nullable: false, initial: selfctrl.Roll.NoCR }),
			levels: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			modifiers: new fields.ArrayField(new fields.SchemaField(MookTraitModifier.defineSchema()))
		}
	}

	toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		if (this.levels !== 0) buffer.push(` ${this.levels}`)
		if (this.points !== 0) buffer.push(` [${this.points}]`)
		if (this.cr !== selfctrl.Roll.NoCR) buffer.push(` (CR:${this.cr})`)
		if (this.modifiers.length !== 0) {
			const subBuffer = new StringBuilder()
			this.modifiers.forEach(mod => {
				if (subBuffer.length !== 0) subBuffer.push("; ")
				subBuffer.push(mod.toText())
			})
			buffer.push(` (${subBuffer.toString()})`)
		}
		return buffer.toString()
	}

	static override	fromText(text: string, parent: Mook): MookTrait {
		const regex_levels = /\s(\d+)$/
		const regex_cr = /\((CR:?)?\s*(\d+)\)/

		// Capture points
		let points = 0
		if (text.match(regex_points)) {
			points = parseInt(text.match(regex_points)?.[1] ?? "0")
			text = text.replace(regex_points, "").trim()
		}

		// Capture modifiers
		let modifiers: MookTraitModifier[] = []
		if (text.match(/\(.+\)/)) {
			modifiers = this._parseTraitModifiers(text.match(/\((.*)\)/)![1])
			if (modifiers.length > 0) text = text.replace(/\(.*\)/, "").trim()
		}

		// Capture Levels
		let levels = 0
		if (text.match(regex_levels)) {
			levels = parseInt(text.match(regex_levels)![1])
			text = text.replace(regex_levels, "").trim()
		}

		// Capture CR
		let cr = 0
		if (text.match(regex_cr)) {
			cr = parseInt(text.match(regex_cr)![2])
			text = text.replace(regex_cr, "").trim()
		}

		text = Mook.cleanLine(text)

		return new MookTrait({
			type: ItemType.Trait,
			name: text,
			points,
			cr,
			levels,
			notes: "",
			reference: "",
			modifiers,
		}, { parent })
	}
}

interface MookTrait extends MookItem<MookTraitSchema>, Omit<ModelPropsFromSchema<MookTraitSchema>, "modifiers"> {
	modifiers: MookTraitModifier[]
}

class MookTraitModifier extends MookItem<MookTraitModifierSchema, MookTrait> {

	static override defineSchema(): MookTraitModifierSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			cost: new fields.StringField({ required: true, nullable: false, initial: "0" }),
		}
	}

	toText(): string {
		return `${this.name}, ${this.cost}`
	}
}

interface MookTraitModifier extends MookItem<MookTraitModifierSchema, MookTrait>, ModelPropsFromSchema<MookTraitModifierSchema> { }

class MookSkill extends MookItem<MookSkillSchema> {

	static override defineSchema(): MookSkillSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			specialization: new fields.StringField({ required: true, nullable: false, initial: "" }),
			tech_level: new fields.StringField({ required: true, nullable: false, initial: "" }),
			attribute: new fields.StringField({ required: true, nullable: false, initial: gid.Dexterity }),
			difficulty: new fields.StringField({ choices: difficulty.Levels, required: true, nullable: false, initial: difficulty.Level.Average }),
			points: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			level: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
		}
	}

	toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		if (this.tech_level !== "") buffer.push(`/TL${this.tech_level}`)
		buffer.push(`-${this.level}`)
		buffer.push(` (${this.attribute}/${this.difficulty})`)
		return buffer.toString()
	}
}

interface MookSkill extends MookItem<MookSkillSchema>, ModelPropsFromSchema<MookSkillSchema> { }

class MookSpell extends MookItem<MookSpellSchema> {

	static override defineSchema(): MookSpellSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			college: new fields.ArrayField(new fields.StringField()),
			tech_level: new fields.StringField({ required: true, nullable: false, initial: "" }),
			attribute: new fields.StringField({ required: true, nullable: false, initial: gid.Intelligence }),
			difficulty: new fields.StringField({ choices: difficulty.Levels, required: true, nullable: false, initial: difficulty.Level.Hard }),
			points: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			level: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
		}
	}

	toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		if (this.tech_level !== "") buffer.push(`/TL${this.tech_level}`)
		buffer.push(`-${this.level}`)
		buffer.push(` (${this.attribute}/${this.difficulty})`)
		return buffer.toString()
	}
}

interface MookSpell extends MookItem<MookSpellSchema>, ModelPropsFromSchema<MookSpellSchema> { }

abstract class MookWeapon<TSchema extends MookWeaponSchema> extends MookItem<TSchema> {

	static override defineSchema(): MookWeaponSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			strength: new fields.StringField({ required: true, nullable: false, initial: "0" }),
			damage: new fields.SchemaField(WeaponDamage.defineSchema()),
			level: new fields.NumberField({ required: true, nullable: false, initial: 0 })
		}
	}

}

class MookMelee extends MookWeapon<MookMeleeSchema> {

	static override defineSchema(): MookMeleeSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			reach: new fields.StringField({ required: true, nullable: false, initial: "No" }),
			parry: new fields.StringField({ required: true, nullable: false, initial: "No" }),
			block: new fields.StringField({ required: true, nullable: false, initial: "No" }),
		}
	}

	toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		buffer.push(` (${this.level}):`)
		buffer.push(` ${new WeaponDamage(this.damage).toString()}`)
		if (this.strength !== "0") buffer.push(` ST:${this.strength}`)
		if (this.reach !== "No") buffer.push(` Reach: ${this.reach}`)
		if (this.parry !== "No") buffer.push(` Parry: ${this.parry}`)
		if (this.block !== "No") buffer.push(` Block: ${this.block}`)
		return buffer.toString()
	}
}

interface MookMelee extends MookWeapon<MookMeleeSchema>, ModelPropsFromSchema<MookMeleeSchema> { }


class MookRanged extends MookWeapon<MookRangedSchema> {

	static override defineSchema(): MookRangedSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			accuracy: new fields.StringField({ required: true, nullable: false, initial: "0" }),
			range: new fields.StringField({ required: true, nullable: false, initial: "" }),
			rate_of_fire: new fields.StringField({ required: true, nullable: false, initial: "0" }),
			shots: new fields.StringField({ required: true, nullable: false, initial: "" }),
			bulk: new fields.StringField({ required: true, nullable: false, initial: "" }),
			recoil: new fields.StringField({ required: true, nullable: false, initial: "0" }),
		}
	}

	toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		buffer.push(` (${this.level}):`)
		buffer.push(` ${new WeaponDamage(this.damage).toString()}`)
		if (this.strength !== "0") buffer.push(` ST:${this.strength}`)
		if (this.accuracy !== "") buffer.push(` Acc: ${this.accuracy}`)
		if (this.range !== "") buffer.push(` Range: ${this.range}`)
		if (this.rate_of_fire !== "0") buffer.push(` ROF: ${this.rate_of_fire}`)
		if (this.shots !== "") buffer.push(` Shots: ${this.shots}`)
		if (this.bulk !== "") buffer.push(` Bulk: ${this.bulk}`)
		if (this.recoil !== "0") buffer.push(` Rcl: ${this.recoil}`)
		return buffer.toString()
	}
}

interface MookRanged extends MookWeapon<MookRangedSchema>, ModelPropsFromSchema<MookRangedSchema> { }

class MookEquipment extends MookItem<MookEquipmentSchema> {

	static override defineSchema(): MookEquipmentSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			quantity: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
			tech_level: new fields.StringField({ required: true, nullable: false, initial: "" }),
			legality_class: new fields.StringField({ required: true, nullable: false, initial: "" }),
			value: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			weight: new fields.StringField({ required: true, nullable: false, initial: "0 lb" }),
			uses: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			max_uses: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
		}
	}

	toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		return buffer.toString()
	}
}

interface MookEquipment extends MookItem<MookEquipmentSchema>, ModelPropsFromSchema<MookEquipmentSchema> { }


class MookNote extends MookItem<MookNoteSchema> {

	toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		return buffer.toString()
	}
}

interface MookNote extends MookItem<MookNoteSchema>, ModelPropsFromSchema<MookNoteSchema> { }

export { MookEquipment, MookItem, MookMelee, MookNote, MookRanged, MookSkill, MookSpell, MookTrait, MookTraitModifier };

