import { Nameable } from "@module/util/index.ts"
import { StringCriteria } from "@module/util/string-criteria.ts"
import { feature, spellmatch } from "@util"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import fields = foundry.data.fields

class SpellBonus extends BaseFeature<SpellBonusSchema> {
	static override TYPE = feature.Type.SpellBonus

	static override defineSchema(): SpellBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			match: new fields.StringField({ choices: spellmatch.Types, initial: spellmatch.Type.Name }),
			name: new fields.EmbeddedDataField(StringCriteria),
			tags: new fields.EmbeddedDataField(StringCriteria),
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

interface SpellBonus extends BaseFeature<SpellBonusSchema>, ModelPropsFromSchema<SpellBonusSchema> {}

type SpellBonusSchema = BaseFeatureSchema & {
	match: fields.StringField<spellmatch.Type>
	name: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
}

export { SpellBonus, type SpellBonusSchema }
