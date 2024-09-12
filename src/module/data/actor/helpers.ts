import { ActorGURPS2 } from "@module/document/actor.ts"
import { ActorType } from "../constants.ts"
import { ActorDataInstances } from "./types.ts"

type ActorInst<T extends ActorType> = ActorGURPS2 & { system: ActorDataInstances[T] }

export type { ActorInst }
