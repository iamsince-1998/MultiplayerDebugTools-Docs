---
id: how-it-works
title: How It Works
sidebar_position: 6
---

# How It Works

## Architecture Overview

```
Server (authority)               Clients
─────────────────                ──────────────────────────────
 Write function called
      │
      ▼
 AddOrUpdateInternal()          ← receives replication delta
      │                              │
      ├─ modifies Items[]            ▼
      ├─ MarkItemDirty()        FastArrayDeltaDeserialize
      ├─ updates CachedMap           │
      └─ fires OnEntryAdded         ├─ PostReplicatedAdd  → HandleReplicatedAdd
                                    ├─ PostReplicatedChange → HandleReplicatedChange
 ForceNetUpdate()                   └─ PreReplicatedRemove → HandleReplicatedRemove
      │                                     │
      ▼                              update CachedMap
 NetDriver sends delta               fire delegate
 (only changed items)
```

## FastArraySerializer (Delta Replication)

Each component stores its data as a `FFastArraySerializer`-backed `TArray` of items.
When an entry changes, only the **modified items** are serialized and sent over the network —
not the entire container. This is efficient even for large maps with frequent single-entry updates.

The serializer calls three hooks on the client after deserializing:

- `PostReplicatedAdd` — newly arrived items
- `PostReplicatedChange` — items whose values were modified
- `PreReplicatedRemove` — items about to be removed

Each hook updates the in-memory `CachedMap` / `CachedSet` and broadcasts the appropriate delegate.

## Two-Tier Storage

| Storage | Type | Purpose |
|---|---|---|
| `ReplicatedMap.Items` | `TArray<FReplicatedMapItem>` | Replicated via FastArray; source of truth for the network |
| `CachedMap` | `TMap<FString, FString>` | Local, non-replicated; used for fast O(1) `Find` / `Contains` lookups |

Both are always kept in sync by the internal add/remove/clear helpers.

## Authority Routing

Every write function checks `HasAuthority()`:

```
Client calls AddToReplicatedMap("X", "1")
    └─ HasAuthority() = false
       └─ ServerAddToReplicatedMap_Implementation("X", "1")  [Server RPC, Reliable]
              └─ AddOrUpdateInternal("X", "1")  [runs on server]
```

Clients never modify `ReplicatedMap.Items` directly. All mutations are authority-gated.
