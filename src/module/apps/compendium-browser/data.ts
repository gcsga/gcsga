import * as browserTabs from "./tabs/index.ts"

interface PackInfo {
	load: boolean
	name: string
	package: string
}

interface SourceInfo {
	load: boolean
	name: string
}

interface BrowserTabs {
	[TabName.Trait]: browserTabs.Trait
	[TabName.TraitModifier]: browserTabs.TraitModifier
	[TabName.Trait]: browserTabs.Trait
	[TabName.TraitModifier]: browserTabs.TraitModifier
	[TabName.Skill]: browserTabs.Skill
	[TabName.Spell]: browserTabs.Spell
	[TabName.Equipment]: browserTabs.Equipment
	[TabName.EquipmentModifier]: browserTabs.EquipmentModifier
	[TabName.Note]: browserTabs.Note
	[TabName.Effect]: browserTabs.Effect
}

export enum TabName {
	Trait = "trait",
	TraitModifier = "modifier",
	Skill = "skill",
	Spell = "spell",
	Equipment = "equipment",
	EquipmentModifier = "eqp_modifier",
	Note = "note",
	Effect = "effect",
	Settings = "settings",
}

// type TabName = "action" | "bestiary" | "campaignFeature" | "equipment" | "feat" | "hazard" | "spell" | "settings";
type ContentTabName = Exclude<TabName, TabName.Settings>
type BrowserTab = InstanceType<(typeof browserTabs)[keyof typeof browserTabs]>
type TabData<T> = Record<TabName, T | null>

type CommonSortByOption = "name" | "level"
type SortByOption = CommonSortByOption | "price"
type SortDirection = "asc" | "desc"

export type {
	BrowserTab,
	BrowserTabs,
	CommonSortByOption,
	ContentTabName,
	PackInfo,
	SortByOption,
	SortDirection,
	SourceInfo,
	TabData,
}
