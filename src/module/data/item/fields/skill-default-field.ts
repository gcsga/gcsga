import { SkillDefault } from "../components/skill-default.ts"
import fields = foundry.data.fields

interface SkillDefaultFieldOptions<
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.ObjectFieldOptions<
		SourceFromSchema<SkillDefault["schema"]["fields"]>,
		TRequired,
		TNullable,
		THasInitial
	> {
	typeChoices?: Record<string, string>
}

class SkillDefaultField<
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends fields.EmbeddedDataField<SkillDefault, TRequired, TNullable, THasInitial> {
	constructor(
		options?: SkillDefaultFieldOptions<TRequired, TNullable, THasInitial>,
		context?: fields.DataFieldContext,
	) {
		let typeChoices: Record<string, string> | null = null
		if (options?.typeChoices) typeChoices = options.typeChoices
		super(SkillDefault, options, context)
		if (typeChoices !== null) this.typeChoices = typeChoices
	}

	set typeChoices(value: Record<string, string>) {
		;(this.fields.type as any).choices = value
		;(this.fields.type as any).blank = Object.hasOwn(value, "")
	}
}

export { SkillDefaultField }
