# Refactor Notes

## Current Tasks

- Replace toggleable fields as appropriate for all items, features, Prereqs
  - Trait
  - trait container
  - skill
  - technique
  - skill container
  - trait mod
  - trait mod container
  - Spell
  - rpm Spell
  - spell container
  - Equipment
  - equipment container
  - eqp mod
  - eqp mod container
  - note
  - note container
  - melee Weapon
  - ranged weapon
  - features (to expand)
  - prereqs (to expand)
- Restyle input fields and toggleable input fields
- Implement some input fields being disabled when sheet is not in edit mode
  - exclude points, quantity, enabled/disabled, equipped/unequipped
- show replacement values when not in edit mode, use different background color to indicate, and tooltip to show original text

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
