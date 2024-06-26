import { ItemSystemModel, ItemSystemSchema } from "@item/base/schema.ts"
import { AbstractContainerGURPS } from "./document.ts"
import { ContainerType } from "@module/data/constants.ts"
import { BaseItemSourceGURPS, ItemSystemSource } from "@item/base/data.ts"

abstract class AbstractContainerSystemData<
	TParent extends AbstractContainerGURPS,
	TSchema extends AbstractContainerSystemSchema,
> extends ItemSystemModel<TParent, TSchema> { }

interface AbstractContainerSystemData<
	TParent extends AbstractContainerGURPS,
	TSchema extends AbstractContainerSystemSchema,
> extends ItemSystemModel<TParent, TSchema> { }

type AbstractContainerSystemSchema = ItemSystemSchema & {}

type AbstractContainerSource<
	TType extends ContainerType,
	TSystemSource extends AbstractContainerSystemSource = AbstractContainerSystemSource,
> = BaseItemSourceGURPS<TType, TSystemSource>

interface AbstractContainerSystemSource extends ItemSystemSource { }

export { AbstractContainerSystemData }
export type { AbstractContainerSource, AbstractContainerSystemSchema }
