/** Render the Sidebar container, and after rendering insert Sidebar tabs */
declare class Sidebar<
	TChatLog extends ChatLog,
	TCombatTracker extends CombatTracker<Combat, CombatTrackerOptions>,
	TActorDirectory extends ActorDirectory<Actor<null>>,
	TItemDirectory extends ItemDirectory<Item<null>>,
	TJournalDirectory extends JournalDirectory<JournalEntry>,
	TCompendiumDirectory extends CompendiumDirectory,
> extends Application {
	/** Singleton application instances for each sidebar tab */
	tabs: {
		actor: TActorDirectory
		cards: CardsDirectory<Cards>
		chat: TChatLog
		combat: TCombatTracker
		compendium: TCompendiumDirectory
		items: TItemDirectory
		journal: TJournalDirectory
		playlists: PlaylistDirectory<Playlist>
		scenes: SceneDirectory<Scene>
		settings: Settings
		tables: RollTableDirectory
	}

	/** Track whether the sidebar container is currently collapsed */
	_collapsed: boolean

	/**
	 * Return an Array of pop-out sidebar tab Application instances
	 */
	get popouts(): Application[]

	/**
	 * Return the name of the active Sidebar tab
	 */
	get activeTab(): string

	/**
	 * Activate a Sidebar tab by it's name
	 * @param tabName   The tab name corresponding to it's "data-tab" attribute
	 */
	activateTab(tabName: string): void

	/**
	 * Expand the Sidebar container from a collapsed state.
	 * Take no action if the sidebar is already expanded.
	 */
	expand(): void

	/**
	 * Collapse the sidebar to a minimized state.
	 * Take no action if the sidebar is already collapsed.
	 */
	collapse(): void
}
