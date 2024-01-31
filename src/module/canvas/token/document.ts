import { ActorGURPS } from "@actor/base.ts"
import { ConditionID } from "@item/condition/data.ts"

export class TokenDocumentGURPS<TParent extends Scene | null = Scene | null> extends TokenDocument<TParent> {
	override overlayEffect: any

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
		const hasCondition = (actor as ActorGURPS<any>)?.hasCondition(statusId) || false
		const hasEffect = (actor as ActorGURPS<any>)?.gEffects.some(e => e.name === statusId)
		return hasCondition || hasEffect
	}

	override getBarAttribute(barName: string, { alternative }: any = {}): any {
		return super.getBarAttribute(barName, { alternative })
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
