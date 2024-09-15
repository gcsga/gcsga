export {}

declare global {
	/** The sidebar directory which organizes and displays world-level Actor documents. */
	class SceneDirectory<TScene extends Scene> extends DocumentDirectory<TScene> {
		constructor(options: SidebarDirectoryOptions)

		protected override _canDragStart(selector: string): boolean

		protected override _onDragStart(event: DragEvent): void

		protected override _canDragDrop(selector: string): boolean

		protected override _getEntryContextOptions(): EntryContextOption[]
	}
}
