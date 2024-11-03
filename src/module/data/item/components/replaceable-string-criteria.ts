import { StringCriteria, StringCriteriaSchema } from "./string-criteria.ts"
import { ReplaceableStringField } from "@module/data/fields/replaceable-string-field.ts"

class ReplaceableStringCriteria extends StringCriteria<ReplaceableStringCriteriaSchema> {
	static override defineSchema(): ReplaceableStringCriteriaSchema {
		return {
			...super.defineSchema(),
			qualifier: new ReplaceableStringField({ required: true, nullable: false }),
		}
	}
}

type ReplaceableStringCriteriaSchema = StringCriteriaSchema & {
	qualifier: ReplaceableStringField<string, string, true, false, true>
}

export { ReplaceableStringCriteria }
