import { CompendiumPack } from "./lib/compendium-pack.ts"

// CompendiumPack.loadJSON("packs/basic-set-traits")
const maneuvers = [CompendiumPack.loadJSON("packs/maneuvers").finalizeAll()].flat()
console.log(JSON.stringify(maneuvers))
