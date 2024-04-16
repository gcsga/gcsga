import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { ConditionSource, ConditionSystemData } from "@item/condition/data.ts"
import { EffectSource, EffectSystemData } from "@item/effect/data.ts"
import { UserGURPS } from "@module/user/document.ts"

abstract class AbstractEffectGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	get level(): number | null {
		return this.system.can_level ? this.system.levels.current : null
	}

	protected override _onCreate(
		data: this["_source"],
		options: DocumentModificationContext<TParent>,
		userId: string,
	): void {
		super._onCreate(data, options, userId)
		this.actor?.getActiveTokens().shift()?.showFloatyText({ create: this })
	}

	protected override _onDelete(options: DocumentModificationContext<TParent>, userId: string): void {
		super._onDelete(options, userId)
		this.actor
			?.getActiveTokens()
			.shift()
			?.showFloatyText({ delete: { name: this._source.name } })
	}

	protected override async _preUpdate(
		changed: DeepPartial<this["_source"]>,
		options: AbstractEffectModificationContext<TParent>,
		user: UserGURPS,
	): Promise<boolean | void> {
		options.previousValue = this.level
		return super._preUpdate(changed, options, user)
	}

	protected override _onUpdate(
		data: DeepPartial<this["_source"]>,
		options: AbstractEffectModificationContext<TParent>,
		userId: string,
	): void {
		super._onUpdate(data, options, userId)

		const [priorValue, newValue] = [options.previousValue, this.level]
		const valueChanged = !!priorValue && !!newValue && priorValue !== newValue

		/* Show floaty text only for unlinked conditions */
		if (valueChanged) {
			const change = newValue > priorValue ? { create: this } : { delete: this }
			this.actor?.getActiveTokens().shift()?.showFloatyText(change)
		}
	}

	async increaseLevel(this: AbstractEffectGURPS<ActorGURPS>): Promise<void> {
		await this.actor?.increaseCondition(this)
	}

	async decreaseLevel(this: AbstractEffectGURPS<ActorGURPS>): Promise<void> {
		await this.actor?.decreaseCondition(this)
	}
}

interface AbstractEffectGURPS<TParent extends ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: EffectSource | ConditionSource
	system: EffectSystemData | ConditionSystemData
}

interface AbstractEffectModificationContext<TParent extends ActorGURPS | null>
	extends DocumentModificationContext<TParent> {
	previousValue?: number | null
}

export { AbstractEffectGURPS }
