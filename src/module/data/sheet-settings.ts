import { ErrorGURPS, paper } from "@util"
import fields = foundry.data.fields
import { ActorGURPS2 } from "@module/document/actor.ts"
import { ActorTemplateType } from "@module/data/actor/types.ts"
import { AttributeDef, AttributeDefSchema } from "./attribute/index.ts"
import { ResourceTrackerDef, ResourceTrackerDefSchema } from "./resource-tracker/index.ts"
import { BodyGURPS, BodySchema, BodySource } from "./hit-location.ts"
import { MoveTypeDef, MoveTypeDefSchema } from "./move-type/index.ts"
import { ActorDataModel } from "./abstract.ts"
import { DefaultSheetSettings, SheetSettingsSchema } from "@module/settings/sheet-settings-config.ts"

export interface PageSettings {
	paper_size: paper.Size
	orientation: paper.Orientation
	top_margin: paper.Length
	left_margin: paper.Length
	bottom_margin: paper.Length
	right_margin: paper.Length
}

export enum BlockLayoutKey {
	BlockLayoutReactionsKey = "reactions",
	BlockLayoutConditionalModifiersKey = "conditional_modifiers",
	BlockLayoutMeleeKey = "melee",
	BlockLayoutRangedKey = "ranged",
	BlockLayoutTraitsKey = "traits",
	BlockLayoutSkillsKey = "skills",
	BlockLayoutSpellsKey = "spells",
	BlockLayoutEquipmentKey = "equipment",
	BlockLayoutOtherEquipmentKey = "other_equipment",
	BlockLayoutNotesKey = "notes",
}

type BlockLayoutString = `${BlockLayoutKey}` | `${BlockLayoutKey} ${BlockLayoutKey}`

type CharacterSheetSettingsSchema = SheetSettingsSchema & {
	block_layout: fields.ArrayField<fields.StringField<BlockLayoutString>>
	attributes: fields.ArrayField<
		fields.SchemaField<AttributeDefSchema, SourceFromSchema<AttributeDefSchema>, AttributeDef>
	>
	resource_trackers: fields.ArrayField<
		fields.SchemaField<ResourceTrackerDefSchema, SourceFromSchema<ResourceTrackerDefSchema>, ResourceTrackerDef>
	>
	body_type: fields.SchemaField<BodySchema, SourceFromSchema<BodySchema>, BodyGURPS>
	move_types: fields.ArrayField<
		fields.SchemaField<MoveTypeDefSchema, SourceFromSchema<MoveTypeDefSchema>, MoveTypeDef>
	>
}

type CharacterSheetSettingsSource = Omit<SourceFromSchema<CharacterSheetSettingsSchema>, "body_type"> & {
	body_type: BodySource
}

class SheetSettings extends foundry.abstract.DataModel<ActorDataModel, CharacterSheetSettingsSchema> {
	constructor(
		data: DeepPartial<SourceFromSchema<CharacterSheetSettingsSchema>>,
		options?: DataModelConstructionOptions<ActorDataModel>,
	) {
		super(data, options)
		// this.attributes = data.attributes?.map(e => new AttributeDef(e!, { parent: this.parent })) ?? []
		// this.resource_trackers =
		// 	data.resource_trackers?.map(e => new ResourceTrackerDef(e!, { parent: this.parent })) ?? []
		// this.move_types = data.move_types?.map(e => new MoveTypeDef(e!, { parent: this.parent })) ?? []
		// this.body_type = new BodyGURPS(data.body_type ?? {})
	}

	get actor(): ActorGURPS2 {
		return this.parent.parent
	}

	static override defineSchema(): CharacterSheetSettingsSchema {
		const fields = foundry.data.fields
		return {
			...DefaultSheetSettings.defineSchema(),
			attributes: new fields.ArrayField(new fields.SchemaField(AttributeDef.defineSchema())),
			resource_trackers: new fields.ArrayField(new fields.SchemaField(ResourceTrackerDef.defineSchema())),
			move_types: new fields.ArrayField(new fields.SchemaField(MoveTypeDef.defineSchema())),
			body_type: new fields.SchemaField(BodyGURPS.defineSchema()),
		}
	}

	static default(): SheetSettings {
		return new SheetSettings({})
	}

	static for(actor: ActorGURPS2 | null): SheetSettings {
		if (actor instanceof ActorGURPS2) {
			if (actor.hasTemplate(ActorTemplateType.Settings)) {
				return actor.system.settings
			} else {
				console.error(`Actor "${actor.name}" does not support Sheet Settings. Returning default settings.`)
			}
		} else {
			ErrorGURPS(`Actor does not exist.Returning default settings.`)
		}
		return SheetSettings.default()
	}
}

interface SheetSettings
	extends foundry.abstract.DataModel<ActorDataModel, CharacterSheetSettingsSchema>,
		ModelPropsFromSchema<CharacterSheetSettingsSchema> {}

export { SheetSettings }
export type { BlockLayoutString, CharacterSheetSettingsSchema, CharacterSheetSettingsSource }
