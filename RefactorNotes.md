# Refactor Notes

## Left To Do

- Weapon Fields
  - Change #clean for #cleanData \* DONE
- Change Schema Fields to Embedded Data Fields where appropriate \*0 _MOST IMPORTANT_ DONE?
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
- Item Sheet \*4
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

## Current Task Notes

- Could consider moving attribute array to its own datamodel extending an arrayfield
- use a function to grab the initial attribute setting values, and anothet to set them. that way, you can extend the class abd override the functions for characters
- need to move namespaces
