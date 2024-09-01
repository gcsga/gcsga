import fields = foundry.data.fields
import { ItemDataModel, ItemDataSchema } from "@module/data/abstract.ts"
import { NumericCompareType } from "@module/data/constants.ts"
import { BasePrereq, type Prereq, type PrereqList } from "@system"
import { ErrorGURPS, prereq } from "@util"

class PrereqTemplate extends ItemDataModel<PrereqTemplateSchema> {
	unsatisfiedReason: string | null = null

	static override defineSchema(): PrereqTemplateSchema {
		const fields = foundry.data.fields
		return {
			...super.defineSchema(),
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

interface PrereqTemplate extends ItemDataModel<PrereqTemplateSchema>, ModelPropsFromSchema<PrereqTemplateSchema> {}

type PrereqTemplateSchema = ItemDataSchema & {
	prereqs: fields.ArrayField<fields.TypedSchemaField<Record<prereq.Type, ConstructorOf<Prereq>>>>
}

export { PrereqTemplate, type PrereqTemplateSchema }
