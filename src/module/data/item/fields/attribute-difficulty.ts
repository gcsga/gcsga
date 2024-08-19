import { difficulty } from "@util"
import fields = foundry.data.fields
import { SystemDataModel } from "@module/data/abstract.ts"
import { gid } from "@module/data/constants.ts"

class AttributeDifficulty extends foundry.abstract.DataModel<SystemDataModel, AttributeDifficultySchema> {
	static override defineSchema(): AttributeDifficultySchema {
		const fields = foundry.data.fields
		return {
			attribute: new fields.StringField<string, string, true, false>({
				required: true,
				nullable: false,
				initial: gid.Dexterity,
			}),
			difficulty: new fields.StringField<difficulty.Level, difficulty.Level, true, false>({
				required: true,
				nullable: false,
				initial: difficulty.Level.Average,
			}),
		}
	}

	override toString(): string {
		return `${this.attribute.toString()}/${this.difficulty.toString()}`
	}
}

interface AttributeDifficulty
	extends foundry.abstract.DataModel<SystemDataModel, AttributeDifficultySchema>,
		ModelPropsFromSchema<AttributeDifficultySchema> {}

type AttributeDifficultySchema = {
	attribute: fields.StringField<string, string, true, false, true>
	difficulty: fields.StringField<difficulty.Level, difficulty.Level, true, false, true>
}

export { AttributeDifficulty, type AttributeDifficultySchema }
