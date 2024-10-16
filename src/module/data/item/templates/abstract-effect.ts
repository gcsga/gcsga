// import { ItemDataModel } from "@module/data/item/abstract.ts"
// import fields = foundry.data.fields
// import { RollModifier } from "@module/data/roll-modifier.ts"
// import { SkillLevel } from "../helpers.ts"
// import { CombatGURPS } from "@module/document/combat.ts"
//
// enum DurationType {
// 	Seconds = "seconds",
// 	Turns = "turns",
// 	Rounds = "rounds",
// 	None = "none",
// }
//
// const DurationTypes = [DurationType.Seconds, DurationType.Turns, DurationType.Rounds, DurationType.None] as const
//
// class AbstractEffectTemplate extends ItemDataModel<AbstractEffectTemplateSchema> {
// 	protected declare _skillLevel: SkillLevel
//
// 	static override defineSchema(): AbstractEffectTemplateSchema {
// 		const fields = foundry.data.fields
// 		return {
// 			modifiers: new fields.ArrayField(new fields.EmbeddedDataField(RollModifier)),
// 			can_level: new fields.BooleanField(),
// 			levels: new fields.SchemaField({
// 				max: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
// 				current: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
// 			}),
// 			duration: new fields.SchemaField({
// 				type: new fields.StringField<DurationType, DurationType, true>({
// 					required: true,
// 					nullable: false,
// 					choices: DurationTypes,
// 					initial: DurationType.None,
// 				}),
// 				startRound: new fields.NumberField({ required: true, nullable: true, initial: null }),
// 				startTime: new fields.NumberField({ required: true, nullable: true, initial: null }),
// 				startTurn: new fields.NumberField({ required: true, nullable: true, initial: null }),
// 				rounds: new fields.NumberField({ required: true, nullable: true, initial: null }),
// 				seconds: new fields.NumberField({ required: true, nullable: true, initial: null }),
// 				turns: new fields.NumberField({ required: true, nullable: true, initial: null }),
// 				combat: new fields.ForeignDocumentField(CombatGURPS, { required: true, nullable: true, initial: null }),
// 			}),
// 			overlay: new fields.BooleanField(),
// 		}
// 	}
// }
//
// interface AbstractEffectTemplate
// 	extends ItemDataModel<AbstractEffectTemplateSchema>,
// 		ModelPropsFromSchema<AbstractEffectTemplateSchema> {
// 	constructor: typeof AbstractEffectTemplate
// }
//
// type AbstractEffectTemplateSchema = {
// 	modifiers: fields.ArrayField<fields.EmbeddedDataField<RollModifier>>
// 	can_level: fields.BooleanField
// 	levels: fields.SchemaField<{
// 		max: fields.NumberField<number, number, true, false, true>
// 		current: fields.NumberField<number, number, true, false, true>
// 	}>
// 	overlay: fields.BooleanField
// 	duration: fields.SchemaField<{
// 		type: fields.StringField<DurationType, DurationType, true, false, true>
// 		startRound: fields.NumberField<number, number, true, true, true>
// 		startTime: fields.NumberField<number, number, true, true, true>
// 		startTurn: fields.NumberField<number, number, true, true, true>
// 		rounds: fields.NumberField<number, number, true, true, true>
// 		seconds: fields.NumberField<number, number, true, true, true>
// 		turns: fields.NumberField<number, number, true, true, true>
// 		combat: fields.ForeignDocumentField<string, true, true, true>
// 	}>
// }
//
// export { AbstractEffectTemplate, type AbstractEffectTemplateSchema, type DurationType, DurationTypes }
