import { ActorGURPS } from "@actor"
import { ConditionSource, ConditionSystemData, Consequence } from "./data.ts"
import { AbstractEffectGURPS } from "@item"
import { COMPENDIA, ConditionID, ItemType, ManeuverID, SYSTEM_NAME } from "@module/data/constants.ts"
import { RollModifier } from "@module/data/types.ts"
import { DurationType, DurationTypes } from "@item/abstract-effect/data.ts"
import { getConditionList } from "./list.ts"
import { getManeuverList } from "./maneuver.ts"

const fields = foundry.data.fields

class ConditionGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractEffectGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.Condition }),
				id: new fields.StringField<ConditionID | ManeuverID, ConditionID | ManeuverID, true, false>(),
				slug: new fields.StringField<ConditionID | ManeuverID, ConditionID | ManeuverID, true, false>(),
				modifiers: new fields.ArrayField(new fields.ObjectField<RollModifier>()),
				can_level: new fields.BooleanField({ initial: false }),
				levels: new fields.SchemaField(
					{
						max: new fields.NumberField({ integer: true }),
						current: new fields.NumberField({ integer: true }),
					},
					{ required: false },
				),
				overlay: new fields.BooleanField({ required: false }),
				duration: new fields.SchemaField({
					type: new fields.StringField<DurationType>({
						choices: DurationTypes,
						initial: DurationType.None,
					}),
					startRound: new fields.NumberField({ nullable: true }),
					startTime: new fields.NumberField({ nullable: true }),
					rounds: new fields.NumberField({ nullable: true }),
					seconds: new fields.NumberField({ nullable: true }),
					turns: new fields.NumberField({ nullable: true }),
					combat: new fields.StringField({ nullable: true }),
				}),
				reference: new fields.StringField(),
				reference_highlight: new fields.StringField(),
				checks: new fields.ArrayField(new fields.ObjectField<RollModifier>()),
				consequences: new fields.ArrayField(new fields.ObjectField<Consequence>()),
			}),
		})
	}

	static async getConditions(): Promise<Record<string, string>> {
		const indexFields = ["system.slug"]
		const pack = game.packs.get(`${SYSTEM_NAME}.${COMPENDIA.CONDITIONS}`)
		if (pack) {
			const index = await pack.getIndex({ fields: indexFields })
			const conditions = index.map(a => [a.system.slug, a.name])
			return Object.fromEntries(conditions)
		} else {
			return {}
		}
	}

	// static getData(id: ConditionID | ManeuverID): Partial<ConditionSource> {
	// 	const [data, folder] = Object.values(ConditionID).includes(id as ConditionID)
	// 		? [getConditionList()[id as ConditionID], "status"]
	// 		: [getManeuverList()[id as ManeuverID], "maneuver"]
	// 	return {
	// 		name: game.i18n.localize(`gurps.${folder}.${id}`),
	// 		type: ItemType.Condition,
	// 		img: `systems/${SYSTEM_NAME}/assets/${folder}/${id}.webp`,
	// 		system: data,
	// 	}
	// }

	static getAllConditions(): DeepPartial<ConditionSource>[] {
		const [data, folder] = [getConditionList(), "status"]
		return Object.entries(data).map(([id, e]) => {
			return {
				name: game.i18n.localize(`gurps.${folder}.${id}`),
				type: ItemType.Condition,
				img: `systems/${SYSTEM_NAME}/assets/${folder}/${id}.webp`,
				system: e,
			}
		})
	}

	static getAllManeuvers(): DeepPartial<ConditionSource>[] {
		const [data, folder] = [getManeuverList(), "maneuver"]
		return Object.entries(data).map(([id, e]) => {
			return {
				name: game.i18n.localize(`gurps.${folder}.${id}`),
				type: ItemType.Condition,
				img: `systems/${SYSTEM_NAME}/assets/${folder}/${id}.webp`,
				system: e,
			}
		})
	}
}

interface ConditionGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractEffectGURPS<TParent> {
	readonly _source: ConditionSource
	system: ConditionSystemData
}

export { ConditionGURPS }
