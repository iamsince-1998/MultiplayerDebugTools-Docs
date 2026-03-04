---
id: api-reference
title: API Reference
sidebar_position: 5
---

# API Reference

## UReplicatedMapComponent

All write functions can be called from **any machine**. On the server they execute immediately.
On a client they are forwarded via a reliable Server RPC.

### Write Functions

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `AddToReplicatedMap` | `Key: FString`, `Value: FString` | `void` | Adds a new entry or overwrites an existing one. Empty keys are silently ignored. |
| `RemoveFromReplicatedMap` | `Key: FString` | `bool` (authority only) | Removes the entry for the given key. Always `false` on client. |
| `ClearReplicatedMap` | — | `void` | Removes all entries. Broadcasts `OnEntryRemoved` for each before clearing. |

### Read Functions

*(BlueprintPure — callable from any machine)*

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `GetReplicatedValue` | `Key: FString`, `OutValue: FString&` | `bool` | Returns `true` and fills `OutValue` if the key exists. |
| `ContainsKey` | `Key: FString` | `bool` | Returns `true` if the key exists. |
| `Num` | — | `int32` | Returns the number of entries. |
| `GetAllKeys` | `OutKeys: TArray<FString>&` | `void` | Fills `OutKeys` with all current keys. |

---

## UReplicatedSetComponent

### Write Functions

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `AddToReplicatedSet` | `Value: FString` | `bool` (authority only) | Adds a value if not already present. Returns `true` if actually added. |
| `RemoveFromReplicatedSet` | `Value: FString` | `bool` (authority only) | Removes a value. Returns `true` if it was present. |
| `ClearReplicatedSet` | — | `void` | Removes all values. Broadcasts `OnValueRemoved` for each. |

### Read Functions

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `ContainsReplicatedValue` | `Value: FString` | `bool` | Returns `true` if the value exists in the set. |
| `Num` | — | `int32` | Returns the number of values. |
| `GetAllValues` | `OutValues: TArray<FString>&` | `void` | Fills `OutValues` with all current values. |

---

## Delegates & Events

### ReplicatedMapComponent

```cpp
FReplicatedMapValueDelegate  OnEntryAdded;     // (Key, Value) — new key added
FReplicatedMapValueDelegate  OnEntryUpdated;   // (Key, Value) — existing key value changed
FReplicatedMapKeyDelegate    OnEntryRemoved;   // (Key)        — key removed
FReplicatedMapSyncedDelegate OnMapReplicated;  // ()           — batch replication complete
```

### ReplicatedSetComponent

```cpp
FReplicatedSetValueDelegate  OnValueAdded;     // (Value) — value added
FReplicatedSetValueDelegate  OnValueRemoved;   // (Value) — value removed
FReplicatedSetSyncedDelegate OnSetReplicated;  // ()      — batch replication complete
```

### Delegate firing order

| Situation | Delegates that fire |
|---|---|
| Authority calls Add | `OnEntryAdded` / `OnValueAdded` immediately on server |
| Authority calls Remove | `OnEntryRemoved` / `OnValueRemoved` immediately on server |
| Client calls Add/Remove | Nothing fires on client immediately; after the RPC executes on server and replication occurs, the client receives the delta and the matching delegate fires |
| Late-joining client receives initial state | `OnEntryAdded` / `OnValueAdded` fires for every item already in the container |
