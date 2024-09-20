import { ActorGURPS2 } from "@module/document/actor.ts"

const { api, sheets } = foundry.applications
class ActorSheetGURPS extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2<ActorGURPS2>) {}

export { ActorSheetGURPS }
