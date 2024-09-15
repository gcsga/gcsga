// import { ItemSheetDataGURPS, ItemSheetGURPS } from "@item/base/sheet.ts"
// import { AbstractEffectGURPS } from "./document.ts"
// import { htmlQuery, htmlQueryAll } from "@util"
//
// class AbstractEffectSheetGURPS<TItem extends AbstractEffectGURPS> extends ItemSheetGURPS<TItem> {
// 	override activateListeners($html: JQuery<HTMLElement>): void {
// 		super.activateListeners($html)
// 		const html = $html[0]
//
// 		htmlQuery(html, "a[data-action=add-roll-modifier]")?.addEventListener("click", async event => {
// 			await this._onSubmit(event) // Submit any unsaved changes
//
// 			const rollModifiers = this.item.system.modifiers ?? []
// 			rollModifiers.push({
// 				id: "",
// 				modifier: 0,
// 				max: 0,
// 				cost: { id: "", value: 0 },
// 				reference: "",
// 			})
// 			return this._updateObject(event, { ["system.modifiers"]: rollModifiers })
// 		})
//
// 		for (const button of htmlQueryAll(html, "a[data-action=remove-roll-modifier]")) {
// 			button.addEventListener("click", async event => {
// 				await this._onSubmit(event) // Submit any unsaved changes
//
// 				const index = parseInt(button.dataset.index ?? "")
// 				if (isNaN(index)) return console.error("No valid index provided for:", button)
//
// 				const rollModifiers = this.item.system.modifiers ?? []
// 				rollModifiers.splice(index, 1)
// 				return this._updateObject(event, { ["system.modifiers"]: rollModifiers })
// 			})
// 		}
// 	}
// }
//
// interface AbstractEffectSheetData<TItem extends AbstractEffectGURPS> extends ItemSheetDataGURPS<TItem> {}
//
// export { AbstractEffectSheetGURPS }
// export type { AbstractEffectSheetData }
