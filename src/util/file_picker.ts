export class FilePickerGURPS extends FilePicker {
	constructor(options: DeepPartial<FilePickerOptions>) {
		// @ts-expect-error probably ok
		super(options)
		// super(
		// 	foundry.utils.mergeObject(
		// 		{
		// 			baseApplication: null,
		// 			width: null,
		// 			height: null,
		// 			top: null,
		// 			left: null,
		// 			scale: null,
		// 			popOut: true,
		// 			minimizable: false,
		// 			resizable: false,
		// 			id: "",
		// 			classes: ["filepicker"],
		// 			tabs: [],
		// 			dragDrop: [],
		// 			title: "",
		// 			template: null,
		// 			scrollY: [],
		// 			filters: [],
		// 		},
		// 		options,
		// 	) as FilePickerOptions,
		// )
	}
}
