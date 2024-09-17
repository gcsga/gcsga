import { StringCriteria } from "@module/util/string-criteria.ts"
import { feature, spellmatch } from "@util"
import { SpellBonusSchema } from "./data.ts"
import { BaseFeature } from "./base-feature.ts"
import { Nameable } from "@module/util/nameable.ts"

class SpellBonus extends BaseFeature<SpellBonusSchema> {
	static override TYPE = feature.Type.SpellBonus

	static override defineSchema(): SpellBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
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

	matchForType(replacements: Map<string, string>, name: string, powerSource: string, colleges: string[]): boolean {
		return spellmatch.Type.matchForType(this.match, replacements, this.name, name, powerSource, colleges)
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		if (this.match !== spellmatch.Type.AllColleges) {
			Nameable.extract(this.name.qualifier, m, existing)
		}
		Nameable.extract(this.tags.qualifier, m, existing)
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