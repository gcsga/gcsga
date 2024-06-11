import { ActorGURPS } from "@actor"
import { ItemType } from "@data"
import { ItemGURPS } from "@item"
import { ContainerSource, ItemSourceGURPS, ItemSystemData } from "@item/data/index.ts"
import { itemIsOfType } from "@item/helpers.ts"
import { LocalizeGURPS } from "@util"

abstract class AbstractContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends ItemGURPS<TParent> {


	get allowedItemTypes(): ItemType[] {
		return CONFIG.GURPS.Item.allowedContents[this.type]
	}

	/** Checks if the item can be added to this actor by checking the valid item types. */
	checkItemValidity(source: PreCreate<ItemSourceGURPS>): boolean {
		if (!itemIsOfType(source, ...this.allowedItemTypes)) {
			ui.notifications.error(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.error.cannot_add_type, {
					type: LocalizeGURPS.translations.TYPES.Item[source.type],
				}),
			)

			return false
		}

		return true
	}

async	createContainedDocuments(data: ItemSourceGURPS[]: context?: DocumentModificationContext<TParent>): Promise<ItemGURPS[]> {

	}
}

interface AbstractContainerGURPS<TParent extends ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: ContainerSource
	system: ItemSystemData
}

export { AbstractContainerGURPS }
