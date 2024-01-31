import { ActorGURPS } from "@actor"
import type { SceneGURPS } from "../document.ts"
import { ConditionID } from "@item/condition/index.ts"

class TokenDocumentGURPS<TParent extends SceneGURPS | null = SceneGURPS | null> extends TokenDocument<TParent> {
	// override overlayEffect: any

	override get actor(): ActorGURPS<this | null> | null {
		return super.actor as ActorGURPS<this | null> | null
	}

	protected override _onCreate(
		data: this["_source"],
		options: DocumentModificationContext<TParent>,
		userId: string,
	): void {
		super._onCreate(data, options, userId)
		this.actor?.prepareData()
	}

	override hasStatusEffect(statusId: ConditionID): boolean {
		if (statusId === ConditionID.Dead) return this.overlayEffect === CONFIG.controlIcons.defeated
		const { actor } = this
		const hasCondition = (actor as ActorGURPS<this>)?.hasCondition(statusId) || false
		const hasEffect = (actor as ActorGURPS<this>)?.gEffects.some(e => e.name === statusId)
		return hasCondition || hasEffect
	}

	override getBarAttribute(barName: string, options?: { alternative?: string }): TokenResourceData | null {
		return super.getBarAttribute(barName, options)
		// const attr = alternative || (this as any)[barName]?.attribute
		// if (!attr || !this.actor) return null
		// let data = foundry.utils.getProperty((this.actor as any).system, attr)
		// if (data === null || data === undefined) return null
		// const model = game.model.Actor[this.actor.type]
		//
		// // Single values
		// if (Number.isNumeric(data)) {
		// 	return {
		// 		type: "value",
		// 		attribute: attr,
		// 		value: Number(data),
		// 		editable: foundry.utils.hasProperty(model, attr),
		// 	}
		// }
		//
		// // Attribute objects
		// else if ("value" in data && "max" in data) {
		// 	if (this.actor instanceof CharacterGURPS)
		// 		return {
		// 			type: "bar",
		// 			attribute: attr,
		// 			value: parseInt(data.value || 0),
		// 			max: parseInt(data.max || 0),
		// 			editable: true,
		// 		}
		// 	return {
		// 		type: "bar",
		// 		attribute: attr,
		// 		value: parseInt(data.value || 0),
		// 		max: parseInt(data.max || 0),
		// 		editable: foundry.utils.hasProperty(model, `${attr}.value`),
		// 	}
		// }
		//
		// // Otherwise null
		// return null
	}
}

export { TokenDocumentGURPS }
