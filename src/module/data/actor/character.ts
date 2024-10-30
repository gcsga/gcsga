import fields = foundry.data.fields
import { PointsRecord, PointsRecordSchema } from "./fields/points-record.ts"
import { ItemType, gid } from "../constants.ts"
import { DamageProgression } from "@module/util/index.ts"
import { ItemGURPS2 } from "@module/documents/item.ts"
import {
	FeatureHolderTemplate,
	FeatureHolderTemplateSchema,
	SettingsHolderTemplate,
	SettingsHolderTemplateSchema,
} from "./templates/index.ts"
import { AttributeHolderTemplate, AttributeHolderTemplateSchema } from "./templates/attribute-holder.ts"
import { CharacterBonus, CharacterBonusSchema } from "./fields/bonus.ts"
import { Int, attribute, encumbrance, progression, threshold } from "@util"
import { ItemInst } from "../item/helpers.ts"
import { ResourceTracker, ResourceTrackerSchema } from "../resource-tracker/index.ts"
import { MoveType, MoveTypeSchema } from "../move-type/index.ts"
import { AttributeGURPS } from "../attribute/index.ts"
import { DiceGURPS } from "../dice.ts"
import { CharacterEncumbrance } from "./fields/character-encumbrance.ts"
import { equalFold } from "../item/components/index.ts"
import { ActorDataModel } from "./abstract.ts"

class CharacterDataGURPS extends ActorDataModel.mixin(
	FeatureHolderTemplate,
	SettingsHolderTemplate,
	AttributeHolderTemplate,
) {
	cache: CharacterCache = {
		encumbranceLevel: null,
		encumbranceLevelForSkills: null,
		basicLift: null,
	}

	skillResolverExclusions = new Set<string>()

	static override defineSchema(): CharacterSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			version: new fields.NumberField({ required: true, nullable: false, initial: 5 }),
			created_date: new fields.StringField(),
			modified_date: new fields.StringField(),
			profile: new fields.SchemaField<CharacterProfileSchema>({
				player_name: new fields.StringField({
					required: true,
					nullable: false,
					initial: game.user?.name ?? "",
				}),
				// name: new fields.StringField({ required: true, nullable: false, initial: "" }),
				title: new fields.StringField({ required: true, nullable: false, initial: "TITLE" }),
				organization: new fields.StringField({ required: true, nullable: false, initial: "ORGANIZATION" }),
				age: new fields.StringField({ required: true, nullable: false, initial: "AGE" }),
				birthday: new fields.StringField({ required: true, nullable: false, initial: "01/01/2024" }),
				eyes: new fields.StringField({ required: true, nullable: false, initial: "EYES" }),
				hair: new fields.StringField({ required: true, nullable: false, initial: "HAIR" }),
				skin: new fields.StringField({ required: true, nullable: false, initial: "SKIN" }),
				handedness: new fields.StringField({ required: true, nullable: false, initial: "HANDEDNESS" }),
				height: new fields.StringField({ required: true, nullable: false, initial: "HEIGHT" }),
				weight: new fields.StringField({ required: true, nullable: false, initial: "WEIGHT" }),
				SM: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
				gender: new fields.StringField({ required: true, nullable: false, initial: "GENDER" }),
				tech_level: new fields.StringField({ required: true, nullable: false, initial: "TL" }),
				religion: new fields.StringField({ required: true, nullable: false, initial: "RELIGION" }),
				// portrait: new fields.StringField({ required: true, nullable: false, initial: "" }),
			}),
			resource_trackers: new fields.ArrayField(new fields.SchemaField(ResourceTracker.defineSchema())),
			move_types: new fields.ArrayField(new fields.SchemaField(MoveType.defineSchema())),
			// move: new fields.SchemaField({
			// 	// TODO: review
			// 	maneuver: new fields.ObjectField(),
			// 	posture: new fields.StringField(),
			// 	type: new fields.StringField(),
			// }),
			total_points: new fields.NumberField(),
			points_record: new fields.ArrayField(new fields.SchemaField(PointsRecord.defineSchema())),
			bonuses: new fields.SchemaField({
				liftingStrength: new fields.SchemaField(CharacterBonus.defineSchema()),
				strikingStrength: new fields.SchemaField(CharacterBonus.defineSchema()),
				throwingStrength: new fields.SchemaField(CharacterBonus.defineSchema()),
				dodge: new fields.SchemaField(CharacterBonus.defineSchema()),
				parry: new fields.SchemaField(CharacterBonus.defineSchema()),
				block: new fields.SchemaField(CharacterBonus.defineSchema()),
			}),
		}) as CharacterSchema
	}

	override prepareBaseData(): void {
		super.prepareBaseData()
		this._clearCache()
		this.features = {
			attributeBonuses: [],
			costReductions: [],
			drBonuses: [],
			skillBonuses: [],
			skillPointBonuses: [],
			spellBonuses: [],
			spellPointBonuses: [],
			weaponBonuses: [],
			moveBonuses: [],
		}

		this.attributes.list = this.settings.attributes.map(
			e =>
				new AttributeGURPS(
					{
						id: e.id,
					},
					{ parent: this },
				),
		)
	}

	protected _clearCache(): void {
		this.cache = {
			encumbranceLevel: null,
			encumbranceLevelForSkills: null,
			basicLift: null,
		}
	}

	override _prepareEmbeddedDocuments(): void {
		this.processFeatures()
	}

	override resolveVariable(variableName: string): string {
		if (this.variableResolverExclusions.has(variableName)) return ""
		const v = this.cachedVariables.get(variableName)
		if (!!v) return v
		this.variableResolverExclusions.add(variableName)
		try {
			if (gid.SizeModifier === variableName) {
				const result = this.adjustedSizeModifier.toString()
				this.cachedVariables.set(variableName, result)
				return result
			}
			const parts = variableName.split(".", 2)
			const attr = this.attributes.map.get(parts[0]) ?? null
			if (attr === null) {
				return ""
			}
			const def = attr.definition
			if (def === null) {
				return ""
			}
			if (
				(def.type === attribute.Type.Pool || def.type === attribute.Type.PoolRef) &&
				parts.length > 1 &&
				parts[1] === "current"
			) {
				const result = attr.current.toString()
				this.cachedVariables.set(variableName, result)
				return result
			}
			const result = attr.max.toString()
			this.cachedVariables.set(variableName, result)
			return result
		} finally {
			this.variableResolverExclusions.delete(variableName)
		}
	}

	isSkillLevelResolutionExcluded(name: string, specialization: string): boolean {
		return this.skillResolverExclusions?.has(this.skillLevelResolutionKey(name, specialization)) ?? false
	}

	registerSkillLevelResolutionExclusion(name: string, specialization: string): void {
		if (!this.skillResolverExclusions) this.skillResolverExclusions = new Set()
		this.skillResolverExclusions.add(this.skillLevelResolutionKey(name, specialization))
	}

	unregisterSkillLevelResolutionExclusion(name: string, specialization: string): void {
		this.skillResolverExclusions?.delete(this.skillLevelResolutionKey(name, specialization))
	}

	skillLevelResolutionKey(name: string, specialization: string): string {
		return name + "\u0000" + specialization
	}

	/**
	 * Return the skill with the highest level matching the provided parameters.
	 * @param name - Name of skill/technique to search for
	 * @param specialization - Specialization to search for. Can be blank.
	 * @param requirePoints - Does the skill need to have 1 or more points assigned?
	 * @param excludes - Skills to exclude from the search
	 * @returns Skill or Technique
	 */
	bestSkillNamed(
		name: string,
		specialization: string,
		requirePoints: boolean,
		excludes: Set<string> = new Set(),
	): ItemInst<ItemType.Skill | ItemType.Technique> | null {
		let best: ItemGURPS2 | null = null
		let level = Number.MIN_SAFE_INTEGER
		for (const sk of this.skillNamed(name, specialization, requirePoints, excludes)) {
			const skillLevel = sk.system.calculateLevel(excludes).level
			if (best === null || level < skillLevel) {
				best = sk
				level = skillLevel
			}
		}
		return best as ItemInst<ItemType.Skill | ItemType.Technique> | null
	}

	/**
	 * Return array of skills matching the provieed parameters.
	 * @param name - Name of skill/technique to search for
	 * @param specialization - Specialization to search for. Can be blank.
	 * @param requirePoints - Does the skill need to have 1 or more points assigned?
	 * @param excludes - Skills to exclude from the search
	 * @returns Array of Skills/Techniques
	 */
	skillNamed(
		name: string,
		specialization: string,
		requirePoints: boolean,
		excludes: Set<string> | null = null,
	): ItemInst<ItemType.Skill | ItemType.Technique>[] {
		const list: ItemGURPS2[] = []
		// this.parent.items.forEach(sk => {
		this.parent.itemCollections.skills.forEach(sk => {
			if (!sk.isOfType(ItemType.Skill, ItemType.Technique)) return
			if (excludes?.has(sk.system.processedName)) return

			if (!requirePoints || sk.type === ItemType.Technique || sk.system.adjustedPoints() > 0) {
				if (equalFold(sk.system.nameWithReplacements, name)) {
					if (specialization === "" || equalFold(sk.system.specializationWithReplacements, specialization)) {
						list.push(sk as any)
					}
				}
			}
		})
		return list as ItemInst<ItemType.Skill | ItemType.Technique>[]
	}

	get encumbrance(): CharacterEncumbrance {
		return CharacterEncumbrance.for(this.parent)
	}

	/**
	 * Encumbrance & Lifting
	 */
	encumbranceLevel(forSkills: boolean): encumbrance.Level {
		if (forSkills) {
			if (this.cache.encumbranceLevelForSkills !== null) return this.cache.encumbranceLevelForSkills
		} else if (this.cache.encumbranceLevel !== null) return this.cache.encumbranceLevel
		const carried = this.weightCarried(forSkills)
		for (const level of encumbrance.Levels) {
			if (carried <= this.maximumCarry(level)) {
				if (forSkills) {
					this.cache.encumbranceLevelForSkills = level
				} else {
					this.cache.encumbranceLevel = level
				}
				return level
			}
		}
		if (forSkills) {
			this.cache.encumbranceLevelForSkills = encumbrance.Level.ExtraHeavy
		} else {
			this.cache.encumbranceLevel = encumbrance.Level.ExtraHeavy
		}
		return encumbrance.Level.ExtraHeavy
	}

	weightCarried(forSkills: boolean): number {
		let total = 0
		for (const equipment of this.parent.itemCollections.carriedEquipment) {
			total += equipment.system.extendedWeight(forSkills, this.settings.default_weight_units) as number
		}
		return total
	}

	maximumCarry(level: encumbrance.Level): number {
		return Int.from(this.basicLift * encumbrance.Level.weightMultiplier(level))
	}

	move(level: encumbrance.Level): number {
		let initialMove = 0
		if (this.resolveAttribute(gid.Move) !== null) {
			initialMove = this.resolveAttributeCurrent(gid.Move)
		} else {
			initialMove = Math.max(this.resolveAttributeCurrent(gid.BasicMove), 0)
		}
		const divisor = 2 * Math.min(this.countThresholdOpMet(threshold.Op.HalveMove), 2)
		if (divisor > 0) {
			initialMove = Math.ceil(initialMove / 2)
		}
		const move = Math.trunc((initialMove * 10 + 2 * encumbrance.Level.penalty(level)) / 10)
		if (move < 1) {
			if (initialMove > 0) return 1
			return 0
		}
		return move
	}

	dodge(level: encumbrance.Level): number {
		let dodge = 0
		if (this.resolveAttribute(gid.Dodge) !== null) {
			dodge = this.resolveAttributeCurrent(gid.Dodge)
		} else {
			dodge = Math.max(this.resolveAttributeCurrent(gid.BasicSpeed), 0) + 3
		}
		dodge += this.bonuses.dodge.value
		const divisor = 2 * Math.min(this.countThresholdOpMet(threshold.Op.HalveDodge), 2)
		if (divisor > 0) {
			dodge = Math.ceil(dodge / 2)
		}
		return dodge + Math.max(encumbrance.Level.penalty(level), 1)
	}

	get basicLift(): number {
		if (this.cache.basicLift !== null) return this.cache.basicLift
		this.cache.basicLift = this.basicLiftForST(this.liftingStrength)
		return this.cache.basicLift
	}

	basicLiftForST(st: number): number {
		st = Math.trunc(st)
		if (AttributeGURPS.isThresholdOpMet(threshold.Op.HalveST, this.attributes.list)) {
			st /= 2
			if (st !== Math.trunc(st)) {
				st = Math.trunc(st) + 1
			}
		}
		if (st < 1) return 0
		let v = 0
		if (this.settings.damage_progression === progression.Option.KnowingYourOwnStrength) {
			let diff = 0
			if (st > 19) {
				diff = Math.trunc(st / 10) - 1
				st -= diff * 10
			}
			v = Int.from(10 ** (st / 10) * 2)
			if (st <= 6) {
				v = Math.round(v * 10) / 10
			} else {
				v = Math.round(v)
			}
			v = v * Int.from(10 ** diff)
		} else {
			v = st ** 2 / 5
		}
		if (v >= 10) v = Math.round(v)
		return Int.from(Math.trunc(v * 10) / 10)
	}

	/** Strength Types */
	get strikingStrength(): number {
		let st = 0
		if (this.resolveAttribute(gid.StrikingStrength) !== null) {
			st = this.resolveAttributeCurrent(gid.StrikingStrength)
		} else {
			st = Math.max(this.resolveAttributeCurrent(gid.Strength), 0)
		}
		st += this.bonuses.strikingStrength.value
		return Math.trunc(st)
	}

	get liftingStrength(): number {
		let st = 0
		if (this.resolveAttribute(gid.LiftingStrength) !== null) {
			st = this.resolveAttributeCurrent(gid.LiftingStrength)
		} else {
			st = Math.max(this.resolveAttributeCurrent(gid.Strength), 0)
		}
		st += this.bonuses.liftingStrength.value
		return Math.trunc(st)
	}

	get throwingStrength(): number {
		let st = 0
		if (this.resolveAttribute(gid.ThrowingStrength) !== null) {
			st = this.resolveAttributeCurrent(gid.ThrowingStrength)
		} else {
			st = Math.max(this.resolveAttributeCurrent(gid.Strength), 0)
		}
		st += this.bonuses.throwingStrength.value
		return Math.trunc(st)
	}

	get telekineticStrength(): number {
		let levels = 0
		this.parent.itemCollections.traits.forEach(e => {
			if (e.system.enabled && e.isOfType(ItemType.Trait) && e.system.isLeveled) {
				if (equalFold(e.system.nameWithReplacements, "telekinesis")) {
					levels += Math.max(e.system.levels ?? 0, 0)
				}
			}
		})
		return Math.trunc(levels)
	}

	get thrust(): DiceGURPS {
		return this.thrustFor(this.strikingStrength)
	}

	get liftingThrust(): DiceGURPS {
		return this.thrustFor(this.liftingStrength)
	}

	thrustFor(st: number): DiceGURPS {
		return DamageProgression.thrustFor(this.settings.damage_progression, st)
	}

	get swing(): DiceGURPS {
		return this.swingFor(this.strikingStrength)
	}

	get liftingSwing(): DiceGURPS {
		return this.swingFor(this.liftingStrength)
	}

	swingFor(st: number): DiceGURPS {
		return DamageProgression.swingFor(this.settings.damage_progression, st)
	}
}

interface CharacterDataGURPS extends ModelPropsFromSchema<CharacterSchema> {}

type CharacterSchema = FeatureHolderTemplateSchema &
	SettingsHolderTemplateSchema &
	AttributeHolderTemplateSchema & {
		version: fields.NumberField<number, number, true, false, true>
		created_date: fields.StringField
		modified_date: fields.StringField
		profile: fields.SchemaField<CharacterProfileSchema>
		resource_trackers: fields.ArrayField<fields.SchemaField<ResourceTrackerSchema>>
		move_types: fields.ArrayField<fields.SchemaField<MoveTypeSchema>>
		// move: fields.SchemaField<CharacterMoveSchema>
		total_points: fields.NumberField<number, number, true, false>
		points_record: fields.ArrayField<fields.SchemaField<PointsRecordSchema>>
		bonuses: fields.SchemaField<{
			liftingStrength: fields.SchemaField<CharacterBonusSchema>
			strikingStrength: fields.SchemaField<CharacterBonusSchema>
			throwingStrength: fields.SchemaField<CharacterBonusSchema>
			dodge: fields.SchemaField<CharacterBonusSchema>
			parry: fields.SchemaField<CharacterBonusSchema>
			block: fields.SchemaField<CharacterBonusSchema>
		}>
	}

type CharacterProfileSchema = {
	player_name: fields.StringField<string, string, true, false, true>
	// name: fields.StringField<string, string, true, false, true>
	title: fields.StringField<string, string, true, false, true>
	organization: fields.StringField<string, string, true, false, true>
	age: fields.StringField<string, string, true, false, true>
	birthday: fields.StringField<string, string, true, false, true>
	eyes: fields.StringField<string, string, true, false, true>
	hair: fields.StringField<string, string, true, false, true>
	skin: fields.StringField<string, string, true, false, true>
	handedness: fields.StringField<string, string, true, false, true>
	height: fields.StringField<string, string, true, false, true>
	weight: fields.StringField<string, string, true, false, true>
	SM: fields.NumberField<number, number, true, false, true>
	gender: fields.StringField<string, string, true, false, true>
	tech_level: fields.StringField<string, string, true, false, true>
	religion: fields.StringField<string, string, true, false, true>
	// portrait: fields.StringField<string, string, true, false, true>
}

// type CharacterMoveSchema = {
// 	maneuver: fields.ObjectField<CharacterManeuver, CharacterManeuver, true, true>
// 	posture: fields.StringField<string, string, true, false, true>
// 	type: fields.StringField<string, string, true, false, true>
// }

type CharacterCache = {
	encumbranceLevel: encumbrance.Level | null
	encumbranceLevelForSkills: encumbrance.Level | null
	basicLift: number | null
}
export { CharacterDataGURPS, type CharacterSchema, type CharacterProfileSchema }
