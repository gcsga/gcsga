import { MoveTypeOverrideConditionType, ThresholdOp } from "@system"
import { LengthUnits, NumericCompareType, StringCompareType, WeightUnits } from "@util"
import {
	affects,
	attribute,
	container,
	difficulty,
	display,
	emcost,
	emweight,
	feature,
	paper,
	picker,
	prereq,
	progression,
	selfctrl,
	skillsel,
	spellcmp,
	spellmatch,
	stdmg,
	stlimit,
	study,
	tmcost,
	wsel,
	wswitch,
} from "@util/enum/index.ts"

const GCS_FILE_VERSION = 4

export enum ImportedItemType {
	Trait = "trait",
	TraitContainer = "trait_container",
	TraitModifier = "modifier",
	TraitModifierContainer = "modifier_container",
	Skill = "skill",
	Technique = "technique",
	SkillContainer = "skill_container",
	Spell = "spell",
	RitualMagicSpell = "ritual_magic_spell",
	SpellContainer = "spell_container",
	Equipment = "equipment",
	EquipmentContainer = "equipment_container",
	EquipmentModifier = "eqp_modifier",
	EquipmentModifierContainer = "eqp_modifier_container",
	Note = "note",
	NoteContainer = "note_container",
	MeleeWeapon = "melee_weapon",
	RangedWeapon = "ranged_weapon",
}

type ImportedWeight = `${number} ${WeightUnits}`

type ImportedStringCriteria = {
	compare?: StringCompareType
	qualifier?: string
}

type ImportedNumericCriteria = {
	compare?: NumericCompareType
	qualifier?: number
}

type ImportedWeightCriteria = {
	compare?: NumericCompareType
	qualifier?: ImportedWeight
}

type ImportedPrereqList = {
	type: prereq.Type.List
	all: boolean
	when_tl?: ImportedNumericCriteria
	prereqs?: ImportedPrereq[]
}

type ImportedTraitPrereq = {
	type: prereq.Type.Trait
	has: boolean
	name?: ImportedStringCriteria
	level?: ImportedNumericCriteria
	notes?: ImportedStringCriteria
}

type ImportedAttributePrereq = {
	type: prereq.Type.Attribute
	has: boolean
	combined_with?: string
	qualifier?: ImportedNumericCriteria
	which: string
}

type ImportedContainedQuantityPrereq = {
	type: prereq.Type.ContainedQuantity
	has: boolean
	qualifier?: ImportedNumericCriteria
}

type ImportedContainedWeightPrereq = {
	type: prereq.Type.ContainedWeight
	has: boolean
	qualifier?: ImportedWeightCriteria
}

type ImportedEquippedEquipmentPrereq = {
	type: prereq.Type.EquippedEquipment
	name?: ImportedStringCriteria
}

type ImportedSkillPrereq = {
	type: prereq.Type.Skill
	has: boolean
	name?: ImportedStringCriteria
	level?: ImportedNumericCriteria
	specialization?: ImportedStringCriteria
}

type ImportedSpellPrereq = {
	type: prereq.Type.Spell
	sub_type: spellcmp.Type
	has: boolean
	qualifier?: ImportedStringCriteria
	quantity?: ImportedNumericCriteria
}

type ImportedPrereq =
	| ImportedPrereqList
	| ImportedTraitPrereq
	| ImportedAttributePrereq
	| ImportedContainedQuantityPrereq
	| ImportedContainedWeightPrereq
	| ImportedEquippedEquipmentPrereq
	| ImportedSkillPrereq
	| ImportedSpellPrereq

type ImportedLeveledAmount = {
	amount: number
	per_level?: boolean
}

type ImportedWeaponLeveledAmount = {
	amount: number
	leveled?: boolean
	per_die?: boolean
}

type ImportedAttributeBonus = ImportedLeveledAmount & {
	type: feature.Type.AttributeBonus
	limitation?: stlimit.Option
	attribute: string
}

type ImportedCostReduction = {
	type: feature.Type.CostReduction
	attribute?: string
	percentage?: number
}

type ImportedDRBonus = ImportedLeveledAmount & {
	type: feature.Type.DRBonus
	location: string
	specialization?: string
}

type ImportedSkillBonus = ImportedLeveledAmount & {
	type: feature.Type.SkillBonus
	selection_type: skillsel.Type
	name?: ImportedStringCriteria
	specialization?: ImportedStringCriteria
	tags?: ImportedStringCriteria
}

type ImportedSkillPointBonus = ImportedLeveledAmount & {
	type: feature.Type.SkillPointBonus
	name?: ImportedStringCriteria
	specialization?: ImportedStringCriteria
	tags?: ImportedStringCriteria
}

type ImportedSpellBonus = ImportedLeveledAmount & {
	type: feature.Type.SpellBonus
	match: spellmatch.Type
	name?: ImportedStringCriteria
	tags?: ImportedStringCriteria
}

type ImportedSpellPointBonus = ImportedLeveledAmount & {
	type: feature.Type.SpellPointBonus
	match: spellmatch.Type
	name?: ImportedStringCriteria
	tags?: ImportedStringCriteria
}

type ImportedWeaponBonus = ImportedWeaponLeveledAmount & {
	type: feature.WeaponBonusType
	percent?: boolean
	switch_type_value?: boolean
	selection_type: wsel.Type
	switch_type?: wswitch.Type
	name?: ImportedStringCriteria
	specialization?: ImportedStringCriteria
	level?: ImportedNumericCriteria
	usage?: ImportedStringCriteria
	tags?: ImportedStringCriteria
}

type ImportedFeature =
	| ImportedAttributeBonus
	| ImportedCostReduction
	| ImportedDRBonus
	| ImportedSkillBonus
	| ImportedSkillPointBonus
	| ImportedSpellBonus
	| ImportedSpellPointBonus
	| ImportedWeaponBonus

type ImportedStudy = {
	type: study.Type
	hours: number
	note?: string
}

type ImportedTemplatePicker = {
	type: picker.Type
	qualifier: ImportedNumericCriteria
}

interface ImportedWeaponDamage {
	type: string
	st?: stdmg.Option
	base?: string
	armor_divisor?: number
	fragmentation?: string
	fragmentation_armor_divisor?: number
	fragmentation_type?: string
	modifier_per_die?: number
}

interface ImportedContainerBase<T> {
	open?: boolean
	children?: T[]
	third_party?: Record<string, unknown>
}

interface ImportedTraitSystemSource {
	type: ImportedItemType.Trait
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	userdesc?: string
	tags?: string[]
	modifiers?: (ImportedTraitModifierSystemSource | ImportedTraitModifierContainerSystemSource)[]
	base_points?: number
	levels?: number
	points_per_level?: number
	prereqs?: ImportedPrereqList
	weapons?: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
	features?: ImportedFeature[]
	study?: ImportedStudy[]
	cr?: selfctrl.Roll
	cr_adj?: selfctrl.Adjustment
	study_hours_needed?: study.Level | ""
	disabled?: boolean
	round_down?: boolean
	can_level?: boolean
}

interface ImportedTraitContainerSystemSource
	extends ImportedContainerBase<ImportedTraitSystemSource | ImportedTraitContainerSystemSource> {
	type: ImportedItemType.TraitContainer
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	ancestry?: string
	userdesc?: string
	tags?: string[]
	modifiers?: (ImportedTraitModifierSystemSource | ImportedTraitModifierContainerSystemSource)[]
	template_picker?: ImportedTemplatePicker
	cr?: selfctrl.Roll
	cr_adj?: selfctrl.Adjustment
	container_type?: container.Type
	disabled?: boolean
}

interface ImportedTraitModifierSystemSource {
	type: ImportedItemType.TraitModifier
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tags?: string[]
	cost?: number
	levels?: number
	affects?: affects.Option
	cost_type?: tmcost.Type
	disabled?: boolean
	features?: ImportedFeature[]
}

interface ImportedTraitModifierContainerSystemSource
	extends ImportedContainerBase<ImportedTraitModifierSystemSource | ImportedTraitModifierContainerSystemSource> {
	type: ImportedItemType.TraitModifierContainer
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tags?: string[]
}

interface ImportedSkillDefault {
	type: string
	name?: string
	specialization?: string
	modifier?: number
	level?: number
	adjusted_level?: number
	points?: number
}

interface ImportedSkillSystemSource {
	type: ImportedItemType.Skill
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tags?: string[]
	specialization?: string
	tech_level?: string
	difficulty?: `${string}/${difficulty.Level}`
	points?: number
	encumbrance_penalty_multiplier?: number
	defaulted_from?: ImportedSkillDefault
	defaults?: ImportedSkillDefault[]
	prereqs?: ImportedPrereqList
	weapons?: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
	features?: ImportedFeature[]
	study?: ImportedStudy[]
	study_hours_needed?: study.Level | ""
}

interface ImportedTechniqueSystemSorce {
	type: ImportedItemType.Technique
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tags?: string[]
	tech_level?: string
	difficulty?: difficulty.Level.Average | difficulty.Level.Hard
	points?: number
	default?: ImportedSkillDefault
	defaults?: ImportedSkillDefault[]
	limit?: number
	prereqs?: ImportedPrereqList
	weapons?: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
	features?: ImportedFeature[]
	study?: ImportedStudy[]
	study_hours_needed?: study.Level | ""
}

interface ImportedSkillContainerSystemSource
	extends ImportedContainerBase<
		ImportedSkillSystemSource | ImportedTechniqueSystemSorce | ImportedSkillContainerSystemSource
	> {
	type: ImportedItemType.SkillContainer
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tags?: string[]
	template_picker?: ImportedTemplatePicker
}

interface ImportedSpellSystemSource {
	type: ImportedItemType.Spell
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tags?: string[]
	tech_level?: string
	difficulty?: `${string}/${difficulty.Level}`
	college?: string[]
	power_source?: string
	spell_class?: string
	resist?: string
	casting_cost?: string
	maintenance_cost?: string
	casting_time?: string
	duration?: string
	points?: number
	prereqs?: ImportedPrereqList
	weapons?: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
	study?: ImportedStudy[]
	study_hours_needed?: study.Level | ""
}

interface ImportedRitualMagicSpellSystemSource {
	type: ImportedItemType.RitualMagicSpell
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tags?: string[]
	tech_level?: string
	difficulty?: difficulty.Level
	college?: string[]
	power_source?: string
	spell_class?: string
	resist?: string
	casting_cost?: string
	maintenance_cost?: string
	casting_time?: string
	duration?: string
	base_skill?: string
	prereq_count?: number
	points?: number
	prereqs?: ImportedPrereqList
	weapons?: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
	study?: ImportedStudy[]
	study_hours_needed?: study.Level | ""
}

interface ImportedSpellContainerSystemSource
	extends ImportedContainerBase<
		ImportedSpellSystemSource | ImportedRitualMagicSpellSystemSource | ImportedSpellContainerSystemSource
	> {
	type: ImportedItemType.SpellContainer
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tags?: string[]
	template_picker?: ImportedTemplatePicker
}

interface ImportedEquipmentSystemSource {
	type: ImportedItemType.Equipment
	description?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tech_level?: string
	legality_class?: string
	tags?: string[]
	modifiers?: (ImportedEquipmentModifierSystemSource | ImportedEquipmentModifierContainerSystemSource)[]
	rated_strength?: number
	quantity?: number
	value?: number
	weight?: ImportedWeight
	max_uses?: number
	uses?: number
	prereqs?: ImportedPrereqList
	weapons?: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
	features?: ImportedFeature[]
	equipped?: boolean
	ignore_weight_for_skills?: boolean
}

interface ImportedEquipmentContainerSystemSource
	extends ImportedContainerBase<ImportedEquipmentSystemSource | ImportedEquipmentContainerSystemSource> {
	type: ImportedItemType.EquipmentContainer
	description?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tech_level?: string
	legality_class?: string
	tags?: string[]
	modifiers?: (ImportedEquipmentModifierSystemSource | ImportedEquipmentModifierContainerSystemSource)[]
	rated_strength?: number
	quantity?: number
	value?: number
	weight?: ImportedWeight
	max_uses?: number
	uses?: number
	prereqs?: ImportedPrereqList
	weapons?: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
	features?: ImportedFeature[]
	equipped?: boolean
	ignore_weight_for_skills?: boolean
}

interface ImportedEquipmentModifierSystemSource {
	type: ImportedItemType.EquipmentModifier
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tags?: string[]
	cost_type?: emcost.Type
	weight_type?: emweight.Type
	disabled?: boolean
	tech_level?: string
	cost?: string
	weight?: string
	features?: ImportedFeature[]
}

interface ImportedEquipmentModifierContainerSystemSource
	extends ImportedContainerBase<
		ImportedEquipmentModifierSystemSource | ImportedEquipmentModifierContainerSystemSource
	> {
	type: ImportedItemType.EquipmentModifierContainer
	name?: string
	reference?: string
	reference_highlight?: string
	notes?: string
	vtt_notes?: string
	tags?: string[]
}

interface ImportedNoteSystemSource {
	type: ImportedItemType.Note
	text?: string
	reference?: string
	reference_highlight?: string
}

interface ImportedNoteContainerSystemSource
	extends ImportedContainerBase<ImportedNoteSystemSource | ImportedNoteContainerSystemSource> {
	type: ImportedItemType.NoteContainer
	text?: string
	reference?: string
	reference_highlight?: string
}

interface ImportedMeleeWeaponSystemSource {
	type: ImportedItemType.MeleeWeapon
	damage: ImportedWeaponDamage
	strength?: string
	usage?: string
	usage_notes?: string
	reach?: string
	parry?: string
	block?: string
	defaults?: ImportedSkillDefault[]
}

interface ImportedRangedWeaponSystemSource {
	type: ImportedItemType.RangedWeapon
	damage: ImportedWeaponDamage
	strength?: string
	usage?: string
	usage_notes?: string
	accuracy?: string
	range?: string
	rate_of_fire?: string
	shots?: string
	bulk?: string
	recoil?: string
	defaults?: ImportedSkillDefault[]
}

interface ImportedPointsRecord {
	when: string
	points: number
	reason?: string
}

interface ImportedCharacterProfile {
	name?: string
	age?: string
	birthday?: string
	eyes?: string
	hair?: string
	skin?: string
	handedness?: string
	gender?: string
	height?: string
	weight?: ImportedWeight
	player_name?: string
	title?: string
	organization?: string
	religion?: string
	tech_level?: string
	portrait?: string
	SM?: number
}

interface ImportedPageSettings {
	paper_size: paper.Size
	orientation: paper.Orientation
	top_margin: paper.Length
	left_margin: paper.Length
	bottom_margin: paper.Length
	right_margin: paper.Length
}

interface ImportedThreshold {
	state: string
	expression: string
	explanation?: string
	ops?: ThresholdOp[]
}

interface ImportedAttributeDef {
	id: string
	type: attribute.Type
	name: string
	full_name?: string
	attribute_base?: string
	cost_per_point?: number
	cost_adj_percent_per_sm?: number
	thresholds?: ImportedThreshold[]
}

interface ImportedResourceTrackerDef {
	id: string
	name: string
	full_name?: string
	min?: number
	max?: number
	isMinEnforced?: boolean
	isMaxEnforced?: boolean
	thresholds?: ImportedThreshold[]
}

interface ImportedMoveTypeOverride {
	condition: {
		type: MoveTypeOverrideConditionType
		qualifier: string
	}
	base: string
}

interface ImportedMoveTypeDef {
	id: string
	name: string
	base?: string
	cost_per_point?: number // unused
	overrides?: ImportedMoveTypeOverride[]
}

interface ImportedHitLocation {
	id: string
	choice_name: string
	table_name: string
	slots?: number
	hit_penalty?: number
	dr_bonus?: number
	description?: string
	sub_table?: ImportedBody
}

interface ImportedBody {
	name?: string
	roll: string
	locations?: ImportedHitLocation[]
}

interface ImportedSheetSettings {
	page?: ImportedPageSettings
	block_layout?: string[]
	attributes?: ImportedAttributeDef[]
	body_type?: ImportedBody
	damage_progression: progression.Option
	default_length_units: LengthUnits
	default_weight_units: WeightUnits
	user_description_display: display.Option
	modifiers_display: display.Option
	notes_display: display.Option
	skill_level_adj_display: display.Option
	use_multiplicative_modifiers?: boolean
	use_modifying_dice_plus_adds?: boolean
	use_half_stat_defaults?: boolean
	show_trait_modifier_adj?: boolean
	show_equipment_modifier_adj?: boolean
	show_spell_adj?: boolean
	use_title_in_footer?: boolean
	exclude_unspent_points_from_total: boolean
}

interface ImportedAttribute {
	attr_id: string
	adj: number
	damage?: number
}

interface ImportedResourceTracker {
	id: string
	damage: number
}

interface ImportedMoveType {
	id: string
	adj?: number
}

interface ImportedMoveData {
	maneuver: string
	posture: string
	type: string
}

interface ImportedThirdPartyData {
	settings?: {
		resource_trackers?: ImportedResourceTrackerDef[]
		move_types?: ImportedMoveTypeDef[]
	}
	resource_trackers?: ImportedResourceTracker[]
	move_types?: ImportedMoveType[]
	move?: ImportedMoveData
	[key: string]: unknown
}

interface ImportedCharacterSystemSource {
	type: "character"
	version: number
	total_points: number
	points_record?: ImportedPointsRecord[]
	profile?: ImportedCharacterProfile
	settings?: ImportedSheetSettings
	attributes: ImportedAttribute[]
	traits?: (ImportedTraitSystemSource | ImportedTraitContainerSystemSource)[]
	skills?: (ImportedSkillSystemSource | ImportedTechniqueSystemSorce | ImportedSkillContainerSystemSource)[]
	spells?: (ImportedSpellSystemSource | ImportedRitualMagicSpellSystemSource | ImportedSpellContainerSystemSource)[]
	equipment?: (ImportedEquipmentSystemSource | ImportedEquipmentContainerSystemSource)[]
	other_equipment?: (ImportedEquipmentSystemSource | ImportedEquipmentContainerSystemSource)[]
	notes?: (ImportedNoteSystemSource | ImportedNoteContainerSystemSource)[]
	created_date: string
	modified_date: string
	third_party?: ImportedThirdPartyData
}

export type ImportedItemSource =
	| ImportedTraitSystemSource
	| ImportedTraitContainerSystemSource
	| ImportedTraitModifierSystemSource
	| ImportedTraitModifierContainerSystemSource
	| ImportedSkillSystemSource
	| ImportedTechniqueSystemSorce
	| ImportedSkillContainerSystemSource
	| ImportedSpellSystemSource
	| ImportedRitualMagicSpellSystemSource
	| ImportedSpellContainerSystemSource
	| ImportedEquipmentSystemSource
	| ImportedEquipmentContainerSystemSource
	| ImportedEquipmentModifierSystemSource
	| ImportedEquipmentModifierContainerSystemSource
	| ImportedNoteSystemSource
	| ImportedNoteContainerSystemSource
	| ImportedMeleeWeaponSystemSource
	| ImportedRangedWeaponSystemSource

interface TraitLibrarySystemSource {
	version: number
	type: "trait_list"
	rows: (ImportedTraitSystemSource | ImportedTraitContainerSystemSource)[]
}
interface TraitModifierLibrarySystemSource {
	version: number
	type: "modifier_list"
	rows: (ImportedTraitModifierSystemSource | ImportedTraitModifierContainerSystemSource)[]
}
interface SkillLibrarySystemSource {
	version: number
	type: "skill_list"
	rows: (ImportedSkillSystemSource | ImportedTechniqueSystemSorce | ImportedSkillContainerSystemSource)[]
}
interface SpellLibrarySystemSource {
	version: number
	type: "spell_list"
	rows: (ImportedSpellSystemSource | ImportedRitualMagicSpellSystemSource | ImportedSpellContainerSystemSource)[]
}
interface EquipmentLibrarySystemSource {
	version: number
	type: "equipment_list"
	rows: (ImportedEquipmentSystemSource | ImportedEquipmentContainerSystemSource)[]
}
interface EquipmentModifierLibrarySystemSource {
	version: number
	type: "eqp_modifier_list"
	rows: (ImportedEquipmentModifierSystemSource | ImportedEquipmentModifierContainerSystemSource)[]
}
interface NoteLibrarySystemSource {
	version: number
	type: "note_list"
	rows: (ImportedNoteSystemSource | ImportedNoteContainerSystemSource)[]
}

export type ImportedItemLibrarySource =
	| TraitLibrarySystemSource
	| TraitModifierLibrarySystemSource
	| SkillLibrarySystemSource
	| SpellLibrarySystemSource
	| EquipmentLibrarySystemSource
	| EquipmentModifierLibrarySystemSource
	| NoteLibrarySystemSource

export type {
	ImportedAttribute,
	ImportedAttributeBonus,
	ImportedAttributeDef,
	ImportedAttributePrereq,
	ImportedBody,
	ImportedCharacterProfile,
	ImportedCharacterSystemSource,
	ImportedContainedQuantityPrereq,
	ImportedContainedWeightPrereq,
	ImportedCostReduction,
	ImportedDRBonus,
	ImportedEquipmentContainerSystemSource,
	ImportedEquipmentModifierContainerSystemSource,
	ImportedEquipmentModifierSystemSource,
	ImportedEquipmentSystemSource,
	ImportedEquippedEquipmentPrereq,
	ImportedFeature,
	ImportedHitLocation,
	ImportedMeleeWeaponSystemSource,
	ImportedMoveData,
	ImportedMoveType,
	ImportedMoveTypeDef,
	ImportedMoveTypeOverride,
	ImportedNoteContainerSystemSource,
	ImportedNoteSystemSource,
	ImportedPageSettings,
	ImportedPointsRecord,
	ImportedPrereqList,
	ImportedRangedWeaponSystemSource,
	ImportedResourceTracker,
	ImportedResourceTrackerDef,
	ImportedRitualMagicSpellSystemSource,
	ImportedSheetSettings,
	ImportedSkillBonus,
	ImportedSkillContainerSystemSource,
	ImportedSkillPointBonus,
	ImportedSkillPrereq,
	ImportedSkillSystemSource,
	ImportedSpellBonus,
	ImportedSpellContainerSystemSource,
	ImportedSpellPointBonus,
	ImportedSpellPrereq,
	ImportedSpellSystemSource,
	ImportedStudy,
	ImportedTechniqueSystemSorce,
	ImportedTemplatePicker,
	ImportedThirdPartyData,
	ImportedThreshold,
	ImportedTraitContainerSystemSource,
	ImportedTraitModifierContainerSystemSource,
	ImportedTraitModifierSystemSource,
	ImportedTraitPrereq,
	ImportedTraitSystemSource,
	ImportedWeaponBonus,
}

export { GCS_FILE_VERSION }
