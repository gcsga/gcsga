import { ActorDataModel } from "@module/data/abstract.ts"
import fields = foundry.data.fields

class CharacterBonus extends foundry.abstract.DataModel<ActorDataModel, CharacterBonusSchema> {
	static override defineSchema(): CharacterBonusSchema {
		const fields = foundry.data.fields
		return {
			value: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			tooltip: new fields.StringField({ required: true, nullable: false, initial: "" }),
		}
	}
}

type CharacterBonusSchema = {
	value: fields.NumberField<number, number, true, false, true>
	tooltip: fields.StringField<string, string, true, false, true>
}

export { CharacterBonus, type CharacterBonusSchema }
