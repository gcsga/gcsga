import { BaseAction, BaseActionSchema } from "./base-action.ts"

class ActionUtility extends BaseAction<ActionUtilitySchema> {
	static override defineSchema(): ActionUtilitySchema {
		return super.defineSchema()
	}
}

interface ActionUtility extends ModelPropsFromSchema<ActionUtilitySchema> {}

type ActionUtilitySchema = BaseActionSchema & {}

export { ActionUtility, type ActionUtilitySchema }
