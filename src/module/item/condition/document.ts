import { ActorGURPS } from "@actor/document.ts"
import { EffectGURPS } from "@item/effect/document.ts"
import { getConditionList } from "./list.ts"
import { getManeuverList } from "./maneuver.ts"
import { mergeObject } from "types/foundry/common/utils/helpers.js"
import { DurationType, EffectModificationContext } from "@item/effect/data.ts"
import { BaseUser } from "types/foundry/common/documents/module.js"
import { ItemType } from "@item"
import { ConditionID, ConditionSource, ConditionSystemSource, ManeuverID } from "./data.ts"
import { SYSTEM_NAME } from "@module/data/index.ts"

export interface ConditionGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends EffectGURPS<TParent> {
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
			system: mergeObject(ConditionGURPS.defaults, data) as ConditionSystemSource,
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
		}
	}

	protected override _preUpdate(
		changed: DeepPartial<this["_source"]>,
		options: EffectModificationContext<TParent>,
		user: BaseUser,
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
