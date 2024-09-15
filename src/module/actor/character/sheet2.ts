// import { ActorGURPS } from "@actor/base/document.ts"
// import { SYSTEM_NAME } from "@module/data/constants.ts"
//
// const { api, sheets } = foundry.applications
//
// class CharacterSheetGURPSv2 extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2<ActorGURPS>) {
// 	static PARTS = {
// 		header: {
// 			template: `systems/${SYSTEM_NAME}/templates/actor/header.hbs`,
// 		},
// 	}
//
// 	static DEFAULT_OPTIONS: DeepPartial<DocumentSheetConfiguration> = {
// 		window: { resizable: true },
// 	}
//
// 	protected override _configureRenderOptions(options: DocumentSheetRenderOptions): void {
// 		console.log(options)
// 		super._configureRenderOptions(options)
// 	}
//
// 	protected override async _prepareContext(options: DocumentSheetRenderOptions): Promise<ApplicationRenderContext> {
// 		const context = await super._prepareContext(options)
// 		return {
// 			...context,
// 			actor: this.actor,
// 			system: this.actor.system,
// 		}
// 	}
//
// 	protected override _attachPartListeners(
// 		partId: string,
// 		htmlElement: HTMLElement,
// 		options: DocumentSheetRenderOptions & HandlebarsRenderOptions,
// 	): void {
// 		super._attachPartListeners(partId, htmlElement, options)
//
// 		const test = htmlElement.querySelector("#test") as HTMLElement
// 		console.log(htmlElement, partId)
// 		console.log(test)
// 		if (test) {
// 			ContextMenu.create(this, test, "*", [
// 				{
// 					name: "no group test",
// 					icon: "",
// 					classes: "",
// 					group: "",
// 					callback: () => {},
// 				},
// 				{
// 					name: "group test 1",
// 					group: "test",
// 					icon: "",
// 					classes: "",
// 					callback: () => {},
// 				},
// 				{
// 					name: "group test 2",
// 					group: "test",
// 					icon: "",
// 					classes: "",
// 					callback: () => {},
// 				},
// 			])
// 		} else {
// 			console.error("big fart")
// 		}
// 	}
//
// 	// protected override _attachFrameListeners() {
// 	// 	const test = this.element.querySelector("#test") as HTMLElement
// 	// 	console.log(this.element)
// 	// 	console.log(test)
// 	// 	if (test) {
// 	// 		ContextMenu.create(this, test, "*", [
// 	// 			{
// 	// 				name: "no group test",
// 	// 				icon: "",
// 	// 				classes: "",
// 	// 				group: "",
// 	// 				callback: () => {},
// 	// 			},
// 	// 			{
// 	// 				name: "group test 1",
// 	// 				group: "test",
// 	// 				icon: "",
// 	// 				classes: "",
// 	// 				callback: () => {},
// 	// 			},
// 	// 			{
// 	// 				name: "group test 2",
// 	// 				group: "test",
// 	// 				icon: "",
// 	// 				classes: "",
// 	// 				callback: () => {},
// 	// 			},
// 	// 		])
// 	// 	} else {
// 	// 		console.error("big fart")
// 	// 	}
// 	//
// 	// 	super._attachFrameListeners()
// 	// }
// }
//
// interface CharacterSheetGURPSv2
// 	extends HandlebarsApplicationDocumentSheet<ActorGURPS>,
// 		Omit<foundry.applications.sheets.ActorSheetV2<ActorGURPS>, "_renderHTML"> {}
//
// export { CharacterSheetGURPSv2 }
