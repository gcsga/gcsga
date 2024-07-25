import { StringCriteria } from "@module/util/string-criteria.ts"
import { spellmatch } from "@util"
import { SpellBonusSchema } from "./data.ts"
import { BaseFeature, LeveledAmount } from "./base.ts"

class SpellBonus extends BaseFeature<SpellBonusSchema> {
	static override defineSchema(): SpellBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			...LeveledAmount.defineSchema(),
			match: new fields.StringField({ choices: spellmatch.Types, initial: spellmatch.Type.Name }),
			name: new fields.SchemaField(StringCriteria.defineSchema()),
			tags: new fields.SchemaField(StringCriteria.defineSchema()),
		}
	}

	constructor(data: DeepPartial<SourceFromSchema<SpellBonusSchema>>) {
		super(data)

		this.name = new StringCriteria(data.name)
		this.tags = new StringCriteria(data.tags)
	}

	matchForType(name: string, powerSource: string, colleges: string[]): boolean {
		return spellmatch.Type.matchForType(this.match, this.name, name, powerSource, colleges)
	}
}

interface SpellBonus
	extends BaseFeature<SpellBonusSchema>,
		Omit<ModelPropsFromSchema<SpellBonusSchema>, "name" | "specialization" | "tags"> {
	name: StringCriteria
	specialization: StringCriteria
	tags: StringCriteria
}

export { SpellBonus }
