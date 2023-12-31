import {
	CharacterDataGURPS,
	CharacterGURPS,
	LootDataGURPS,
	LootGURPS,
	StaticCharacterDataGURPS,
	StaticCharacterGURPS,
	StaticThresholdComparison,
	StaticThresholdOperator,
} from "@actor"
import {
	AttributeBonus,
	AttributeBonusObj,
	ConditionalModifierBonus,
	ConditionalModifierBonusObj,
	ContainedWeightReduction,
	ContainedWeightReductionObj,
	CostReduction,
	CostReductionObj,
	DRBonus,
	DRBonusObj,
	FeatureType,
	MoveBonus,
	ReactionBonus,
	ReactionBonusObj,
	SkillBonus,
	SkillBonusObj,
	SkillPointBonus,
	SkillPointBonusObj,
	SpellBonus,
	SpellBonusObj,
	SpellPointBonus,
	SpellPointBonusObj,
	WeaponBonus,
	WeaponBonusObj,
	// ThresholdBonus,
} from "@feature"
import {
	// BaseItemGURPS,
	// ContainerGURPS,
	EquipmentContainerData,
	EquipmentContainerGURPS,
	EquipmentContainerSystemData,
	EquipmentData,
	EquipmentGURPS,
	EquipmentModifierContainerData,
	EquipmentModifierContainerGURPS,
	EquipmentModifierContainerSystemData,
	EquipmentModifierData,
	EquipmentModifierGURPS,
	EquipmentModifierSystemData,
	EquipmentSystemData,
	MeleeWeaponData,
	MeleeWeaponGURPS,
	MeleeWeaponSystemData,
	NoteContainerData,
	NoteContainerGURPS,
	NoteContainerSystemData,
	NoteData,
	NoteGURPS,
	NoteSystemData,
	RangedWeaponData,
	RangedWeaponGURPS,
	RangedWeaponSystemData,
	RitualMagicSpellData,
	RitualMagicSpellGURPS,
	RitualMagicSpellSystemData,
	SkillContainerData,
	SkillContainerGURPS,
	SkillContainerSystemData,
	SkillData,
	SkillGURPS,
	SkillSystemData,
	SpellContainerData,
	SpellContainerGURPS,
	SpellContainerSystemData,
	SpellData,
	SpellGURPS,
	SpellSystemData,
	TechniqueData,
	TechniqueGURPS,
	TechniqueSystemData,
	TraitContainerData,
	TraitContainerGURPS,
	TraitContainerSystemData,
	TraitContainerType,
	TraitData,
	TraitGURPS,
	TraitModifierContainerData,
	TraitModifierContainerGURPS,
	TraitModifierContainerSystemData,
	TraitModifierData,
	TraitModifierGURPS,
	TraitModifierSystemData,
	TraitSystemData,
	wswitch,
} from "@item"
import { ConditionData, ConditionGURPS, ConditionID, ManeuverID } from "@item/condition"
import { DurationType, EffectData, EffectGURPS } from "@item/effect"
import { StaticItemGURPS } from "@item/static"
import {
	AttributePrereq,
	ContainedQuantityPrereq,
	ContainedWeightPrereq,
	EquippedEquipmentPrereq,
	PrereqList,
	SkillPrereq,
	SpellPrereq,
	TraitPrereq,
} from "@prereq"
import { ActorType, EFFECT_ACTION, ItemType, PrereqType, StudyHoursNeeded, StudyType } from "./data"
import { MoveTypeOverrideConditionType } from "./move_type"

// Const GURPSCONFIG: any = CONFIG;
const GURPSCONFIG: CONFIG["GURPS"] = {
	Item: {
		documentClasses: {
			// Base: BaseItemGURPS,
			// container: ContainerGURPS,
			[ItemType.Trait]: TraitGURPS,
			[ItemType.TraitContainer]: TraitContainerGURPS,
			[ItemType.TraitModifier]: TraitModifierGURPS,
			[ItemType.TraitModifierContainer]: TraitModifierContainerGURPS,
			[ItemType.Skill]: SkillGURPS,
			[ItemType.Technique]: TechniqueGURPS,
			[ItemType.SkillContainer]: SkillContainerGURPS,
			[ItemType.Spell]: SpellGURPS,
			[ItemType.RitualMagicSpell]: RitualMagicSpellGURPS,
			[ItemType.SpellContainer]: SpellContainerGURPS,
			[ItemType.Equipment]: EquipmentGURPS,
			[ItemType.EquipmentContainer]: EquipmentContainerGURPS,
			[ItemType.EquipmentModifier]: EquipmentModifierGURPS,
			[ItemType.EquipmentModifierContainer]: EquipmentModifierContainerGURPS,
			[ItemType.Note]: NoteGURPS,
			[ItemType.NoteContainer]: NoteContainerGURPS,
			[ItemType.Effect]: EffectGURPS,
			[ItemType.Condition]: ConditionGURPS,
			[ItemType.LegacyEquipment]: StaticItemGURPS,
			[ItemType.MeleeWeapon]: MeleeWeaponGURPS,
			[ItemType.RangedWeapon]: RangedWeaponGURPS,
		},
		allowedContents: {
			[ItemType.Trait]: [
				ItemType.TraitModifier,
				ItemType.TraitModifierContainer,
				ItemType.MeleeWeapon,
				ItemType.RangedWeapon,
			],
			[ItemType.TraitContainer]: [
				ItemType.TraitModifier,
				ItemType.TraitModifierContainer,
				ItemType.Trait,
				ItemType.TraitContainer,
				ItemType.MeleeWeapon,
				ItemType.RangedWeapon,
			],
			[ItemType.TraitModifierContainer]: [ItemType.TraitModifier, ItemType.TraitModifierContainer],
			[ItemType.Skill]: [ItemType.MeleeWeapon, ItemType.RangedWeapon],
			[ItemType.Technique]: [ItemType.MeleeWeapon, ItemType.RangedWeapon],
			[ItemType.SkillContainer]: [ItemType.Skill, ItemType.Technique, ItemType.SkillContainer],
			[ItemType.Spell]: [ItemType.MeleeWeapon, ItemType.RangedWeapon],
			[ItemType.RitualMagicSpell]: [ItemType.MeleeWeapon, ItemType.RangedWeapon],
			[ItemType.SpellContainer]: [ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer],
			[ItemType.Equipment]: [
				ItemType.EquipmentModifier,
				ItemType.EquipmentModifierContainer,
				ItemType.MeleeWeapon,
				ItemType.RangedWeapon,
			],
			[ItemType.EquipmentContainer]: [
				ItemType.Equipment,
				ItemType.EquipmentContainer,
				ItemType.EquipmentModifier,
				ItemType.EquipmentModifierContainer,
				ItemType.MeleeWeapon,
				ItemType.RangedWeapon,
			],
			[ItemType.EquipmentModifierContainer]: [ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer],
			[ItemType.NoteContainer]: [ItemType.Note, ItemType.NoteContainer],
		},
		childTypes: {
			[ItemType.Trait]: [],
			[ItemType.TraitContainer]: [ItemType.Trait, ItemType.TraitContainer],
			[ItemType.TraitModifier]: [],
			[ItemType.TraitModifierContainer]: [ItemType.TraitModifier, ItemType.TraitModifierContainer],
			[ItemType.Skill]: [],
			[ItemType.Technique]: [],
			[ItemType.SkillContainer]: [ItemType.Skill, ItemType.Technique, ItemType.SkillContainer],
			[ItemType.Spell]: [],
			[ItemType.RitualMagicSpell]: [],
			[ItemType.SpellContainer]: [ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer],
			[ItemType.Equipment]: [],
			[ItemType.EquipmentContainer]: [ItemType.Equipment, ItemType.EquipmentContainer],
			[ItemType.EquipmentModifier]: [],
			[ItemType.EquipmentModifierContainer]: [ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer],
			[ItemType.Note]: [],
			[ItemType.NoteContainer]: [ItemType.Note, ItemType.NoteContainer],
		},
	},
	Actor: {
		documentClasses: {
			[ActorType.Character]: CharacterGURPS,
			[ActorType.LegacyCharacter]: StaticCharacterGURPS,
			[ActorType.LegacyEnemy]: StaticCharacterGURPS,
			[ActorType.Loot]: LootGURPS,
		},
		allowedContents: {
			[ActorType.Character]: [
				ItemType.Trait,
				ItemType.TraitContainer,
				ItemType.Skill,
				ItemType.Technique,
				ItemType.SkillContainer,
				ItemType.Spell,
				ItemType.RitualMagicSpell,
				ItemType.SpellContainer,
				ItemType.Equipment,
				ItemType.EquipmentContainer,
				ItemType.Note,
				ItemType.NoteContainer,
				ItemType.Effect,
				ItemType.Condition,
			],
			[ActorType.LegacyCharacter]: [ItemType.LegacyEquipment, ItemType.Effect, ItemType.Condition],
			[ActorType.LegacyEnemy]: [ItemType.LegacyEquipment, ItemType.Effect, ItemType.Condition],
			[ActorType.Loot]: [ItemType.Equipment, ItemType.EquipmentContainer],
		},
	},
	Feature: {
		classes: {
			[FeatureType.AttributeBonus]: AttributeBonus,
			[FeatureType.ConditionalModifierBonus]: ConditionalModifierBonus,
			[FeatureType.DRBonus]: DRBonus,
			[FeatureType.ReactionBonus]: ReactionBonus,
			[FeatureType.SkillBonus]: SkillBonus,
			[FeatureType.SkillPointBonus]: SkillPointBonus,
			[FeatureType.SpellBonus]: SpellBonus,
			[FeatureType.SpellPointBonus]: SpellPointBonus,
			[FeatureType.WeaponBonus]: WeaponBonus,
			[FeatureType.WeaponAccBonus]: WeaponBonus,
			[FeatureType.WeaponScopeAccBonus]: WeaponBonus,
			[FeatureType.WeaponDRDivisorBonus]: WeaponBonus,
			[FeatureType.WeaponMinSTBonus]: WeaponBonus,
			[FeatureType.WeaponMinReachBonus]: WeaponBonus,
			[FeatureType.WeaponMaxReachBonus]: WeaponBonus,
			[FeatureType.WeaponHalfDamageRangeBonus]: WeaponBonus,
			[FeatureType.WeaponMinRangeBonus]: WeaponBonus,
			[FeatureType.WeaponMaxRangeBonus]: WeaponBonus,
			[FeatureType.WeaponRecoilBonus]: WeaponBonus,
			[FeatureType.WeaponBulkBonus]: WeaponBonus,
			[FeatureType.WeaponParryBonus]: WeaponBonus,
			[FeatureType.WeaponBlockBonus]: WeaponBonus,
			[FeatureType.WeaponRofMode1ShotsBonus]: WeaponBonus,
			[FeatureType.WeaponRofMode1SecondaryBonus]: WeaponBonus,
			[FeatureType.WeaponRofMode2ShotsBonus]: WeaponBonus,
			[FeatureType.WeaponRofMode2SecondaryBonus]: WeaponBonus,
			[FeatureType.WeaponNonChamberShotsBonus]: WeaponBonus,
			[FeatureType.WeaponChamberShotsBonus]: WeaponBonus,
			[FeatureType.WeaponShotDurationBonus]: WeaponBonus,
			[FeatureType.WeaponReloadTimeBonus]: WeaponBonus,
			[FeatureType.WeaponSwitch]: WeaponBonus,
			[FeatureType.CostReduction]: CostReduction,
			[FeatureType.ContainedWeightReduction]: ContainedWeightReduction,
			[FeatureType.MoveBonus]: MoveBonus,
		},
	},
	Prereq: {
		classes: {
			[PrereqType.List]: PrereqList,
			[PrereqType.Trait]: TraitPrereq,
			[PrereqType.Attribute]: AttributePrereq,
			[PrereqType.ContainedQuantity]: ContainedQuantityPrereq,
			[PrereqType.ContainedWeight]: ContainedWeightPrereq,
			[PrereqType.Equipment]: EquippedEquipmentPrereq,
			[PrereqType.Skill]: SkillPrereq,
			[PrereqType.Spell]: SpellPrereq,
		},
	},
	select: {
		cr_level: {
			0: "gurps.select.cr_level.0",
			6: "gurps.select.cr_level.6",
			9: "gurps.select.cr_level.9",
			12: "gurps.select.cr_level.12",
			15: "gurps.select.cr_level.15",
		},
		cr_adj: {
			none: "gurps.select.cr_adj.none",
			action_penalty: "gurps.select.cr_adj.action_penalty",
			reaction_penalty: "gurps.select.cr_adj.reaction_penalty",
			fright_check_penalty: "gurps.select.cr_adj.fright_check_penalty",
			fright_check_bonus: "gurps.select.cr_adj.fright_check_bonus",
			minor_cost_of_living_increase: "gurps.select.cr_adj.minor_cost_of_living_increase",
			major_cost_of_living_increase: "gurps.select.cr_adj.major_cost_of_living_increase",
		},
		number_compare: {
			none: "gurps.select.number_compare.none",
			is: "gurps.select.number_compare.is",
			is_not: "gurps.select.number_compare.is_not",
			at_least: "gurps.select.number_compare.at_least",
			at_most: "gurps.select.number_compare.at_most",
		},
		number_compare_strict: {
			is: "gurps.select.number_compare_strict.is",
			at_least: "gurps.select.number_compare_strict.at_least",
			at_most: "gurps.select.number_compare_strict.at_most",
		},
		string_compare: {
			none: "gurps.select.string_compare.none",
			is: "gurps.select.string_compare.is",
			is_not: "gurps.select.string_compare.is_not",
			contains: "gurps.select.string_compare.contains",
			does_not_contain: "gurps.select.string_compare.does_not_contain",
			starts_with: "gurps.select.string_compare.starts_with",
			does_not_start_with: "gurps.select.string_compare.does_not_start_with",
			ends_with: "gurps.select.string_compare.ends_with",
			does_not_end_with: "gurps.select.string_compare.does_not_end_with",
		},
		has: {
			true: "gurps.select.has.true",
			false: "gurps.select.has.false",
		},
		all: {
			true: "gurps.select.all.true",
			false: "gurps.select.all.false",
		},
		prereqs: {
			trait_prereq: "gurps.select.prereqs.trait_prereq",
			attribute_prereq: "gurps.select.prereqs.attribute_prereq",
			contained_quantity_prereq: "gurps.select.prereqs.contained_quantity_prereq",
			contained_weight_prereq: "gurps.select.prereqs.contained_weight_prereq",
			equipped_equipment_prereq: "gurps.select.prereqs.equipped_equipment_prereq",
			skill_prereq: "gurps.select.prereqs.skill_prereq",
			spell_prereq: "gurps.select.prereqs.spell_prereq",
		},
		spell_sub_type: {
			name: "gurps.select.spell_sub_type.name",
			tag: "gurps.select.spell_sub_type.tag",
			college: "gurps.select.spell_sub_type.college",
			college_count: "gurps.select.spell_sub_type.college_count",
			any: "gurps.select.spell_sub_type.any",
		},
		features: {
			[FeatureType.AttributeBonus]: `gurps.select.features.${FeatureType.AttributeBonus}`,
			[FeatureType.ConditionalModifierBonus]: `gurps.select.features.${FeatureType.ConditionalModifierBonus}`,
			[FeatureType.DRBonus]: `gurps.select.features.${FeatureType.DRBonus}`,
			[FeatureType.ReactionBonus]: `gurps.select.features.${FeatureType.ReactionBonus}`,
			[FeatureType.SkillBonus]: `gurps.select.features.${FeatureType.SkillBonus}`,
			[FeatureType.SkillPointBonus]: `gurps.select.features.${FeatureType.SkillPointBonus}`,
			[FeatureType.SpellBonus]: `gurps.select.features.${FeatureType.SpellBonus}`,
			[FeatureType.SpellPointBonus]: `gurps.select.features.${FeatureType.SpellPointBonus}`,
			[FeatureType.WeaponBonus]: `gurps.select.features.${FeatureType.WeaponBonus}`,
			[FeatureType.WeaponAccBonus]: `gurps.select.features.${FeatureType.WeaponAccBonus}`,
			[FeatureType.WeaponScopeAccBonus]: `gurps.select.features.${FeatureType.WeaponScopeAccBonus}`,
			[FeatureType.WeaponDRDivisorBonus]: `gurps.select.features.${FeatureType.WeaponDRDivisorBonus}`,
			[FeatureType.WeaponMinSTBonus]: `gurps.select.features.${FeatureType.WeaponMinSTBonus}`,
			[FeatureType.WeaponMinReachBonus]: `gurps.select.features.${FeatureType.WeaponMinReachBonus}`,
			[FeatureType.WeaponMaxReachBonus]: `gurps.select.features.${FeatureType.WeaponMaxReachBonus}`,
			[FeatureType.WeaponHalfDamageRangeBonus]: `gurps.select.features.${FeatureType.WeaponHalfDamageRangeBonus}`,
			[FeatureType.WeaponMinRangeBonus]: `gurps.select.features.${FeatureType.WeaponMinRangeBonus}`,
			[FeatureType.WeaponMaxRangeBonus]: `gurps.select.features.${FeatureType.WeaponMaxRangeBonus}`,
			[FeatureType.WeaponRecoilBonus]: `gurps.select.features.${FeatureType.WeaponRecoilBonus}`,
			[FeatureType.WeaponBulkBonus]: `gurps.select.features.${FeatureType.WeaponBulkBonus}`,
			[FeatureType.WeaponParryBonus]: `gurps.select.features.${FeatureType.WeaponParryBonus}`,
			[FeatureType.WeaponBlockBonus]: `gurps.select.features.${FeatureType.WeaponBlockBonus}`,
			[FeatureType.WeaponRofMode1ShotsBonus]: `gurps.select.features.${FeatureType.WeaponRofMode1ShotsBonus}`,
			[FeatureType.WeaponRofMode1SecondaryBonus]: `gurps.select.features.${FeatureType.WeaponRofMode1SecondaryBonus}`,
			[FeatureType.WeaponRofMode2ShotsBonus]: `gurps.select.features.${FeatureType.WeaponRofMode2ShotsBonus}`,
			[FeatureType.WeaponRofMode2SecondaryBonus]: `gurps.select.features.${FeatureType.WeaponRofMode2SecondaryBonus}`,
			[FeatureType.WeaponNonChamberShotsBonus]: `gurps.select.features.${FeatureType.WeaponNonChamberShotsBonus}`,
			[FeatureType.WeaponChamberShotsBonus]: `gurps.select.features.${FeatureType.WeaponChamberShotsBonus}`,
			[FeatureType.WeaponShotDurationBonus]: `gurps.select.features.${FeatureType.WeaponShotDurationBonus}`,
			[FeatureType.WeaponReloadTimeBonus]: `gurps.select.features.${FeatureType.WeaponReloadTimeBonus}`,
			[FeatureType.WeaponSwitch]: `gurps.select.features.${FeatureType.WeaponSwitch}`,
			[FeatureType.CostReduction]: `gurps.select.features.${FeatureType.CostReduction}`,
			[FeatureType.ContainedWeightReduction]: `gurps.select.features.${FeatureType.ContainedWeightReduction}`,
			[FeatureType.MoveBonus]: `gurps.select.features.${FeatureType.MoveBonus}`,
		},
		features_eqc: {
			[FeatureType.ContainedWeightReduction]: "gurps.select.features.contained_weight_reduction",
		},
		st_limitation: {
			none: "gurps.select.st_limitation.none",
			striking_only: "gurps.select.st_limitation.striking_only",
			lifting_only: "gurps.select.st_limitation.lifting_only",
			throwing_only: "gurps.select.st_limitation.throwing_only",
		},
		skill_bonus_selection_type: {
			skills_with_name: "gurps.select.skill_bonus_selection_type.skills_with_name",
			weapons_with_name: "gurps.select.skill_bonus_selection_type.weapons_with_name",
			this_weapon: "gurps.select.skill_bonus_selection_type.this_weapon",
		},
		weapon_bonus_selection_type: {
			weapons_with_required_skill: "gurps.select.weapon_bonus_selection_type.weapons_with_required_skill",
			weapons_with_name: "gurps.select.weapon_bonus_selection_type.weapons_with_name",
			this_weapon: "gurps.select.weapon_bonus_selection_type.this_weapon",
		},
		spell_match: {
			all_colleges: "gurps.select.spell_match.all_colleges",
			college_name: "gurps.select.spell_match.college_name",
			power_source_name: "gurps.select.spell_match.power_source_name",
			spell_name: "gurps.select.spell_match.spell_name",
		},
		percentage: {
			5: "5",
			10: "10",
			15: "15",
			20: "20",
			25: "25",
			30: "30",
			35: "35",
			40: "40",
			45: "45",
			50: "50",
			55: "55",
			60: "60",
			65: "65",
			70: "70",
			75: "75",
			80: "80",
		},
		damage_st: {
			none: "gurps.select.damage_st.none",
			thr: "gurps.select.damage_st.thr",
			thr_leveled: "gurps.select.damage_st.thr_leveled",
			sw: "gurps.select.damage_st.sw",
			sw_leveled: "gurps.select.damage_st.sw_leveled",
		},
		container_type: {
			[TraitContainerType.Group]: "gurps.select.container_type.group",
			[TraitContainerType.MetaTrait]: "gurps.select.container_type.meta_trait",
			[TraitContainerType.Ancestry]: "gurps.select.container_type.ancestry",
			[TraitContainerType.Attributes]: "gurps.select.container_type.attributes",
			[TraitContainerType.AlternativeAbilities]: "gurps.select.container_type.alternative_abilities",
		},
		difficulty: {
			e: "gurps.select.difficulty.easy",
			a: "gurps.select.difficulty.average",
			h: "gurps.select.difficulty.hard",
			vh: "gurps.select.difficulty.very_hard",
			w: "gurps.select.difficulty.wildcard",
		},
		trait_mod_cost_type: {
			percentage_leveled: "gurps.select.trait_mod_cost_type.percentage_leveled",
			percentage: "gurps.select.trait_mod_cost_type.percentage",
			points: "gurps.select.trait_mod_cost_type.points",
			multiplier: "gurps.select.trait_mod_cost_type.multiplier",
		},
		trait_mod_affects: {
			total: "gurps.select.trait_mod_affects.total",
			base_only: "gurps.select.trait_mod_affects.base_only",
			levels_only: "gurps.select.trait_mod_affects.levels_only",
		},
		eqp_mod_cost_type: {
			to_original_cost: "gurps.select.eqp_mod_cost_type.to_original_cost",
			to_base_cost: "gurps.select.eqp_mod_cost_type.to_base_cost",
			to_final_base_cost: "gurps.select.eqp_mod_cost_type.to_final_base_cost",
			to_final_cost: "gurps.select.eqp_mod_cost_type.to_final_cost",
		},
		eqp_mod_weight_type: {
			to_original_weight: "gurps.select.eqp_mod_weight_type.to_original_weight",
			to_base_weight: "gurps.select.eqp_mod_weight_type.to_base_weight",
			to_final_base_weight: "gurps.select.eqp_mod_weight_type.to_final_base_weight",
			to_final_weight: "gurps.select.eqp_mod_weight_type.to_final_weight",
		},
		maneuvers: {
			none: "gurps.maneuver.none",
			[ManeuverID.DoNothing]: `gurps.maneuver.${ManeuverID.DoNothing}`,
			[ManeuverID.Move]: `gurps.maneuver.${ManeuverID.Move}`,
			[ManeuverID.ChangePosture]: `gurps.maneuver.${ManeuverID.ChangePosture}`,
			[ManeuverID.Aiming]: `gurps.maneuver.${ManeuverID.Aiming}`,
			[ManeuverID.Evaluate]: `gurps.maneuver.${ManeuverID.Evaluate}`,
			[ManeuverID.Attack]: `gurps.maneuver.${ManeuverID.Attack}`,
			[ManeuverID.Feint]: `gurps.maneuver.${ManeuverID.Feint}`,
			[ManeuverID.MoveAndAttack]: `gurps.maneuver.${ManeuverID.MoveAndAttack}`,
			[ManeuverID.Ready]: `gurps.maneuver.${ManeuverID.Ready}`,
			[ManeuverID.Concentrate]: `gurps.maneuver.${ManeuverID.Concentrate}`,
			[ManeuverID.Wait]: `gurps.maneuver.${ManeuverID.Wait}`,
			[ManeuverID.AOA]: `gurps.maneuver.${ManeuverID.AOA}`,
			[ManeuverID.AOADetermined]: `gurps.maneuver.${ManeuverID.AOADetermined}`,
			[ManeuverID.AOADouble]: `gurps.maneuver.${ManeuverID.AOADouble}`,
			[ManeuverID.AOAFeint]: `gurps.maneuver.${ManeuverID.AOAFeint}`,
			[ManeuverID.AOAStrong]: `gurps.maneuver.${ManeuverID.AOAStrong}`,
			[ManeuverID.AOASF]: `gurps.maneuver.${ManeuverID.AOASF}`,
			[ManeuverID.AOD]: `gurps.maneuver.${ManeuverID.AOD}`,
			[ManeuverID.AODDodge]: `gurps.maneuver.${ManeuverID.AODDodge}`,
			[ManeuverID.AODParry]: `gurps.maneuver.${ManeuverID.AODParry}`,
			[ManeuverID.AODBlock]: `gurps.maneuver.${ManeuverID.AODBlock}`,
			[ManeuverID.AODDouble]: `gurps.maneuver.${ManeuverID.AODDouble}`,
		},
		postures: {
			standing: "gurps.status.posture_standing",
			[ConditionID.PostureProne]: `gurps.status.${ConditionID.PostureProne}`,
			[ConditionID.PostureCrouch]: `gurps.status.${ConditionID.PostureCrouch}`,
			[ConditionID.PostureKneel]: `gurps.status.${ConditionID.PostureKneel}`,
			[ConditionID.PostureSit]: `gurps.status.${ConditionID.PostureSit}`,
			[ConditionID.PostureCrawl]: `gurps.status.${ConditionID.PostureCrawl}`,
		},
		damage_progression: {
			basic_set: "gurps.select.damage_progression.basic_set",
			knowing_your_own_strength: "gurps.select.damage_progression.knowing_your_own_strength",
			no_school_grognard_damage: "gurps.select.damage_progression.no_school_grognard_damage",
			thrust_equals_swing_minus_2: "gurps.select.damage_progression.thrust_equals_swing_minus_2",
			swing_equals_thrust_plus_2: "gurps.select.damage_progression.swing_equals_thrust_plus_2",
			phoenix_flame_d3: "gurps.select.damage_progression.phoenix_flame_d3",
		},
		default_length_units: {
			ft_in: "gurps.length_units.ft_in",
			in: "gurps.length_units.in",
			ft: "gurps.length_units.ft",
			yd: "gurps.length_units.yd",
			mi: "gurps.length_units.mi",
			cm: "gurps.length_units.cm",
			km: "gurps.length_units.km",
			m: "gurps.length_units.m",
		},
		default_weight_units: {
			lb: "gurps.select.default_weight_units.lb",
			"#": "gurps.select.default_weight_units.#",
			oz: "gurps.select.default_weight_units.oz",
			tn: "gurps.select.default_weight_units.tn",
			t: "gurps.select.default_weight_units.t",
			kg: "gurps.select.default_weight_units.kg",
			g: "gurps.select.default_weight_units.g",
		},
		display: {
			not_shown: "gurps.select.display.not_shown",
			inline: "gurps.select.display.inline",
			tooltip: "gurps.select.display.tooltip",
			inline_and_tooltip: "gurps.select.display.inline_and_tooltip",
		},
		attribute_type: {
			integer: "gurps.select.attribute_type.integer",
			integer_ref: "gurps.select.attribute_type.integer_ref",
			decimal: "gurps.select.attribute_type.decimal",
			decimal_ref: "gurps.select.attribute_type.decimal_ref",
			pool: "gurps.select.attribute_type.pool",
			primary_separator: "gurps.select.attribute_type.primary_separator",
			secondary_separator: "gurps.select.attribute_type.secondary_separator",
			pool_separator: "gurps.select.attribute_type.pool_separator",
		},
		study_type: {
			[StudyType.Self]: "gurps.select.study_type.self",
			[StudyType.Job]: "gurps.select.study_type.job",
			[StudyType.Teacher]: "gurps.select.study_type.teacher",
			[StudyType.Intensive]: "gurps.select.study_type.intensive",
		},
		color_mode_preference: {
			auto: "gurps.select.color_mode_preference.auto",
			dark: "gurps.select.color_mode_preference.dark",
			light: "gurps.select.color_mode_preference.light",
		},
		// Srt = static_resource_tracker
		srt_comparison: {
			[StaticThresholdComparison.LessThan]: "gurps.select.srt_comparison.less_than",
			[StaticThresholdComparison.LessThanOrEqual]: "gurps.select.srt_comparison.less_than_or_equal",
			[StaticThresholdComparison.GreaterThan]: "gurps.select.srt_comparison.greater_than",
			[StaticThresholdComparison.GreaterThanOrEqual]: "gurps.select.srt_comparison.greater_than_or_equal",
		},
		srt_operator: {
			[StaticThresholdOperator.Add]: "gurps.select.srt_operator.add",
			[StaticThresholdOperator.Subtract]: "gurps.select.srt_operator.subtract",
			[StaticThresholdOperator.Multiply]: "gurps.select.srt_operator.multiply",
			[StaticThresholdOperator.Divide]: "gurps.select.srt_operator.divide",
		},
		duration_type: {
			[DurationType.None]: "gurps.select.duration_type.none",
			[DurationType.Turns]: "gurps.select.duration_type.turns",
			[DurationType.Rounds]: "gurps.select.duration_type.rounds",
			[DurationType.Seconds]: "gurps.select.duration_type.seconds",
		},
		effect_action: {
			[EFFECT_ACTION.ADD]: "gurps.select.effect_action.add",
			[EFFECT_ACTION.REMOVE]: "gurps.select.effect_action.remove",
		},
		move_condition_type: {
			[MoveTypeOverrideConditionType.Trait]: "gurps.select.move_condition_type.trait",
			[MoveTypeOverrideConditionType.Skill]: "gurps.select.move_condition_type.skill",
			[MoveTypeOverrideConditionType.Condition]: "gurps.select.move_condition_type.condition",
		},
		conditions: Object.values(ConditionID).reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: `gurps.status.${c}`,
			})
		}, {}),
		study_hours_needed: Object.values(StudyHoursNeeded).reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: `gurps.select.study_hours_needed.${c}`,
			})
		}, {}),
		switch_type: Object.values(wswitch).reduce((acc, c) => {
			return Object.assign(acc, {
				[c]: `gurps.select.switch_type.${c}`,
			})
		}, {}),
		switch_type_value: {
			true: "gurps.select.switch_type_value.true",
			false: "gurps.select.switch_type_value.false",
		},
	},
	meleeMods: {},
	rangedMods: {},
	defenseMods: {},
	commonMods: {},
	allMods: [],
	skillDefaults: [],
}

export { GURPSCONFIG }

export type CharItemGURPS = CharContainerGCS | NoteGURPS | NoteContainerGURPS

// These classes extend the ItemGCS class
export type CharContainerGCS =
	| TraitGURPS
	| TraitContainerGURPS
	| TraitModifierGURPS
	| TraitModifierContainerGURPS
	| SkillGURPS
	| TechniqueGURPS
	| SkillContainerGURPS
	| SpellGURPS
	| RitualMagicSpellGURPS
	| SpellContainerGURPS
	| EquipmentGURPS
	| EquipmentContainerGURPS
	| EquipmentModifierGURPS
	| EquipmentModifierContainerGURPS

export type ItemGURPS = CharItemGURPS | EffectGURPS | ConditionGURPS | WeaponGURPS

export type WeaponGURPS = MeleeWeaponGURPS | RangedWeaponGURPS

export type ActorGURPS = CharacterGURPS | StaticCharacterGURPS | LootGURPS

export type Prereq =
	| PrereqList
	| TraitPrereq
	| AttributePrereq
	| ContainedWeightPrereq
	| ContainedQuantityPrereq
	| SkillPrereq
	| SpellPrereq
	| EquippedEquipmentPrereq

// export type Bonus = Feature | ThresholdBonus
export type Bonus = Feature

export type Feature =
	// | BaseFeature
	| AttributeBonus
	| ConditionalModifierBonus
	| DRBonus
	| ReactionBonus
	| SkillBonus
	| SkillPointBonus
	| SpellBonus
	| SpellPointBonus
	| WeaponBonus
	| CostReduction
	| ContainedWeightReduction

export type featureMap = {
	attributeBonuses: AttributeBonus[]
	costReductions: CostReduction[]
	drBonuses: DRBonus[]
	skillBonuses: SkillBonus[]
	skillPointBonuses: SkillPointBonus[]
	spellBonuses: SpellBonus[]
	spellPointBonuses: SpellPointBonus[]
	weaponBonuses: WeaponBonus[]
	moveBonuses: MoveBonus[]
	// thresholdBonuses: ThresholdBonus[]
}

// export type FeatureConstructor = Partial<Bonus>

export type FeatureObj =
	| AttributeBonusObj
	| ConditionalModifierBonusObj
	| DRBonusObj
	| ReactionBonusObj
	| SkillBonusObj
	| SkillPointBonusObj
	| SpellBonusObj
	| SpellPointBonusObj
	| WeaponBonusObj
	| CostReductionObj
	| ContainedWeightReductionObj

export type ItemDataGURPS =
	| TraitData
	| TraitContainerData
	| TraitModifierData
	| TraitModifierContainerData
	| SkillData
	| TechniqueData
	| SkillContainerData
	| SpellData
	| RitualMagicSpellData
	| SpellContainerData
	| EquipmentData
	| EquipmentContainerData
	| EquipmentModifierData
	| EquipmentModifierContainerData
	| NoteData
	| NoteContainerData
	| EffectData
	| ConditionData
	| MeleeWeaponData
	| RangedWeaponData

export type ItemSourceGURPS = ItemDataGURPS["_source"]

export type ContainerDataGURPS =
	| TraitData
	| TraitContainerData
	| TraitModifierContainerData
	| SkillContainerData
	| SpellContainerData
	| EquipmentData
	| EquipmentContainerData
	| EquipmentModifierContainerData
	| NoteData
	| NoteContainerData

export type ItemSystemDataGURPS =
	| TraitSystemData
	| TraitContainerSystemData
	| TraitModifierSystemData
	| TraitModifierContainerSystemData
	| SkillSystemData
	| TechniqueSystemData
	| SkillContainerSystemData
	| SpellSystemData
	| RitualMagicSpellSystemData
	| SpellContainerSystemData
	| EquipmentSystemData
	| EquipmentContainerSystemData
	| EquipmentModifierSystemData
	| EquipmentModifierContainerSystemData
	| NoteSystemData
	| NoteContainerSystemData
	| MeleeWeaponSystemData
	| RangedWeaponSystemData

export type ActorDataGURPS = CharacterDataGURPS | StaticCharacterDataGURPS | LootDataGURPS

export type ActorSourceGURPS = ActorDataGURPS["_source"]
