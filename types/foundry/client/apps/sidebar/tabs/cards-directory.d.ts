export {}

declare global {
	/** The sidebar directory which organizes and displays world-level Actor documents. */
	class CardsDirectory<TCards extends Cards> extends DocumentDirectory<TCards> {
		constructor(options: SidebarDirectoryOptions)

		protected override _canDragStart(selector: string): boolean

		protected override _onDragStart(event: DragEvent): void

		protected override _canDragDrop(selector: string): boolean

		protected override _getEntryContextOptions(): EntryContextOption[]
	}
}
