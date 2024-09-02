import { ActorDataModel } from "@module/data/abstract.ts"
import { AttributeDef, AttributeGURPS, AttributeSchema, ThresholdOp } from "@system"
import fields = foundry.data.fields

class AttributeHolderTemplate extends ActorDataModel<AttributeHolderTemplateSchema> {
	static override defineSchema(): AttributeHolderTemplateSchema {
		const fields = foundry.data.fields
		return {
			attributes: new fields.ArrayField(new fields.SchemaField(AttributeGURPS.defineSchema())),
		}
	}

	get attributeMap(): Map<string, AttributeGURPS> {
		return new Map(this.attributes.map(e => [e.id, e]))
	}

	resolveAttributeDef(id: string): AttributeDef | null {
		if (this.attributeMap.has(id)) return this.attributeMap.get(id)!.definition
		console.error(`No Attribute definition found for id "${id}"`)
		return null
	}

	resolveAttribute(id: string): AttributeGURPS | null {
		if (this.attributeMap.has(id)) return this.attributeMap.get(id)!
		console.error(`No Attribute definition found for id "${id}"`)
		return null
	}

	resolveAttributeName(id: string): string {
		const def = this.resolveAttributeDef(id)
		if (def !== null) {
			return def.name
		}
		return ""
	}

	resolveAttributeCurrent(id: string): number {
		if (this.attributeMap.has(id)) return this.attributeMap.get(id)!.current
		console.error(`No Attribute found for id "${id}"`)
		return Number.MIN_SAFE_INTEGER
	}

	temporaryST(initialST: number): number {
		const divisor = 2 * Math.min(this.countThresholdOpMet(ThresholdOp.HalveST), 2)
		let ST = initialST
		if (divisor > 0) ST = Math.ceil(initialST / divisor)
		if (ST < 1 && initialST > 0) return 1
		return ST
	}

	countThresholdOpMet(op: ThresholdOp): number {
		let total = 0
		for (const attribute of this.attributes) {
			const t = attribute.currentThreshold
			if (t !== null && t.ops.includes(op)) total++
		}
		return total
	}
}

interface AttributeHolderTemplate extends Omit<ModelPropsFromSchema<AttributeHolderTemplateSchema>, "attributes"> {
	attributes: AttributeGURPS[]
}

type AttributeHolderTemplateSchema = {
	attributes: fields.ArrayField<fields.SchemaField<AttributeSchema>>
}

export { AttributeHolderTemplate, type AttributeHolderTemplateSchema }
