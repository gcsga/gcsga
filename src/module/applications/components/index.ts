import { FeatureListElement } from "./feature-list.ts"
import { HitLocationTableElement } from "./hit-location-table.ts"
import { InventoryElement } from "./inventory.ts"

enum ELEMENTS {
	INVENTORY = "gurps-inventory",
	FEATURELIST = "gurps-feature-list",
	HITLOCATIONTABLE = "hit-location-table",
}

window.customElements.define(ELEMENTS.INVENTORY, InventoryElement)
window.customElements.define(ELEMENTS.FEATURELIST, FeatureListElement)
window.customElements.define(ELEMENTS.HITLOCATIONTABLE, HitLocationTableElement)

export { InventoryElement, FeatureListElement, ELEMENTS }
