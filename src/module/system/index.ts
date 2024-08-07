import { AttributeDef } from "./attribute/definition.ts"
import { MoveTypeDef } from "./move-type/definition.ts"
import { ResourceTrackerDef } from "./resource-tracker/definition.ts"

export * from "./abstract-attribute/index.ts"
export * from "./attribute/index.ts"
export * from "./conditional-modifier.ts"
export * from "./feature/index.ts"
export * from "./hit-location/index.ts"
export * from "./mook/index.ts"
export * from "./move-type/index.ts"
export * from "./prereq/index.ts"
export * from "./resource-tracker/index.ts"
export * from "./skill-default/index.ts"
export * from "./study.ts"
export * from "./template-picker/document.ts"
export * from "./sheet-settings.ts"

export const AttributeDefClasses = {
	attribute: AttributeDef,
	resource_tracker: ResourceTrackerDef,
	move_type: MoveTypeDef,
}
