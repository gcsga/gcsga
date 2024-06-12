import { BaseItemSourceGURPS, ItemSystemData, ItemSystemSource } from "@item/base/data.ts"
import { ContainerType } from "@module/data/constants.ts"

type AbstractContainerSource<
	TType extends ContainerType,
	TSystemSource extends AbstractContainerSystemSource = AbstractContainerSystemSource,
> = BaseItemSourceGURPS<TType, TSystemSource>

interface AbstractContainerSystemSource extends ItemSystemSource {}

interface AbstractContainerSystemData extends AbstractContainerSystemSource, ItemSystemData {}

export type { AbstractContainerSource, AbstractContainerSystemSource, AbstractContainerSystemData }
