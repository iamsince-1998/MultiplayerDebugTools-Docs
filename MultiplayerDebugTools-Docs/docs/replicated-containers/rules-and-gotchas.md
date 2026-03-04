---
id: rules-and-gotchas
title: Rules & Gotchas
sidebar_position: 8
---

# Rules & Gotchas

## 1. Always attach to a replicated Actor

```cpp
// ✅ CORRECT
AMyCharacter::AMyCharacter()
{
    bReplicates = true;
    InventoryMap = CreateDefaultSubobject<UReplicatedMapComponent>(TEXT("InventoryMap"));
}

// ❌ WRONG — Actor does not replicate, changes never reach clients
AMyStaticActor::AMyStaticActor()
{
    // bReplicates not set
    InventoryMap = CreateDefaultSubobject<UReplicatedMapComponent>(TEXT("InventoryMap"));
}
```

## 2. Server RPCs require net owner for client calls

If you want clients to call write functions, the owning Actor must have a valid net owner (typically a `PlayerController`). For game-state-level data driven by the server only, call write functions directly from server-side code — no client RPC needed.

## 3. Write function return values are authority-only

`RemoveFromReplicatedMap` and `AddToReplicatedSet` return a `bool`, but this only reflects the actual result on the **server**. On a client the return value is always `false` because the call is forwarded as an RPC.

## 4. Empty keys/values are rejected

- `AddToReplicatedMap` silently ignores calls where `Key` is an empty string.
- `AddToReplicatedSet` silently ignores calls where `Value` is an empty string.

## 5. Duplicate adds are no-ops

- **Map:** adding the same key+value pair that already exists does nothing (no delegate fires).
- **Map:** adding the same key with a *different* value fires `OnEntryUpdated`.
- **Set:** adding a value already present does nothing (returns `false`).

## 6. Key/value type is FString

All Blueprint-facing keys and values are `FString`. To store numeric or struct data, serialize to/from string in your game code. This keeps the plugin cross-version compatible and Blueprint-friendly without templating issues across UE versions.

## 7. OnRep fires after per-item callbacks

On clients, the per-item delegates (`OnEntryAdded`, `OnEntryUpdated`, `OnEntryRemoved`) fire first (via FastArray hooks), then `OnMapReplicated` / `OnSetReplicated` fires once to signal the batch is complete. Do not rely on `OnMapReplicated` to read individual item data — use the per-item delegates for that.
