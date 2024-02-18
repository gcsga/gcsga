import { ItemSourceGURPS } from "./base/data/index.ts"
import { ItemGURPS } from "./base/document.ts"

type ItemOrSource = PreCreate<ItemSourceGURPS> | ItemGURPS

function itemIsOfType(item: ItemOrSource, ...types: string[]): boolean {
	return types.some(e => item.type === e)
}

export { itemIsOfType }
