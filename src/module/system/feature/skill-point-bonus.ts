import { StringCriteria } from "@module/util/string-criteria.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { TooltipGURPS, feature } from "@util"
import { SkillPointBonusSchema } from "./data.ts"
import { BaseFeature } from "./base.ts"
import { Nameable } from "@module/util/nameable.ts"

class SkillPointBonus extends BaseFeature<SkillPointBonusSchema> {
	static override TYPE = feature.Type.SkillPointBonus

	static override defineSchema(): SkillPointBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			name: new fields.SchemaField(StringCriteria.defineSchema()),
			specialization: new fields.SchemaField(StringCriteria.defineSchema()),
			tags: new fields.SchemaField(StringCriteria.defineSchema()),
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

interface SkillPointBonus
	extends BaseFeature<SkillPointBonusSchema>,
		Omit<ModelPropsFromSchema<SkillPointBonusSchema>, "name" | "specialization" | "tags"> {
	name: StringCriteria
	specialization: StringCriteria
	tags: StringCriteria
}

export { SkillPointBonus }
