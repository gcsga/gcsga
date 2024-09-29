import { Nameable } from "@module/util/index.ts"
import { StringCriteria } from "@module/util/string-criteria.ts"
import { TooltipGURPS, feature } from "@util"
import { LocalizeGURPS } from "@util/localize.ts"
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"

class SkillPointBonus extends BaseFeature<SkillPointBonusSchema> {
	static override TYPE = feature.Type.SkillPointBonus

	static override defineSchema(): SkillPointBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			name: new fields.EmbeddedDataField(StringCriteria),
			specialization: new fields.EmbeddedDataField(StringCriteria),
			tags: new fields.EmbeddedDataField(StringCriteria),
		}
	}

	constructor(data: DeepPartial<SourceFromSchema<SkillPointBonusSchema>>) {
		super(data)

		this.name = new StringCriteria(data.name)
		this.specialization = new StringCriteria(data.specialization)
		this.tags = new StringCriteria(data.tags)
	}

	override addToTooltip(tooltip: TooltipGURPS | null): void {
		if (tooltip !== null) {
			let lang = LocalizeGURPS.translations.gurps.feature.points_multiple
			if (this.adjustedAmount === 1) lang = LocalizeGURPS.translations.gurps.feature.points_one
			if (tooltip.length !== 0) tooltip.push("<br>")
			tooltip.push(
				LocalizeGURPS.format(lang, {
					source: this.parentName,
					// amount: this.leveledAmount.format(false),
					amount: this.format(false),
				}),
			)
		}
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.specialization.qualifier, m, existing)
		Nameable.extract(this.name.qualifier, m, existing)
		Nameable.extract(this.tags.qualifier, m, existing)
	}
}

interface SkillPointBonus extends BaseFeature<SkillPointBonusSchema>, ModelPropsFromSchema<SkillPointBonusSchema> {}

type SkillPointBonusSchema = BaseFeatureSchema & {
	name: StringCriteriaField<true, false, true>
	specialization: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
}

export { SkillPointBonus, type SkillPointBonusSchema }
