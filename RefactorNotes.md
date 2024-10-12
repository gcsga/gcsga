# Refactor Notes

## Current Tasks

- Add embeds tab functionality for easier testing.
- Fix all functions which call document children where the result may be a Promise
- Add #fillWithNameableKeys for all items with nameable functionality
  - equipment
  - trait modifier
  - skill
  - equipment modifier
  - spell
  - trait
  - melee weaopn
  - ranged weapon
  -
  - prereqs
  - contained weight
  - attribute
  - contained quantity
  - prereq list
  - skill prereq
  - spell prereq
  - trait prereq
  -
  -
  - features
  - dr bonus
  - att bonuscond mod
  - contained weight reduciton
  - cost reduction
  - reaction bonus
  - skil bonus
  - skill point bonus
  - spell bonus
  - spell point bonus
  - weapon bonus
  -
  - skill default

## Left To Do

- Weapon Fields
- Chat Messages \*5
  - Re-do roll message templates and damage message handling
  - Move @module/util/chat.ts functionality to Chat Message
- Settings \*1
  - Re-do menus \*1
    - Attribute Effects \*1
  - Re-add old settings \*2
- Item \*3
  - Add field label values for all fields \* DONE
- Actor
  - Legacy Support?
- Item Sheet \* CURRENT
  - Replacements Tab
    - Toggle for showing replacements instead of placeholders (optional)
    - In non-edit mode, show replacements instead of substitutions maybe with indicating color background
  - Embeds Tab
- Effect Sheet \* CURRENT
  - Effect \* DONE
  - Roll Modifiers \* DONE
  - Description \* CURRENT
- Actor Sheet \*2
  - Collapsible sidebar
    - Option to hide attributes if not frequently used to decrease clutter?
    - Pinned items
  - DND5e context menu
  - Traits Tab.
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
- Change #clean for #cleanData
- Change Schema Fields to Embedded Data Fields where appropriate
- Item Sheet
  - Header color dependent on item type page color in GURPS Basic Set
  - Prereqs
  - Features
  - Defaults
  - Equipment
  - Equipment Container
  - Trait
  - Trait Container
  - Skill
  - Skill Container
  - Spell
  - Spell Container
  - RPM Spell
  - Technique
  - Note
  - Note Container
  - Melee Weapon
  - Ranged Weapon
- Settings
  - Re-do menus
    - Colors
    - Attributes
    - Resource Trackers
    - Move Types
    - Sheet Settings
    - Hit Locations:

## Notes

- Save last added prereq/feature as in GCS
