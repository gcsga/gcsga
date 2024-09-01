import { ActorDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import {
	SheetSettingsSchema,
	SheetSettings,
	AttributeGURPS,
	ResourceTracker,
	MoveType,
	AttributeSchema,
	ResourceTrackerSchema,
	MoveTypeSchema,
	AttributeBonus,
	CostReduction,
	DRBonus,
	SkillBonus,
	SkillPointBonus,
	SpellBonus,
	WeaponBonus,
	MoveBonus,
	SpellPointBonus,
} from "@system"
import { CharacterManeuver } from "@system/maneuver-manager.ts"
import { PointsRecord, PointsRecordSchema } from "./fields/points-record.ts"
import { ItemType } from "../constants.ts"
import { equalFold } from "@module/util/index.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { SkillData } from "../item/skill.ts"
import { TechniqueData } from "../item/technique.ts"
import { TooltipGURPS, skillsel } from "@util"
import { Nameable } from "@module/util/nameable.ts"

class CharacterData extends ActorDataModel {
	declare features: CharacterFeatures

	static override defineSchema(): CharacterSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			version: new fields.NumberField({ required: true, nullable: false, initial: 5 }),
			settings: new fields.SchemaField<SheetSettingsSchema>(SheetSettings.defineSchema()),
			created_date: new fields.StringField(),
			modified_date: new fields.StringField(),
			profile: new fields.SchemaField<CharacterProfileSchema>({
				player_name: new fields.StringField({ initial: game.user?.name }),
				name: new fields.StringField(),
				title: new fields.StringField(),
				organization: new fields.StringField(),
				age: new fields.StringField(),
				birthday: new fields.StringField(),
				eyes: new fields.StringField(),
				hair: new fields.StringField(),
				skin: new fields.StringField(),
				handedness: new fields.StringField(),
				height: new fields.StringField(),
				weight: new fields.StringField(),
				SM: new fields.NumberField({ integer: true, initial: 0 }),
				gender: new fields.StringField(),
				tech_level: new fields.StringField(),
				religion: new fields.StringField(),
				portrait: new fields.StringField(),
			}),
			attributes: new fields.ArrayField(new fields.SchemaField(AttributeGURPS.defineSchema())),
			resource_trackers: new fields.ArrayField(new fields.SchemaField(ResourceTracker.defineSchema())),
			move_types: new fields.ArrayField(new fields.SchemaField(MoveType.defineSchema())),
			move: new fields.SchemaField({
				// TODO: review
				maneuver: new fields.ObjectField(),
				posture: new fields.StringField(),
				type: new fields.StringField(),
			}),
			total_points: new fields.NumberField(),
			points_record: new fields.ArrayField(new fields.SchemaField(PointsRecord.defineSchema())),
		}) as CharacterSchema
	}

	bestSkillNamed(
		name: string,
		specialization: string,
		requirePoints: boolean,
		excludes: Set<string>,
	):
		| (ItemGURPS2 &
				({ type: ItemType.Skill; system: SkillData } | { type: ItemType.Technique; system: TechniqueData }))
		| null {
		let best: ItemGURPS2 | null = null
		let level = Number.MIN_SAFE_INTEGER
		for (const sk of this.skillNamed(name, specialization, requirePoints, excludes)) {
			const skillLevel = sk.system.calculateLevel(excludes).level
			if (best === null || level < skillLevel) {
				best = sk
				level = skillLevel
			}
		}
		return best as any
	}

	skillNamed(
		name: string,
		specialization: string,
		requirePoints: boolean,
		excludes: Set<string>,
	): (ItemGURPS2 &
		({ type: ItemType.Skill; system: SkillData } | { type: ItemType.Technique; system: TechniqueData }))[] {
		const list: ItemGURPS2[] = []
		this.parent.items.forEach(sk => {
			if (!sk.isOfType(ItemType.Skill, ItemType.Technique)) return
			if (excludes.has(sk.system.processedName)) return

			if (!requirePoints || sk.type === ItemType.Technique || sk.system.adjustedPoints() > 0) {
				if (equalFold(sk.system.nameWithReplacements, name)) {
					if (specialization === "" || equalFold(sk.system.specializationWithReplacements, specialization)) {
						list.push(sk as any)
					}
				}
			}
		})
		return list as any
	}

	skillBonusFor(name: string, specialization: string, tags: string[], tooltip: TooltipGURPS): number {
		let total = 0
		for (const bonus of this.features.skillBonuses) {
			if (bonus.selection_type === skillsel.Type.Name) {
				let replacements: Map<string, string> = new Map()
				const na = bonus.owner
				if (Nameable.isAccesser(na)) {
					replacements = na.nameableReplacements
				}
				if (
					bonus.name.matches(replacements, name) &&
					bonus.specialization.matches(replacements, specialization) &&
					bonus.tags.matchesList(replacements, ...tags)
				) {
					total += bonus.adjustedAmount
					bonus.addToTooltip(tooltip)
				}
			}
		}
		return total
	}
}

interface CharacterData extends Omit<ModelPropsFromSchema<CharacterSchema>, "settings"> {
	settings: SheetSettings
}

type CharacterSchema = {
	version: fields.NumberField<number, number, true, false, true>
	settings: fields.SchemaField<SheetSettingsSchema>
	created_date: fields.StringField
	modified_date: fields.StringField
	profile: fields.SchemaField<CharacterProfileSchema>
	attributes: fields.ArrayField<fields.SchemaField<AttributeSchema>>
	resource_trackers: fields.ArrayField<fields.SchemaField<ResourceTrackerSchema>>
	move_types: fields.ArrayField<fields.SchemaField<MoveTypeSchema>>
	move: fields.SchemaField<CharacterMoveSchema>
	total_points: fields.NumberField<number, number, true, false>
	points_record: fields.ArrayField<fields.SchemaField<PointsRecordSchema>>
}

type CharacterProfileSchema = {
	player_name: fields.StringField
	name: fields.StringField
	title: fields.StringField
	organization: fields.StringField
	age: fields.StringField
	birthday: fields.StringField
	eyes: fields.StringField
	hair: fields.StringField
	skin: fields.StringField
	handedness: fields.StringField
	height: fields.StringField
	weight: fields.StringField
	SM: fields.NumberField
	gender: fields.StringField
	tech_level: fields.StringField
	religion: fields.StringField
	portrait: fields.StringField
}

type CharacterMoveSchema = {
	maneuver: fields.ObjectField<CharacterManeuver, CharacterManeuver, true, true>
	posture: fields.StringField
	type: fields.StringField
}

type CharacterFeatures = {
	attributeBonuses: AttributeBonus[]
	costReductions: CostReduction[]
	drBonuses: DRBonus[]
	skillBonuses: SkillBonus[]
	skillPointBonuses: SkillPointBonus[]
	spellBonuses: SpellBonus[]
	spellPointBonuses: SpellPointBonus[]
	weaponBonuses: WeaponBonus[]
	moveBonuses: MoveBonus[]
}

// type PointBreakdownSchema = {
// 	overspent: fields.BooleanField
// 	ancestry: fields.NumberField<number, number, true, false, true>
// 	attributes: fields.NumberField<number, number, true, false, true>
// 	advantages: fields.NumberField<number, number, true, false, true>
// 	disadvantages: fields.NumberField<number, number, true, false, true>
// 	quirks: fields.NumberField<number, number, true, false, true>
// 	skills: fields.NumberField<number, number, true, false, true>
// 	spells: fields.NumberField<number, number, true, false, true>
// 	total: fields.NumberField<number, number, true, false, true>
// 	unspent: fields.NumberField<number, number, true, false, true>
// }

export { CharacterData }
