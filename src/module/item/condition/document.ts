// import { ActorGURPS } from "@actor"
// import { ConditionSource, ConditionSystemData } from "./data.ts"
// import { AbstractEffectGURPS } from "@item"
// import { COMPENDIA, ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
// import { getConditionList } from "./list.ts"
// import { getManeuverList } from "./maneuver.ts"
//
// class ConditionGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractEffectGURPS<TParent> {
// 	static async getConditions(): Promise<Record<string, string>> {
// 		const indexFields = ["system.slug"]
// 		const pack = game.packs.get(`${SYSTEM_NAME}.${COMPENDIA.CONDITIONS}`)
// 		if (pack) {
// 			const index = await pack.getIndex({ fields: indexFields })
// 			const conditions = index.map(a => [a.system.slug, a.name])
// 			return Object.fromEntries(conditions)
// 		} else {
// 			return {}
// 		}
// 	}
//
// 	static getAllConditions(): DeepPartial<ConditionSource>[] {
// 		const [data, folder] = [getConditionList(), "status"]
// 		return Object.entries(data).map(([id, e]) => {
// 			return {
// 				name: game.i18n.localize(`gurps.${folder}.${id}`),
// 				type: ItemType.Condition,
// 				img: `systems/${SYSTEM_NAME}/assets/${folder}/${id}.webp`,
// 				system: e,
// 			}
// 		})
// 	}
//
// 	static getAllManeuvers(): DeepPartial<ConditionSource>[] {
// 		const [data, folder] = [getManeuverList(), "maneuver"]
// 		return Object.entries(data).map(([id, e]) => {
// 			return {
// 				name: game.i18n.localize(`gurps.${folder}.${id}`),
// 				type: ItemType.Condition,
// 				img: `systems/${SYSTEM_NAME}/assets/${folder}/${id}.webp`,
// 				system: e,
// 			}
// 		})
// 	}
// }
//
// interface ConditionGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractEffectGURPS<TParent> {
// 	readonly _source: ConditionSource
// 	system: ConditionSystemData
// }
//
// export { ConditionGURPS }
