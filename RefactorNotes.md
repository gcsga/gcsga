# Refactor Notes

## Current Tasks

## Left To Do

- Weapon Fields
- Chat Messages \*5
  - Re-do roll message templates and damage message handling
  - Move @module/util/chat.ts functionality to Chat Message
- Settings \*1
  - Re-do menus \*1
    - Colors \*DONE
    - Attributes \*DONE
    - Attribute Effects \*1
    - Resource Trackers \*DONE
    - Move Types \*DONE
    - Sheet Settings \*DONE
    - Hit Locations: \*DONE
  - Re-add old settings \*2
- CellData
  - Condition
- Item \*3
  - Add field label values for all fields
- Actor
  - Legacy Support?
- Item Sheet \*CURRENT
  - Header color dependent on item type page color in GURPS Basic Set
  - Prereqs \* DONE
  - Features \* DONE
  - Defaults \* DONE
  - Equipment \* DONE
  - Equipment Container \* DONE
  - Trait \*DONE
  - Trait Container \* DONE
  - Skill \*DONE
  - Skill Container \* DONE
  - Spell \*DONE
  - Spell Container \* DONE
  - RPM Spell \* DONE
  - Technique \* DONE
  - Note
  - Note Container
  - Effect
  - Melee Weapon
  - Ranged Weapon
  - Replacements Tab
- Actor Sheet \*2
  - Collapsible sidebar
    - Option to hide atributes if not frequently used to decrease clutter?
    - Pinned items
  - DND5e context menu
  - Traits Tab
    - Add fields for species, cultural familiarity, language, separate to own tables
- Token
- Token Document
- Combat
- Combatant
- Active Effect
- Modifier Bucket
  - Implement Fuzzy Search
  - Data Models
- Conditions (from compendium ?) showing in token status
- Quench tests

## Done

- Roll Handlers
  - Fix old functions
- Change #clean for #cleanData \* DONE
- Change Schema Fields to Embedded Data Fields where appropriate \*0 _MOST IMPORTANT_ DONE?

## Current Task Notes

- AttributeDifficultyField to allow dynamically assigning attribute options (such as "blank" between skill and technique)
- Save last added prereq/feature as in GCS
- Replacements tab on item sheet
- Toggle for showing replacements instead of placeholders (optional)
- In non-edit mode, show replacements instead of substitutions maybe with indicating color background
