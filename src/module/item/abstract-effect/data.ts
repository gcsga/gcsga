// import fields = foundry.data.fields
// import { BaseItemSourceGURPS, ItemFlagsGURPS, ItemSystemSource } from "@item/base/data.ts"
// import { ItemSystemModel, ItemSystemSchema } from "@item/base/schema.ts"
// import { EffectType, ItemFlags, SYSTEM_NAME } from "@module/data/constants.ts"
// import { RollModifier } from "@module/data/types.ts"
// import { BaseFeature } from "@system/feature/base.ts"
// import { feature } from "@util"
// import { AbstractEffectGURPS } from "./document.ts"
// import { Feature, FeatureTypes } from "@system/feature/types.ts"
//
// type EffectFlags = ItemFlagsGURPS & {
// 	[SYSTEM_NAME]: {
// 		[ItemFlags.Overlay]: boolean
// 	}
// }
// export enum DurationType {
// 	Seconds = "seconds",
// 	Turns = "turns",
// 	Rounds = "rounds",
// 	None = "none",
// }
//
// export const DurationTypes = [DurationType.Seconds, DurationType.Turns, DurationType.Rounds, DurationType.None] as const
//
// abstract class AbstractEffectSystemData<
// 	TParent extends AbstractEffectGURPS,
// 	TSchema extends AbstractEffectSystemSchema,
// > extends ItemSystemModel<TParent, TSchema> {
// 	static override defineSchema(): AbstractEffectSystemSchema {
// 		const fields = foundry.data.fields
//
// 		return {
// 			...super.defineSchema(),
// 			features: new fields.ArrayField(new fields.TypedSchemaField(FeatureTypes)),
// 			modifiers: new fields.ArrayField(new fields.ObjectField<RollModifier>()),
// 			can_level: new fields.BooleanField(),
// 			levels: new fields.SchemaField({ max: new fields.NumberField(), current: new fields.NumberField() }),
// 			duration: new fields.SchemaField({
// 				type: new fields.StringField<DurationType>(),
// 				startRound: new fields.NumberField(),
// 				startTime: new fields.NumberField(),
// 				startTurn: new fields.NumberField(),
// 				rounds: new fields.NumberField(),
// 				seconds: new fields.NumberField(),
// 				turns: new fields.NumberField(),
// 				combat: new fields.StringField(),
// 			}),
// 			overlay: new fields.BooleanField(),
// 			reference: new fields.StringField(),
// 			reference_highlight: new fields.StringField(),
// 		}
// 	}
// }
//
// interface AbstractEffectSystemData<TParent extends AbstractEffectGURPS, TSchema extends AbstractEffectSystemSchema>
// 	extends ItemSystemModel<TParent, TSchema> {}
//
// type AbstractEffectSystemSchema = ItemSystemSchema & {
// 	features: fields.ArrayField<fields.TypedSchemaField<Record<feature.Type, ConstructorOf<Feature>>>>
// 	modifiers: fields.ArrayField<fields.ObjectField<RollModifier>>
// 	can_level: fields.BooleanField
// 	levels: fields.SchemaField<{
// 		max: fields.NumberField
// 		current: fields.NumberField
// 	}>
// 	overlay: fields.BooleanField
// 	duration: fields.SchemaField<{
// 		type: fields.StringField<DurationType>
// 		startRound: fields.NumberField
// 		startTime: fields.NumberField
// 		startTurn: fields.NumberField
// 		rounds: fields.NumberField
// 		seconds: fields.NumberField
// 		turns: fields.NumberField
// 		combat: fields.StringField
// 	}>
// 	reference: fields.StringField
// 	reference_highlight: fields.StringField
// }
//
// type AbstractEffectSource<
// 	TType extends EffectType,
// 	TSystemSource extends AbstractEffectSystemSource = AbstractEffectSystemSource,
// > = BaseItemSourceGURPS<TType, TSystemSource>
//
// interface AbstractEffectSystemSource extends ItemSystemSource {}
//
// export { AbstractEffectSystemData }
// export type { AbstractEffectSource, AbstractEffectSystemSchema, EffectFlags }
