import { StatType } from "../constants.ts"
import { AttributeDef, AttributeGURPS, MoveType, MoveTypeDef, ResourceTracker, ResourceTrackerDef } from "./index.ts"

export type Stat = AttributeGURPS | ResourceTracker | MoveType

export type StatDefinition = AttributeDef | ResourceTrackerDef | MoveTypeDef

export type StatClass = typeof AttributeGURPS | typeof ResourceTracker | typeof MoveType

export const StatClasses: Readonly<Record<StatType, StatClass>> = Object.freeze({
	[StatType.Attribute]: AttributeGURPS,
	[StatType.ResourceTracker]: ResourceTracker,
	[StatType.MoveType]: MoveType,
})
