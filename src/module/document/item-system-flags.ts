import { ItemGURPS2 } from "./item.ts"
import { DocumentSystemFlags } from "./system-flags.ts"

class ItemSystemFlags extends DocumentSystemFlags<ItemGURPS2, ItemSystemFlagsSchema> {
	static override defineSchema(): ItemSystemFlagsSchema {
		return {}
	}
}

interface ItemSystemFlags extends ModelPropsFromSchema<ItemSystemFlagsSchema> {}

type ItemSystemFlagsSchema = {}

export { ItemSystemFlags, type ItemSystemFlagsSchema }
