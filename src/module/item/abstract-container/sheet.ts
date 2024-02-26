import { ItemSheetDataGURPS, ItemSheetGURPS } from "@item/base/sheet.ts"
import { AbstractContainerGURPS } from "./document.ts"

class AbstractContainerSheetGURPS<TItem extends AbstractContainerGURPS> extends ItemSheetGURPS<TItem> {}

interface AbstractContainerSheetData<TItem extends AbstractContainerGURPS> extends ItemSheetDataGURPS<TItem> {}

export { AbstractContainerSheetGURPS }
export type { AbstractContainerSheetData }
