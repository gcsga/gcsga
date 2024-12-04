import { SYSTEM_NAME } from "@module/data/constants.ts"
import api = foundry.applications.api
import { htmlQuery } from "@util"
class ModifierBucket extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
	static override DEFAULT_OPTIONS: Partial<ApplicationConfiguration> & { dragDrop: DragDropConfiguration[] } = {
		tag: "div",
		id: "modifier-bucket",
		classes: ["gurps"],
		window: {
			frame: true,
			contentClasses: [""],
			icon: "",
			title: "",
			controls: [],
			resizable: false,
		},
		position: {
			// width: 800,
			// height: "auto",
			// height: 550,
		},
		actions: {},
		dragDrop: [{ dragSelector: "item-list .item", dropSelector: null }],
	}

	/* -------------------------------------------- */

	static override PARTS = {
		button: {
			id: "button",
			template: `systems/${SYSTEM_NAME}/templates/modifier-bucket/parts/button.hbs`,
		},
		dice: {
			id: "dice",
			template: `systems/${SYSTEM_NAME}/templates/modifier-bucket/parts/dice.hbs`,
		},
		body: {
			id: "body",
			template: `systems/${SYSTEM_NAME}/templates/modifier-bucket/parts/body.hbs`,
		},
	}

	/* -------------------------------------------- */

	protected override _configureRenderOptions(options: ApplicationRenderOptions): void {
		super._configureRenderOptions(options)
		options.parts = ["button"]
	}

	/* -------------------------------------------- */

	protected override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
		return {}
	}

	/* -------------------------------------------- */

	// protected override _renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement> {
	//    console.log(options)
	// }

	/* -------------------------------------------- */

	// protected override _insertElement(element: HTMLElement): HTMLElement {
	// 	const existing = document.getElementById(element.id)
	// 	if (existing) existing.replaceWith(element)
	// 	else {
	// 		const parentEl = document.getElementById("ui-bottom")?.querySelector("div")
	// 		if (parentEl) parentEl.append(element)
	// 	}
	// 	htmlQuery(element, "[autofocus]")?.focus()
	// 	return element
	// }
}

export { ModifierBucket }
