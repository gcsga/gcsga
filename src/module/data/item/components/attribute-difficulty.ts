import { difficulty } from "@util"
import { ItemDataModel } from "@module/data/item/abstract.ts"
import { ItemType, gid } from "@module/data/constants.ts"
import { getAttributeChoices } from "@module/data/attribute/helpers.ts"
import { ActorGURPS2 } from "@module/documents/actor.ts"
import { SheetSettings } from "@module/data/sheet-settings.ts"
import { ToggleableStringField } from "@module/data/fields/toggleable-string-fields.ts"

class AttributeDifficulty extends foundry.abstract.DataModel<ItemDataModel, AttributeDifficultySchema> {
	constructor(
		data?: DeepPartial<SourceFromSchema<AttributeDifficultySchema>>,
		options?: DataModelConstructionOptions<ItemDataModel>,
	) {
		super(data, options)
		const blank = options?.parent?.parent.type === ItemType.Technique
		;(this.schema.fields.attribute as any).choices = getAttributeChoices(
			options?.parent?.actor ?? null,
			this.attribute,
			"GURPS.AttributeDifficulty.AttributeKey",
			{
				blank,
				ten: true,
				size: false,
				dodge: false,
				parry: false,
				block: false,
				skill: false,
			},
		).choices
	}

	static override defineSchema(): AttributeDifficultySchema {
		const attributeChoices = getAttributeChoices(null, gid.Dexterity, "GURPS.AttributeDifficulty.AttributeKey", {
			blank: false,
			ten: true,
			size: false,
			dodge: false,
			parry: false,
			block: false,
			skill: false,
		}).choices

		return {
			attribute: new ToggleableStringField({
				required: true,
				nullable: false,
				blank: true,
				choices: attributeChoices,
				initial: gid.Dexterity,
				label: "GURPS.AttributeDifficulty.FIELDS.Attribute.Name",
			}),
			difficulty: new ToggleableStringField({
				required: true,
				nullable: false,
				blank: false,
				choices: difficulty.LevelsChoices("GURPS.AttributeDifficulty.DifficultyKey"),
				initial: difficulty.Level.Average,
				label: "GURPS.AttributeDifficulty.FIELDS.Difficulty.Name",
			}),
		}
	}

	get actor(): ActorGURPS2 | null {
		return this.parent.actor
	}

	override toString(): string {
		const attributes = SheetSettings.for(this.actor).attributes
		const attDef = attributes.find(e => e.id === this.attribute)
		const attValue = attDef?.name ?? this.attribute

		const diffValue = this.difficulty.toUpperCase()

		return `${attValue}/${diffValue}`
	}
}

interface AttributeDifficulty
	extends foundry.abstract.DataModel<ItemDataModel, AttributeDifficultySchema>,
		ModelPropsFromSchema<AttributeDifficultySchema> {}

type AttributeDifficultySchema = {
	attribute: ToggleableStringField<string, string, true, false, true>
	difficulty: ToggleableStringField<difficulty.Level, difficulty.Level, true, false, true>
}

export { AttributeDifficulty, type AttributeDifficultySchema }
