import { Nameable } from "@module/util/index.ts"
import { StringCriteria } from "@module/util/string-criteria.ts"
import { feature, spellmatch } from "@util"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import fields = foundry.data.fields

class SpellPointBonus extends BaseFeature<SpellPointBonusSchema> {
	static override TYPE = feature.Type.SpellPointBonus

	static override defineSchema(): SpellPointBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			match: new fields.StringField({ choices: spellmatch.Types, initial: spellmatch.Type.Name }),
			name: new fields.EmbeddedDataField(StringCriteria),
			tags: new fields.EmbeddedDataField(StringCriteria),
		}
	}

	constructor(data: DeepPartial<SourceFromSchema<SpellPointBonusSchema>>) {
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

interface SpellPointBonus extends BaseFeature<SpellPointBonusSchema>, ModelPropsFromSchema<SpellPointBonusSchema> {}

type SpellPointBonusSchema = BaseFeatureSchema & {
	match: fields.StringField<spellmatch.Type>
	name: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
}

export { SpellPointBonus, type SpellPointBonusSchema }
