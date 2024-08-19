import fields = foundry.data.fields
import { SystemDataModel } from "@module/data/abstract.ts"
import { NumericCompareType } from "@module/data/constants.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { BasePrereq, type Prereq, type PrereqList } from "@system"
import { ErrorGURPS, prereq } from "@util"

class PrereqTemplate extends SystemDataModel<ItemGURPS2, PrereqTemplateSchema> {
	static override defineSchema(): PrereqTemplateSchema {
		const fields = foundry.data.fields
		return {
			prereqs: new fields.ArrayField(new fields.TypedSchemaField(BasePrereq.TYPES), {
				initial: [
					{
						type: prereq.Type.List,
						id: "root",
						all: true,
						when_tl: { compare: NumericCompareType.AnyNumber, qualifier: 0 },
						prereqs: [],
					},
				],
			}),
		}
	}

	get rootPrereq(): PrereqList {
		const rootPrereq = this.prereqs.find(e => e.id === "root")
		if (!rootPrereq) throw ErrorGURPS("Item has no root prerequisite!")
		if (rootPrereq.type !== prereq.Type.List) throw ErrorGURPS("Root prerequisite is not a prerequisite list!")
		return rootPrereq
	}
}

interface PrereqTemplate
	extends SystemDataModel<ItemGURPS2, PrereqTemplateSchema>,
		ModelPropsFromSchema<PrereqTemplateSchema> {}

type PrereqTemplateSchema = {
	prereqs: fields.ArrayField<fields.TypedSchemaField<Record<prereq.Type, ConstructorOf<Prereq>>>>
}

export { PrereqTemplate, type PrereqTemplateSchema }
