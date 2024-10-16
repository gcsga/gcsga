import { ActorDataModel } from "@module/data/actor/abstract.ts"
import fields = foundry.data.fields
import { threshold } from "@util"
import { AttributeDef, AttributeGURPS } from "@module/data/attribute/index.ts"
import { Attributes } from "@module/data/attribute/attributes.ts"

class AttributeHolderTemplate extends ActorDataModel<AttributeHolderTemplateSchema> {
	static override defineSchema(): AttributeHolderTemplateSchema {
		const fields = foundry.data.fields
		return {
			attributes: new fields.EmbeddedDataField(Attributes),
			// attributes: new fields.ArrayField(new fields.SchemaField(AttributeGURPS.defineSchema())),
		}
	}

	// get attributeMap(): Map<string, AttributeGURPS> {
	// 	return new Map(this.attributes.map(e => [e.id, e]))
	// }
	//
	resolveAttributeDef(id: string): AttributeDef | null {
		if (this.attributes.map.has(id)) return this.attributes.map.get(id)!.definition
		// console.error(`No Attribute definition found for id "${id}"`)
		return null
	}

	resolveAttribute(id: string): AttributeGURPS | null {
		if (this.attributes.map.has(id)) return this.attributes.map.get(id)!
		// console.error(`No Attribute definition found for id "${id}"`)
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
		if (this.attributes.map.has(id)) return this.attributes.map.get(id)!.current
		// console.error(`No Attribute found for id "${id}"`)
		return Number.MIN_SAFE_INTEGER
	}

	temporaryST(initialST: number): number {
		const divisor = 2 * Math.min(this.countThresholdOpMet(threshold.Op.HalveST), 2)
		let ST = initialST
		if (divisor > 0) ST = Math.ceil(initialST / divisor)
		if (ST < 1 && initialST > 0) return 1
		return ST
	}

	countThresholdOpMet(op: threshold.Op): number {
		let total = 0
		for (const attribute of this.attributes.list) {
			const t = attribute.currentThreshold
			if (t !== null && t.ops.includes(op)) total += 1
		}
		return total
	}
}

interface AttributeHolderTemplate extends ModelPropsFromSchema<AttributeHolderTemplateSchema> {}

type AttributeHolderTemplateSchema = {
	// attributes: fields.ArrayField<
	// 	fields.SchemaField<AttributeSchema, SourceFromSchema<AttributeSchema>, AttributeGURPS>
	// >
	attributes: fields.EmbeddedDataField<Attributes>
	// 	fields.SchemaField<AttributeSchema, SourceFromSchema<AttributeSchema>, AttributeGURPS>
	// >
}
export { AttributeHolderTemplate, type AttributeHolderTemplateSchema }
