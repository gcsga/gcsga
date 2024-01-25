// import {
// 	CharacterDataGURPS,
// 	CharacterGURPS,
// 	LootDataGURPS,
// 	LootGURPS,
// 	StaticCharacterDataGURPS,
// 	StaticCharacterGURPS,
// } from "@actor"
// import {
// 	AttributeBonus,
// 	AttributeBonusObj,
// 	ConditionalModifierBonus,
// 	ConditionalModifierBonusObj,
// 	ContainedWeightReduction,
// 	ContainedWeightReductionObj,
// 	CostReduction,
// 	CostReductionObj,
// 	DRBonus,
// 	DRBonusObj,
// 	MoveBonus,
// 	ReactionBonus,
// 	ReactionBonusObj,
// 	SkillBonus,
// 	SkillBonusObj,
// 	SkillPointBonus,
// 	SkillPointBonusObj,
// 	SpellBonus,
// 	SpellBonusObj,
// 	SpellPointBonus,
// 	SpellPointBonusObj,
// 	WeaponBonus,
// 	WeaponBonusObj,
// } from "@feature"
// import {
// 	EquipmentContainerData,
// 	EquipmentContainerGURPS,
// 	EquipmentContainerSystemData,
// 	EquipmentData,
// 	EquipmentGURPS,
// 	EquipmentModifierContainerData,
// 	EquipmentModifierContainerGURPS,
// 	EquipmentModifierContainerSystemData,
// 	EquipmentModifierData,
// 	EquipmentModifierGURPS,
// 	EquipmentModifierSystemData,
// 	EquipmentSystemData,
// 	MeleeWeaponData,
// 	MeleeWeaponGURPS,
// 	MeleeWeaponSystemData,
// 	NoteContainerData,
// 	NoteContainerGURPS,
// 	NoteContainerSystemData,
// 	NoteData,
// 	NoteGURPS,
// 	NoteSystemData,
// 	RangedWeaponData,
// 	RangedWeaponGURPS,
// 	RangedWeaponSystemData,
// 	RitualMagicSpellData,
// 	RitualMagicSpellGURPS,
// 	RitualMagicSpellSystemData,
// 	SkillContainerData,
// 	SkillContainerGURPS,
// 	SkillContainerSystemData,
// 	SkillData,
// 	SkillGURPS,
// 	SkillSystemData,
// 	SpellContainerData,
// 	SpellContainerGURPS,
// 	SpellContainerSystemData,
// 	SpellData,
// 	SpellGURPS,
// 	SpellSystemData,
// 	TechniqueData,
// 	TechniqueGURPS,
// 	TechniqueSystemData,
// 	TraitContainerData,
// 	TraitContainerGURPS,
// 	TraitContainerSystemData,
// 	TraitData,
// 	TraitGURPS,
// 	TraitModifierContainerData,
// 	TraitModifierContainerGURPS,
// 	TraitModifierContainerSystemData,
// 	TraitModifierData,
// 	TraitModifierGURPS,
// 	TraitModifierSystemData,
// 	TraitSystemData,
// } from "@item"
// import { ConditionData, ConditionGURPS } from "@item/condition"
// import { EffectData, EffectGURPS } from "@item/effect"
// import { StaticItemGURPS } from "@item/static"
// import {
// 	AttributePrereq,
// 	ContainedQuantityPrereq,
// 	ContainedWeightPrereq,
// 	EquippedEquipmentPrereq,
// 	PrereqList,
// 	SkillPrereq,
// 	SpellPrereq,
// 	TraitPrereq,
// } from "@prereq"
// import { ActorType, ItemType } from "@module/data"
// import { feature, prereq } from "@util/enum"
//
// // Const GURPSCONFIG: any = CONFIG;
// let GURPSCONFIG: CONFIG["GURPS"] = {
// 	Item: {
// 		documentClasses: {
// 			[ItemType.Trait]: TraitGURPS,
// 			[ItemType.TraitContainer]: TraitContainerGURPS,
// 			[ItemType.TraitModifier]: TraitModifierGURPS,
// 			[ItemType.TraitModifierContainer]: TraitModifierContainerGURPS,
// 			[ItemType.Skill]: SkillGURPS,
// 			[ItemType.Technique]: TechniqueGURPS,
// 			[ItemType.SkillContainer]: SkillContainerGURPS,
// 			[ItemType.Spell]: SpellGURPS,
// 			[ItemType.RitualMagicSpell]: RitualMagicSpellGURPS,
// 			[ItemType.SpellContainer]: SpellContainerGURPS,
// 			[ItemType.Equipment]: EquipmentGURPS,
// 			[ItemType.EquipmentContainer]: EquipmentContainerGURPS,
// 			[ItemType.EquipmentModifier]: EquipmentModifierGURPS,
// 			[ItemType.EquipmentModifierContainer]: EquipmentModifierContainerGURPS,
// 			[ItemType.Note]: NoteGURPS,
// 			[ItemType.NoteContainer]: NoteContainerGURPS,
// 			[ItemType.Effect]: EffectGURPS,
// 			[ItemType.Condition]: ConditionGURPS,
// 			[ItemType.LegacyEquipment]: StaticItemGURPS,
// 			[ItemType.MeleeWeapon]: MeleeWeaponGURPS,
// 			[ItemType.RangedWeapon]: RangedWeaponGURPS,
// 		},
// 		allowedContents: {
// 			[ItemType.Trait]: [
// 				ItemType.TraitModifier,
// 				ItemType.TraitModifierContainer,
// 				ItemType.MeleeWeapon,
// 				ItemType.RangedWeapon,
// 			],
// 			[ItemType.TraitContainer]: [
// 				ItemType.TraitModifier,
// 				ItemType.TraitModifierContainer,
// 				ItemType.Trait,
// 				ItemType.TraitContainer,
// 				ItemType.MeleeWeapon,
// 				ItemType.RangedWeapon,
// 			],
// 			[ItemType.TraitModifierContainer]: [ItemType.TraitModifier, ItemType.TraitModifierContainer],
// 			[ItemType.Skill]: [ItemType.MeleeWeapon, ItemType.RangedWeapon],
// 			[ItemType.Technique]: [ItemType.MeleeWeapon, ItemType.RangedWeapon],
// 			[ItemType.SkillContainer]: [ItemType.Skill, ItemType.Technique, ItemType.SkillContainer],
// 			[ItemType.Spell]: [ItemType.MeleeWeapon, ItemType.RangedWeapon],
// 			[ItemType.RitualMagicSpell]: [ItemType.MeleeWeapon, ItemType.RangedWeapon],
// 			[ItemType.SpellContainer]: [ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer],
// 			[ItemType.Equipment]: [
// 				ItemType.EquipmentModifier,
// 				ItemType.EquipmentModifierContainer,
// 				ItemType.MeleeWeapon,
// 				ItemType.RangedWeapon,
// 			],
// 			[ItemType.EquipmentContainer]: [
// 				ItemType.Equipment,
// 				ItemType.EquipmentContainer,
// 				ItemType.EquipmentModifier,
// 				ItemType.EquipmentModifierContainer,
// 				ItemType.MeleeWeapon,
// 				ItemType.RangedWeapon,
// 			],
// 			[ItemType.EquipmentModifierContainer]: [ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer],
// 			[ItemType.NoteContainer]: [ItemType.Note, ItemType.NoteContainer],
// 		},
// 		childTypes: {
// 			[ItemType.Trait]: [],
// 			[ItemType.TraitContainer]: [ItemType.Trait, ItemType.TraitContainer],
// 			[ItemType.TraitModifier]: [],
// 			[ItemType.TraitModifierContainer]: [ItemType.TraitModifier, ItemType.TraitModifierContainer],
// 			[ItemType.Skill]: [],
// 			[ItemType.Technique]: [],
// 			[ItemType.SkillContainer]: [ItemType.Skill, ItemType.Technique, ItemType.SkillContainer],
// 			[ItemType.Spell]: [],
// 			[ItemType.RitualMagicSpell]: [],
// 			[ItemType.SpellContainer]: [ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer],
// 			[ItemType.Equipment]: [],
// 			[ItemType.EquipmentContainer]: [ItemType.Equipment, ItemType.EquipmentContainer],
// 			[ItemType.EquipmentModifier]: [],
// 			[ItemType.EquipmentModifierContainer]: [ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer],
// 			[ItemType.Note]: [],
// 			[ItemType.NoteContainer]: [ItemType.Note, ItemType.NoteContainer],
// 		},
// 	},
// 	Actor: {
// 		documentClasses: {
// 			[ActorType.Character]: CharacterGURPS,
// 			[ActorType.LegacyCharacter]: StaticCharacterGURPS,
// 			[ActorType.LegacyEnemy]: StaticCharacterGURPS,
// 			[ActorType.Loot]: LootGURPS,
// 		},
// 		allowedContents: {
// 			[ActorType.Character]: [
// 				ItemType.Trait,
// 				ItemType.TraitContainer,
// 				ItemType.Skill,
// 				ItemType.Technique,
// 				ItemType.SkillContainer,
// 				ItemType.Spell,
// 				ItemType.RitualMagicSpell,
// 				ItemType.SpellContainer,
// 				ItemType.Equipment,
// 				ItemType.EquipmentContainer,
// 				ItemType.Note,
// 				ItemType.NoteContainer,
// 				ItemType.Effect,
// 				ItemType.Condition,
// 			],
// 			[ActorType.LegacyCharacter]: [ItemType.LegacyEquipment, ItemType.Effect, ItemType.Condition],
// 			[ActorType.LegacyEnemy]: [ItemType.LegacyEquipment, ItemType.Effect, ItemType.Condition],
// 			[ActorType.Loot]: [ItemType.Equipment, ItemType.EquipmentContainer],
// 		},
// 	},
// 	Feature: {
// 		classes: {
// 			[feature.Type.AttributeBonus]: AttributeBonus,
// 			[feature.Type.ConditionalModifierBonus]: ConditionalModifierBonus,
// 			[feature.Type.DRBonus]: DRBonus,
// 			[feature.Type.ReactionBonus]: ReactionBonus,
// 			[feature.Type.SkillBonus]: SkillBonus,
// 			[feature.Type.SkillPointBonus]: SkillPointBonus,
// 			[feature.Type.SpellBonus]: SpellBonus,
// 			[feature.Type.SpellPointBonus]: SpellPointBonus,
// 			[feature.Type.WeaponBonus]: WeaponBonus,
// 			[feature.Type.WeaponAccBonus]: WeaponBonus,
// 			[feature.Type.WeaponScopeAccBonus]: WeaponBonus,
// 			[feature.Type.WeaponDRDivisorBonus]: WeaponBonus,
// 			[feature.Type.WeaponMinSTBonus]: WeaponBonus,
// 			[feature.Type.WeaponMinReachBonus]: WeaponBonus,
// 			[feature.Type.WeaponMaxReachBonus]: WeaponBonus,
// 			[feature.Type.WeaponHalfDamageRangeBonus]: WeaponBonus,
// 			[feature.Type.WeaponMinRangeBonus]: WeaponBonus,
// 			[feature.Type.WeaponMaxRangeBonus]: WeaponBonus,
// 			[feature.Type.WeaponRecoilBonus]: WeaponBonus,
// 			[feature.Type.WeaponBulkBonus]: WeaponBonus,
// 			[feature.Type.WeaponParryBonus]: WeaponBonus,
// 			[feature.Type.WeaponBlockBonus]: WeaponBonus,
// 			[feature.Type.WeaponRofMode1ShotsBonus]: WeaponBonus,
// 			[feature.Type.WeaponRofMode1SecondaryBonus]: WeaponBonus,
// 			[feature.Type.WeaponRofMode2ShotsBonus]: WeaponBonus,
// 			[feature.Type.WeaponRofMode2SecondaryBonus]: WeaponBonus,
// 			[feature.Type.WeaponNonChamberShotsBonus]: WeaponBonus,
// 			[feature.Type.WeaponChamberShotsBonus]: WeaponBonus,
// 			[feature.Type.WeaponShotDurationBonus]: WeaponBonus,
// 			[feature.Type.WeaponReloadTimeBonus]: WeaponBonus,
// 			[feature.Type.WeaponSwitch]: WeaponBonus,
// 			[feature.Type.CostReduction]: CostReduction,
// 			[feature.Type.ContainedWeightReduction]: ContainedWeightReduction,
// 			[feature.Type.MoveBonus]: MoveBonus,
// 		},
// 	},
// 	Prereq: {
// 		classes: {
// 			[prereq.Type.List]: PrereqList,
// 			[prereq.Type.Trait]: TraitPrereq,
// 			[prereq.Type.Attribute]: AttributePrereq,
// 			[prereq.Type.ContainedQuantity]: ContainedQuantityPrereq,
// 			[prereq.Type.ContainedWeight]: ContainedWeightPrereq,
// 			[prereq.Type.EquippedEquipment]: EquippedEquipmentPrereq,
// 			[prereq.Type.Skill]: SkillPrereq,
// 			[prereq.Type.Spell]: SpellPrereq,
// 		},
// 	},
// 	select: {},
// 	meleeMods: {},
// 	rangedMods: {},
// 	defenseMods: {},
// 	commonMods: {},
// 	allMods: [],
// 	skillDefaults: [],
// }
//
// export { GURPSCONFIG }
//
// export type CharItemGURPS = CharContainerGCS | NoteGURPS | NoteContainerGURPS
//
// // These classes extend the ItemGCS class
// export type CharContainerGCS =
// 	| TraitGURPS
// 	| TraitContainerGURPS
// 	| TraitModifierGURPS
// 	| TraitModifierContainerGURPS
// 	| SkillGURPS
// 	| TechniqueGURPS
// 	| SkillContainerGURPS
// 	| SpellGURPS
// 	| RitualMagicSpellGURPS
// 	| SpellContainerGURPS
// 	| EquipmentGURPS
// 	| EquipmentContainerGURPS
// 	| EquipmentModifierGURPS
// 	| EquipmentModifierContainerGURPS
//
// export type ItemGURPS = CharItemGURPS | EffectGURPS | ConditionGURPS | WeaponGURPS
//
// export type WeaponGURPS = MeleeWeaponGURPS | RangedWeaponGURPS
//
// export type ActorGURPS = CharacterGURPS | StaticCharacterGURPS | LootGURPS
//
// export type Prereq =
// 	| PrereqList
// 	| TraitPrereq
// 	| AttributePrereq
// 	| ContainedWeightPrereq
// 	| ContainedQuantityPrereq
// 	| SkillPrereq
// 	| SpellPrereq
// 	| EquippedEquipmentPrereq
//
// // export type Bonus = Feature | ThresholdBonus
// export type Bonus = Feature
//
// export type Feature =
// 	// | BaseFeature
// 	| AttributeBonus
// 	| ConditionalModifierBonus
// 	| DRBonus
// 	| ReactionBonus
// 	| SkillBonus
// 	| SkillPointBonus
// 	| SpellBonus
// 	| SpellPointBonus
// 	| WeaponBonus
// 	| CostReduction
// 	| ContainedWeightReduction
//
// export type featureMap = {
// 	attributeBonuses: AttributeBonus[]
// 	costReductions: CostReduction[]
// 	drBonuses: DRBonus[]
// 	skillBonuses: SkillBonus[]
// 	skillPointBonuses: SkillPointBonus[]
// 	spellBonuses: SpellBonus[]
// 	spellPointBonuses: SpellPointBonus[]
// 	weaponBonuses: WeaponBonus[]
// 	moveBonuses: MoveBonus[]
// 	// thresholdBonuses: ThresholdBonus[]
// }
//
// // export type FeatureConstructor = Partial<Bonus>
//
// export type FeatureObj =
// 	| AttributeBonusObj
// 	| ConditionalModifierBonusObj
// 	| DRBonusObj
// 	| ReactionBonusObj
// 	| SkillBonusObj
// 	| SkillPointBonusObj
// 	| SpellBonusObj
// 	| SpellPointBonusObj
// 	| WeaponBonusObj
// 	| CostReductionObj
// 	| ContainedWeightReductionObj
//
// export type ItemDataGURPS =
// 	| TraitData
// 	| TraitContainerData
// 	| TraitModifierData
// 	| TraitModifierContainerData
// 	| SkillData
// 	| TechniqueData
// 	| SkillContainerData
// 	| SpellData
// 	| RitualMagicSpellData
// 	| SpellContainerData
// 	| EquipmentData
// 	| EquipmentContainerData
// 	| EquipmentModifierData
// 	| EquipmentModifierContainerData
// 	| NoteData
// 	| NoteContainerData
// 	| EffectData
// 	| ConditionData
// 	| MeleeWeaponData
// 	| RangedWeaponData
//
// export type ItemSourceGURPS = ItemDataGURPS["_source"]
//
// export type ContainerDataGURPS =
// 	| TraitData
// 	| TraitContainerData
// 	| TraitModifierContainerData
// 	| SkillContainerData
// 	| SpellContainerData
// 	| EquipmentData
// 	| EquipmentContainerData
// 	| EquipmentModifierContainerData
// 	| NoteData
// 	| NoteContainerData
//
// export type ItemSystemDataGURPS =
// 	| TraitSystemData
// 	| TraitContainerSystemData
// 	| TraitModifierSystemData
// 	| TraitModifierContainerSystemData
// 	| SkillSystemData
// 	| TechniqueSystemData
// 	| SkillContainerSystemData
// 	| SpellSystemData
// 	| RitualMagicSpellSystemData
// 	| SpellContainerSystemData
// 	| EquipmentSystemData
// 	| EquipmentContainerSystemData
// 	| EquipmentModifierSystemData
// 	| EquipmentModifierContainerSystemData
// 	| NoteSystemData
// 	| NoteContainerSystemData
// 	| MeleeWeaponSystemData
// 	| RangedWeaponSystemData
//
// export type ActorDataGURPS = CharacterDataGURPS | StaticCharacterDataGURPS | LootDataGURPS
//
// export type ActorSourceGURPS = ActorDataGURPS["_source"]
