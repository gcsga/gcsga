import type { SearchResult } from "minisearch"
import { SortDirection } from "../data.ts"

interface MultiselectData<T extends string = string> {
	label: string
	// conjunction: "and" | "or"
	options: { label: string; value: T }[]
	selected: { label: string; not?: boolean; value: T }[]
}

interface OrderData {
	by: string
	direction: SortDirection
	options: Record<string, string>
}

interface BaseFilterData {
	order: OrderData
	search: {
		text: string
	}
	multiselects: {
		tags: MultiselectData<string>
	}
}

type TraitFilters = BaseFilterData
type SkillFilters = BaseFilterData
type SpellFilters = BaseFilterData
type EquipmentFilters = BaseFilterData
type NoteFilters = BaseFilterData
type EffectFilters = BaseFilterData

type BrowserFilter = TraitFilters | SkillFilters | SpellFilters | EquipmentFilters | NoteFilters | EffectFilters

type CompendiumBrowserIndexData = Omit<CompendiumIndexData, "_id"> & Partial<SearchResult>

export type {
	BrowserFilter,
	CompendiumBrowserIndexData,
	EffectFilters,
	EquipmentFilters,
	NoteFilters,
	SkillFilters,
	SpellFilters,
	MultiselectData,
	TraitFilters,
}
