export class FilePickerGURPS extends FilePicker {
	constructor(options: DeepPartial<FilePickerOptions>) {
		super(
			foundry.utils.mergeObject(
				{
					baseApplication: null,
					width: null,
					height: null,
					top: null,
					left: null,
					scale: null,
					popOut: true,
					minimizable: false,
					resizable: false,
					id: "",
					classes: [],
					tabs: [],
					dragDrop: [],
					title: "",
					template: null,
					scrollY: [],
					filters: [],
				},
				options,
			) as FilePickerOptions,
		)
	}
}
