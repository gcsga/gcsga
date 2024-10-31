import { InventoryElement } from "./inventory.ts"

enum ELEMENTS {
	INVENTORY = "gurps-inventory",
}

window.customElements.define("gurps-inventory", InventoryElement)

export { InventoryElement, ELEMENTS }
