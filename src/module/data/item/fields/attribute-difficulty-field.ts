import { AttributeDifficulty } from "../compontents/attribute-difficulty.ts"
import fields = foundry.data.fields
import { difficulty } from "@util"

interface AttributeDifficultyFieldOptions<
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.ObjectFieldOptions<
		SourceFromSchema<AttributeDifficulty["schema"]["fields"]>,
		TRequired,
		TNullable,
		THasInitial
	> {
	attributeChoices?: Record<string, string>
	difficultyChoices?: Record<string, string>
}

class AttributeDifficultyField<
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.EmbeddedDataField<AttributeDifficulty, TRequired, TNullable, THasInitial> {
	constructor(
		options?: AttributeDifficultyFieldOptions<TRequired, TNullable, THasInitial>,
		context?: fields.DataFieldContext,
	) {
		let attributeChoices: Record<string, string> | null = null
		let difficultyChoices: Record<difficulty.Level, string> | null = null
		if (options?.attributeChoices) attributeChoices = options.attributeChoices

		if (options?.difficultyChoices) difficultyChoices = options.difficultyChoices
		super(AttributeDifficulty, options, context)
		if (attributeChoices !== null) this.attributeChoices = attributeChoices
		if (difficultyChoices !== null) this.difficultyChoices = difficultyChoices
	}

	set attributeChoices(value: Record<string, string>) {
		;(this.fields.attribute as any).choices = value
		;(this.fields.attribute as any).blank = Object.hasOwn(value, "")
	}

	set difficultyChoices(value: Record<difficulty.Level, string>) {
		;(this.fields.difficulty as any).choices = value
		;(this.fields.difficulty as any).blank = Object.hasOwn(value, "")
	}
}

export { AttributeDifficultyField }
