import fields = foundry.data.fields
import { ItemDataModel } from "@module/data/item/abstract.ts"
import { PrereqList } from "@module/data/prereq/index.ts"
import { Prereq, PrereqTypes } from "@module/data/prereq/types.ts"
import { ErrorGURPS, NumericComparison, prereq } from "@util"

class PrereqTemplate extends ItemDataModel<PrereqTemplateSchema> {
	unsatisfiedReason: string | null = null

	static override defineSchema(): PrereqTemplateSchema {
		const fields = foundry.data.fields
		return {
			prereqs: new fields.ArrayField(new fields.TypedSchemaField(PrereqTypes), {
				initial: [
					{
						type: prereq.Type.List,
						id: "root",
						all: true,
						when_tl: { compare: NumericComparison.Option.AnyNumber, qualifier: 0 },
						prereqs: [],
					},
				],
			}),
		}
	}

	get rootPrereq(): PrereqList {
		const rootPrereq = this.prereqs.find(e => e.id === "root")
		if (!rootPrereq) throw ErrorGURPS("Item has no root prerequisite!")
		if (!rootPrereq.isOfType(prereq.Type.List)) throw ErrorGURPS("Root prerequisite is not a prerequisite list!")
		return rootPrereq
	}

	get hasPrereqs(): boolean {
		return this.rootPrereq.children.length !== 0
	}

	protected _fillWithNameableKeysFromPrereqs(m: Map<string, string>, existing: Map<string, string>): void {
		if (!this.hasPrereqs) return
		this.rootPrereq.fillWithNameableKeys(m, existing)
	}
}

interface PrereqTemplate extends ItemDataModel<PrereqTemplateSchema>, ModelPropsFromSchema<PrereqTemplateSchema> {}

type PrereqTemplateSchema = {
	prereqs: fields.ArrayField<fields.TypedSchemaField<Record<prereq.Type, ConstructorOf<Prereq>>>>
}

export { PrereqTemplate, type PrereqTemplateSchema }
