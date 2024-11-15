import { FeatureListElement } from "./feature-list.ts"
import { InventoryElement } from "./inventory.ts"

enum ELEMENTS {
	INVENTORY = "gurps-inventory",
	FEATURELISt = "gurps-feature-list",
}

window.customElements.define("gurps-inventory", InventoryElement)
window.customElements.define("gurps-feature-list", FeatureListElement)

export { InventoryElement, FeatureListElement, ELEMENTS }
