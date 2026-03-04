---
id: quickstart-blueprint
title: Quick Start — Blueprint
sidebar_position: 3
---

# Quick Start — Blueprint

This walkthrough shows how to store and replicate a player's inventory as a string map (`ItemID → Quantity`).

## Step 1 — Add the component to your Actor Blueprint

1. Open your character or game-state Blueprint (must be a **replicated** Actor).
2. In the **Components** panel, click **+ Add**.
3. Search for `ReplicatedMapComponent` and add it.
4. Rename it `InventoryMap`.

:::important
The owning Actor must have **Replicates** checked (Details panel → Replication → Replicates = true).
The component enables its own replication automatically via `SetIsReplicatedByDefault(true)`.
:::

## Step 2 — Add an entry (server authority)

In the **Event Graph** (run this on the server, e.g. inside an `Event Begin Play` that is authority-guarded):

```
[Event BeginPlay]
    └─► [Has Authority?] ─(true)─► [InventoryMap] → [Add To Replicated Map]
                                        Key:   "Sword"
                                        Value: "1"
```

Blueprint write nodes available:

- `Add To Replicated Map (Key, Value)` — adds or overwrites a key
- `Remove From Replicated Map (Key)` — removes a key
- `Clear Replicated Map` — removes all entries

## Step 3 — Read an entry (any machine)

```
[Get Replicated Value]
    Key: "Sword"
    ─► Out Value (String)
    ─► Return Value (bool) — false if key not found
```

Other read nodes:

- `Contains Key (Key)` → bool
- `Num ()` → int32
- `Get All Keys ()` → Array of String

## Step 4 — React to replication events

Bind to any of the delegates on the component (works on clients **and** server):

| Delegate | Fires when |
|---|---|
| `On Entry Added` | A new key arrives from the server |
| `On Entry Updated` | An existing key's value changes |
| `On Entry Removed` | A key is removed |
| `On Map Replicated` | Any replication update finishes (batch signal) |

```
[BeginPlay]
    └─► Bind to [InventoryMap] → [On Entry Added]
              └─► Print String: "Added: " + Key + " = " + Value
```

## Step 5 — Client-initiated mutation

Clients can call the same write functions (`Add To Replicated Map`, etc.) from Blueprint.
The component automatically detects it is not the authority and forwards the call to the server
via a **reliable Server RPC**. No extra logic needed in Blueprint.
