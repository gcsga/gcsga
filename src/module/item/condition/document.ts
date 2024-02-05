import { EffectGURPS } from "@item/effect/document.ts"
import { getConditionList } from "./list.ts"
import { getManeuverList } from "./maneuver.ts"
import { DurationType, EffectModificationContext } from "@item/effect/data.ts"
import { ConditionSource, ConditionSystemSource } from "./data.ts"
import { ActorGURPS } from "@actor"
import { ConditionID, ItemType, ManeuverID, SYSTEM_NAME } from "@data"

export interface ConditionGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends EffectGURPS<TParent> {
	readonly _source: ConditionSource
	system: ConditionSystemSource

	type: ItemType.Condition
}

export class ConditionGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends EffectGURPS<TParent> {
	static getData(id: ConditionID | ManeuverID): Partial<ConditionSource> {
		const [data, folder] = Object.values(ConditionID).includes(id as ConditionID)
			? [getConditionList()[id as ConditionID], "status"]
			: [getManeuverList()[id as ManeuverID], "maneuver"]
		return {
			name: game.i18n.localize(`gurps.${folder}.${id}`),
			type: ItemType.Condition,
			img: `systems/${SYSTEM_NAME}/assets/${folder}/${id}.webp`,
			system: fu.mergeObject(ConditionGURPS.defaults, data) as ConditionSystemSource,
		}
	}

	static get defaults(): ConditionSystemSource {
		return {
			id: null,
			can_level: false,
			reference: "",
			reference_highlight: "",
			checks: [],
			consequences: [],
			duration: {
				type: DurationType.None,
				rounds: 0,
				turns: 0,
				seconds: 0,
				startRound: 0,
				startTurn: 0,
				startTime: 0,
				combat: null,
			},
			slug: "",
			_migration: { previous: null, version: null },
		}
	}

	protected override _preUpdate(
		changed: DeepPartial<this["_source"]>,
		options: EffectModificationContext<TParent>,
		user: foundry.documents.BaseUser,
	): Promise<boolean | void> {
		options.previousID = this.cid
		if (changed.system?.id !== this.cid) this._displayScrollingStatus(false)
		return super._preUpdate(changed, options, user)
	}

	protected override _onUpdate(
		data: DeepPartial<this["_source"]>,
		options: EffectModificationContext<TParent>,
		userId: string,
	): void {
		super._onUpdate(data, options, userId)
		const [priorID, newID] = [options.previousID, this.cid]
		const idChanged = !!priorID && !!newID && priorID !== newID
		if (idChanged) {
			this._displayScrollingStatus(true)
		}
	}

	get cid(): ConditionID | ManeuverID | null {
		return this.system.id
	}
}
