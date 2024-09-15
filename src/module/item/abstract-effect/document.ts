// import { ActorGURPS } from "@actor"
// import { ItemGURPS } from "@item"
// import { ConditionSource, ConditionSystemData } from "@item/condition/data.ts"
// import { EffectSource, EffectSystemData } from "@item/effect/data.ts"
// import { EffectFlags } from "./data.ts"
// import { UserGURPS } from "@module/user/document.ts"
//
// abstract class AbstractEffectGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
// 	get level(): number | null {
// 		return this.canLevel ? this.system.levels.current : null
// 	}
//
// 	get canLevel(): boolean {
// 		return this.system.can_level
// 	}
//
// 	protected override _onCreate(
// 		data: this["_source"],
// 		operation: DatabaseCreateOperation<TParent>,
// 		userId: string,
// 	): void {
// 		super._onCreate(data, operation, userId)
// 		this.actor?.getActiveTokens().shift()?.showFloatyText({ create: this })
// 	}
//
// 	protected override _onDelete(operation: DatabaseDeleteOperation<TParent>, userId: string): void {
// 		super._onDelete(operation, userId)
// 		this.actor
// 			?.getActiveTokens()
// 			.shift()
// 			?.showFloatyText({ delete: { name: this._source.name } })
// 	}
//
// 	protected override async _preUpdate(
// 		changed: DeepPartial<this["_source"]>,
// 		options: DatabaseUpdateOperation<TParent> & { previousValue: number | null },
// 		user: UserGURPS,
// 	): Promise<boolean | void> {
// 		options.previousValue = this.level
// 		return super._preUpdate(changed, options, user)
// 	}
//
// 	protected override _onUpdate(
// 		data: DeepPartial<this["_source"]>,
// 		operation: DatabaseUpdateOperation<TParent> & { previousValue: number | null },
// 		userId: string,
// 	): void {
// 		super._onUpdate(data, operation, userId)
//
// 		const [priorValue, newValue] = [operation.previousValue, this.level]
// 		const valueChanged = !!priorValue && !!newValue && priorValue !== newValue
//
// 		/* Show floaty text only for unlinked conditions */
// 		if (valueChanged) {
// 			const change = newValue > priorValue ? { create: this } : { delete: this }
// 			this.actor?.getActiveTokens().shift()?.showFloatyText(change)
// 		}
// 	}
//
// 	async increaseLevel(this: AbstractEffectGURPS<ActorGURPS>): Promise<void> {
// 		await this.actor?.increaseCondition(this)
// 	}
//
// 	async decreaseLevel(this: AbstractEffectGURPS<ActorGURPS>): Promise<void> {
// 		await this.actor?.decreaseCondition(this)
// 	}
// }
//
// interface AbstractEffectGURPS<TParent extends ActorGURPS | null> extends ItemGURPS<TParent> {
// 	readonly _source: EffectSource | ConditionSource
// 	flags: EffectFlags
// 	system: EffectSystemData | ConditionSystemData
// }
//
// export { AbstractEffectGURPS }
