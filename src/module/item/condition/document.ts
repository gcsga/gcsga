import { ActorGURPS } from "@actor"
import { ConditionSource, ConditionSystemData, Consequence } from "./data.ts"
import { AbstractEffectGURPS } from "@item"
import { ConditionID, ItemType, ManeuverID } from "@module/data/constants.ts"
import { RollModifier } from "@module/data/types.ts"
import { DurationType, DurationTypes } from "@item/abstract-effect/data.ts"

const fields = foundry.data.fields

class ConditionGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractEffectGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.Condition }),
				id: new fields.StringField<ConditionID | ManeuverID, ConditionID | ManeuverID, true, true>({
					nullable: true,
				}),
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
}

interface ConditionGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractEffectGURPS<TParent> {
	readonly _source: ConditionSource
	system: ConditionSystemData
}

export { ConditionGURPS }
