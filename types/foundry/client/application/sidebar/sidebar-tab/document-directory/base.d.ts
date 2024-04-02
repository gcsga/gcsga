export {}

declare global {
	/** A shared pattern for the sidebar directory which Actors, Items, and Scenes all use */
	class DocumentDirectory<TDocument extends WorldDocument> extends SidebarTab<SidebarDirectoryOptions> {
		/** References to the set of Documents that are displayed in the Sidebar */
		documents: TDocument[]

		/** Reference the set of Folders which exist in this Sidebar */
		folders: Folder[]

		/** A reference to the named Document type that this Sidebar Directory instance displays */
		static documentName: string

		/** The path to the template partial which renders a single Entry within this directory */
		static entryPartial: string

		/** The path to the template partial which renders a single Folder within this directory */
		static folderPartial: string

		static override get defaultOptions(): SidebarDirectoryOptions

		/** The WorldCollection instance which this Sidebar Directory displays. */
		static get collection(): WorldCollection<WorldDocument>

		/**
		 * The collection of Documents which are displayed in this Sidebar Directory
		 * @type {DocumentCollection}
		 */
		get collection(): DocumentCollection<TDocument>

		/** Initialize the content of the directory by categorizing folders and documents into a hierarchical tree structure. */
		initialize(): void

		/**
		 * Given a Document type and a list of Document instances, set up the Folder tree
		 * @param folders   The Array of Folder objects to organize
		 * @param documents The Array of Document objects to organize
		 * @return A tree structure containing the folders and documents
		 */
		static setupFolders(
			folders: Folder[],
			documents: WorldDocument[],
		): { root: boolean; content: WorldDocument[]; children: Folder[] }

		/**
		 * Populate a single folder with child folders and content
		 * This method is called recursively when building the folder tree
		 */
		protected static _populate(
			folder: Folder,
			folders: Folder[],
			documents: WorldDocument[],
			{ allowChildren }?: { allowChildren?: boolean },
		): [Folder[], WorldDocument[]]

		/**
		 * Sort two Documents by name, alphabetically.
		 * @return A value > 0 if b should be sorted before a.
		 *         A value < 0 if a should be sorted before b.
		 *         0 if the position of a and b should not change.
		 */
		protected static _sortAlphabetical(a: WorldDocument, b: WorldDocument): number

		protected override _render(force?: boolean, context?: SidebarDirectoryRenderOptions): Promise<void>

		protected override _renderInner(data: object): Promise<JQuery>

		protected override _onSearchFilter(event: KeyboardEvent, query: string, rgx: RegExp, html: HTMLElement): void

		protected _onClickEntryName(event: PointerEvent): void

		/** Highlight folders as drop targets when a drag event enters or exits their area */
		protected _onDragHighlight(event: DragEvent): void

		/** Collapse all subfolders in this directory */
		collapseAll(): void

		/* -------------------------------------------- */
		/*  Event Listeners and Handlers                */
		/* -------------------------------------------- */

		/** Activate event listeners triggered within the Actor Directory HTML */
		override activateListeners(html: JQuery): void

		/**
		 * Handle Entry data being dropped into the directory.
		 * @param target The target element
		 * @param data   The data being dropped
		 */
		protected _handleDroppedEntry(target: HTMLElement, data: DropCanvasData): Promise<void>

		/**
		 * Determine if an Entry is being compared to itself
		 * @param {DirectoryMixinEntry} entry          The Entry
		 * @param {DirectoryMixinEntry} otherEntry     The other Entry
		 * @returns {boolean}                          Is the Entry being compared to itself?
		 */
		protected _entryIsSelf(entry: TDocument, otherEntry: TDocument): boolean

		/**
		 * Determine whether an Entry belongs to the target folder
		 * @param {DirectoryMixinEntry} entry   The Entry
		 * @param {Folder} folder               The target folder
		 * @returns {boolean}                   Is the Entry a sibling?
		 */
		protected _entryBelongsToFolder(entry: TDocument, folder: Folder | null): boolean

		/**
		 * Check if an Entry is already present in the Collection
		 * @param {DirectoryMixinEntry} entry     The Entry being dropped
		 * @returns {boolean}                     Is the Entry already present?
		 */
		protected _entryAlreadyExists(entry: TDocument): boolean

		/**
		 * Get the dropped Entry from the drop data
		 * @param {object} data                      The data being dropped
		 * @returns {Promise<DirectoryMixinEntry>}   The dropped Entry
		 */
		protected _getDroppedEntryFromData(data: object): Promise<TDocument>

		/**
		 * Handle Folder data being dropped into the directory.
		 * @param target The target element
		 * @param data   The data being dropped
		 */
		protected _handleDroppedFolder(target: HTMLElement, data: DropCanvasData): Promise<void>

		/**
		 * Create a dropped Entry in this Collection
		 * @param {DirectoryMixinEntry} entry       The Entry being dropped
		 * @param {string} [folderId]               The ID of the Folder to which the Entry should be added
		 * @returns {Promise<DirectoryMixinEntry>}  The created Entry
		 * @protected
		 */
		protected _createDroppedEntry(entry: TDocument, folderId: string): Promise<TDocument>

		/**
		 * Sort a relative entry within a collection
		 * @param {DirectoryMixinEntry} entry   The entry to sort
		 * @param {object} sortData             The sort data
		 * @param {string} sortData.sortKey     The sort key to use for sorting
		 * @param {boolean} sortData.sortBefore Sort before the target?
		 * @param {object} sortData.updateData  Additional data to update on the entry
		 * return {Promise<object>}             The sorted entry
		 */
		protected _sortRelative(
			entry: object,
			sortData: { sortKey: string; sortBefore: boolean; updateData: object },
		): Promise<object>

		/**
		 * Default folder context actions
		 * @param html The context menu HTML being rendered for the directory
		 */
		protected _contextMenu(html: JQuery): void
	}

	interface SidebarDirectoryOptions extends ApplicationOptions {
		/**
		 * A list of data property keys that will trigger a re-render of the tab if they are updated on a Document that
		 * this tab is responsible for.
		 */
		renderUpdateKeys: string[]
		/** The CSS selector that activates the context menu for displayed Documents. */
		contextMenuSelector: string
		/** The CSS selector for the clickable area of an entry in the tab. */
		entryClickSelector: string
	}

	interface SidebarDirectoryRenderOptions extends RenderOptions {
		documentType?: string
		data?: Record<string, unknown>[]
	}
}
