import { BaseItemSourceGURPS, ItemSystemData, ItemSystemSource } from "@item/base/data.ts"
import { ItemType } from "@module/data/constants.ts"

type LegacyItemSource = BaseItemSourceGURPS<ItemType.LegacyItem, LegacyItemSystemSource>

interface LegacyItemSystemSource extends ItemSystemSource {}

interface LegacyItemSystemData extends LegacyItemSystemSource, ItemSystemData {}

export type { LegacyItemSource, LegacyItemSystemData }
