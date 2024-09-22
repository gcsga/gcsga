import { ActorDataModel } from "@module/data/abstract.ts"
import fields = foundry.data.fields
import { encumbrance } from "@util"
import { CharacterDataGURPS } from "../character.ts"
import { ActorInst } from "../helpers.ts"
import { ActorType } from "@module/data/constants.ts"

type CharacterEncumbranceSchema = {
	levels: fields.ArrayField<fields.EmbeddedDataField<CharacterEncumbranceEntry>>
	current: fields.NumberField<number, number, true, false, true>
	overencumbered: fields.BooleanField<boolean, boolean, true, false, true>
}

type CharacterEncumbranceEntrySchema = {
	level: fields.StringField<encumbrance.Level, encumbrance.Level, true, false, true>
	name: fields.StringField<string, string, true, false, true>
	maxLoad: fields.NumberField<number, number, true, false, true>
	move: fields.NumberField<number, number, true, false, true>
	dodge: fields.NumberField<number, number, true, false, true>
}

class CharacterEncumbrance extends foundry.abstract.DataModel<ActorDataModel, CharacterEncumbranceSchema> {
	static override defineSchema(): CharacterEncumbranceSchema {
		const fields = foundry.data.fields
		return {
			levels: new fields.ArrayField(new fields.EmbeddedDataField(CharacterEncumbranceEntry), {
				required: false,
				nullable: false,
				initial: [],
			}),
			current: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			overencumbered: new fields.BooleanField({ required: true, nullable: false, initial: false }),
		}
	}

	get actor(): ActorInst<ActorType.Character> {
		return this.parent.parent as ActorInst<ActorType.Character>
	}

	get currentLevel(): CharacterEncumbranceEntry {
		return this.levels[this.current]
	}

	get percentLoad(): number {
		return Math.trunc((this.currentLoad / this.maxLoad) * 100)
	}

	get currentLoad(): number {
		return this.actor.system.weightCarried(false)
	}

	get maxLoad(): number {
		return this.levels.at(-1)!.maxLoad
	}

	static for(actor: CharacterDataGURPS): CharacterEncumbrance {
		const currentLevel = actor.encumbranceLevel(false)
		const levels = encumbrance.Levels.map(level => {
			return {
				level,
				name: encumbrance.Level.toString(level),
				maxLoad: actor.maximumCarry(level),
				move: actor.move(level),
				dodge: actor.dodge(level),
			}
		})
		return new CharacterEncumbrance(
			{
				levels,
				current: encumbrance.Levels.indexOf(currentLevel),
				overencumbered: actor.weightCarried(false) > levels.at(-1)!.maxLoad,
			},
			{ parent: actor },
		)
	}
}

class CharacterEncumbranceEntry extends foundry.abstract.DataModel<ActorDataModel, CharacterEncumbranceEntrySchema> {
	static override defineSchema(): CharacterEncumbranceEntrySchema {
		const fields = foundry.data.fields
		return {
			level: new fields.StringField({
				required: true,
				nullable: false,
				choices: encumbrance.Levels,
				initial: encumbrance.Level.No,
			}),
			name: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
			}),
			maxLoad: new fields.NumberField({ required: true, nullable: false, min: 0, initial: 0 }),
			move: new fields.NumberField({ required: true, nullable: false, min: 0, initial: 0 }),
			dodge: new fields.NumberField({ required: true, nullable: false, min: 0, initial: 0 }),
		}
	}
}

interface CharacterEncumbrance extends ModelPropsFromSchema<CharacterEncumbranceSchema> {}

interface CharacterEncumbranceEntry extends ModelPropsFromSchema<CharacterEncumbranceEntrySchema> {}

export { CharacterEncumbrance, CharacterEncumbranceEntry }
