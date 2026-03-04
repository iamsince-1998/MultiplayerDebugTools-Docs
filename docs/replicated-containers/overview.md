---
id: overview
title: Overview
sidebar_position: 1
---

# Replicated Containers Plugin

Runtime plugin providing **replicated TMap and TSet** components with fast-array delta replication,
server-authority routing, type-safe variant values, and a full Blueprint API.

Compatible with **Unreal Engine 4.27 through 5.x** on all supported platforms.

---

## Table of Contents

1. [Features](#features)
2. [Compatibility](#compatibility)
3. [Installation](#installation)
4. [FReplicatedValue — Type-Safe Variant](#freplicatedvalue--type-safe-variant)
5. [Quick Start — Blueprint](#quick-start--blueprint)
6. [Quick Start — C++](#quick-start--c)
7. [UReplicatedMapComponent — Full API](#ureplicatedmapcomponent--full-api)
8. [UReplicatedSetComponent — Full API](#ureplicatedsetcomponent--full-api)
9. [UReplicatedValueLibrary — Conversion Functions](#ureplicatedvaluelibrary--conversion-functions)
10. [Delegates & Events](#delegates--events)
11. [How It Works](#how-it-works)
12. [Dedicated Server & Build Types](#dedicated-server--build-types)
13. [Platform Notes](#platform-notes)
14. [Rules & Gotchas](#rules--gotchas)
15. [Troubleshooting](#troubleshooting)
16. [Changelog](#changelog)

---

## Features

| Feature | Map | Set |
|---|:---:|:---:|
| Automatic server replication | ✓ | ✓ |
| Delta (per-item) replication via FastArraySerializer | ✓ | ✓ |
| OnRep / delegate callbacks | ✓ | ✓ |
| Client→Server RPC forwarding | ✓ | ✓ |
| Full Blueprint API | ✓ | ✓ |
| Full C++ API | ✓ | ✓ |
| Type-safe variant values (FReplicatedValue) | ✓ | ✓ |
| Automatic Blueprint type casting | ✓ | ✓ |
| Dedicated server builds | ✓ | ✓ |
| All platforms (Win/Linux/Mac/Console/Mobile) | ✓ | ✓ |

---

## Compatibility

### Engine versions

| Engine | Supported |
|---|---|
| UE 4.27 | ✓ |
| UE 5.0 | ✓ |
| UE 5.1 | ✓ |
| UE 5.2 | ✓ |
| UE 5.3 | ✓ |
| UE 5.4 | ✓ |
| UE 5.5+ | ✓ |

The plugin uses `ENGINE_MAJOR_VERSION` / `ENGINE_MINOR_VERSION` guards to select the correct
`RemoveAtSwap` API (`bool` on 4.27–5.0, `EAllowShrinking` enum on 5.1+).

### Build configurations

| Configuration | Supported | Notes |
|---|:---:|---|
| Editor (PIE) | ✓ | Full replication in Play-in-Editor |
| Standalone Game | ✓ | |
| Listen Server | ✓ | Server authority on the hosting player |
| Dedicated Server | ✓ | See [Dedicated Server section](#dedicated-server--build-types) |
| Client | ✓ | Read-only; mutations forwarded to server via RPC |

### Platforms

| Platform | Supported |
|---|---|
| Windows 64-bit | ✓ |
| Windows 32-bit | ✓ (UE 4.27 only; Win32 is removed in UE 5) |
| macOS | ✓ |
| Linux x64 | ✓ |
| Linux ARM64 | ✓ (typical dedicated server hardware) |
| Android | ✓ |
| iOS | ✓ |
| PlayStation 4 | ✓ |
| PlayStation 5 | ✓ |
| Xbox One | ✓ |
| Xbox Series X/S | ✓ |

---

## Installation

### Step 1 — Copy the plugin folder

Copy the `ReplicatedContainers` folder into your project's `Plugins/` directory:

```
YourProject/
  Plugins/
    ReplicatedContainers/        ← put it here
      ReplicatedContainers.uplugin
      Source/
      ...
```

### Step 2 — Regenerate project files

Right-click your `.uproject` file → **Generate Visual Studio project files** (Windows)
or run `GenerateProjectFiles.sh` (Linux/Mac).

### Step 3 — Enable the plugin

Open your project in the Unreal Editor:

1. Go to **Edit → Plugins**
2. Search for **Replicated Containers**
3. Check **Enabled**
4. Restart the editor when prompted

### Step 4 — (C++ projects only) Add to Build.cs

In your game module's `Build.cs`, add the plugin module as a dependency:

```csharp
PublicDependencyModuleNames.AddRange(new string[]
{
    "ReplicatedContainers"
});
```

### Step 5 — Verify the component appears in the editor

Open any Actor Blueprint → **Add Component** → search for
**Replicated Map** or **Replicated Set**. Both should appear under the *Networking* category.

---

## FReplicatedValue — Type-Safe Variant

`FReplicatedValue` is a variant (discriminated union) struct that can hold any common Blueprint
type. It replaces raw `FString` as the key and value type for both the Map and Set components,
giving you type safety without losing Blueprint compatibility.

### Supported types

| Type Enum | C++ Type | Blueprint Pin | Notes |
|---|---|---|---|
| `None` | — | — | Default / invalid |
| `Bool` | `bool` | Boolean | |
| `Byte` | `uint8` | Byte | |
| `Int` | `int32` | Integer | |
| `Int64` | `int64` | Integer64 | |
| `Float` | `double` | Float | Serialized as double precision |
| `String` | `FString` | String | |
| `Name` | `FName` | Name | |
| `Text` | `FText` | Text | Localizable |
| `Vector` | `FVector` | Vector | X,Y,Z |
| `Rotator` | `FRotator` | Rotator | Pitch,Yaw,Roll |
| `Transform` | `FTransform` | Transform | Translation + Rotation (Quat) + Scale |
| `LinearColor` | `FLinearColor` | Linear Color | R,G,B,A (float) |
| `Object` | `UObject*` | Object Reference | Stored as soft object path |
| `Class` | `UClass*` | Class Reference | Stored as soft object path |

### Creating values in C++

```cpp
// Using factory methods
FReplicatedValue Key   = FReplicatedValue::FromString(TEXT("Health"));
FReplicatedValue Value = FReplicatedValue::FromFloat(100.0);

// Other examples
FReplicatedValue Pos   = FReplicatedValue::FromVector(FVector(1.0, 2.0, 3.0));
FReplicatedValue Color = FReplicatedValue::FromLinearColor(FLinearColor::Red);
FReplicatedValue Flag  = FReplicatedValue::FromBool(true);
FReplicatedValue Ref   = FReplicatedValue::FromObject(SomeActor);
```

### Reading values in C++

```cpp
FReplicatedValue Value;
if (InventoryMap->GetReplicatedValue(Key, Value))
{
    double Health = Value.AsFloat();       // Returns 0.0 if type mismatch
    FString Str   = Value.AsString();      // Returns "" if type mismatch
    FVector Pos   = Value.AsVector();      // Returns FVector::ZeroVector if type mismatch
}
```

### Creating values in Blueprint

In Blueprints, `FReplicatedValue` supports **automatic type casting** (BlueprintAutocast).
You can wire a native type pin (String, Integer, Vector, etc.) directly into an
`FReplicatedValue` input pin and the conversion happens automatically.

For example, you can wire a String literal directly into the `Key` pin of
`Add To Replicated Map` — the engine will automatically insert a conversion node.

You can also use the explicit conversion functions under the **Replicated Value** category:

- `Make Replicated Value (from Bool)`
- `Make Replicated Value (from Int)`
- `Make Replicated Value (from String)`
- `Make Replicated Value (from Vector)`
- ... (all 14 types supported)

### Reading values in Blueprint

To extract the native type from a `FReplicatedValue`, use the conversion nodes:

- `To Bool (Replicated Value)`
- `To Int (Replicated Value)`
- `To String (Replicated Value)`
- `To Vector (Replicated Value)`
- ... (all 14 types supported)

Or use the utility nodes:

- `Get Value Type` — returns the `EReplicatedValueType` enum
- `Is Valid` — returns `true` if the value is not `None`
- `To Debug String` — returns a human-readable string representation

### Comparison & hashing

`FReplicatedValue` supports `==`, `!=`, and `GetTypeHash`, so it can be used as:
- A key in `TMap<FReplicatedValue, ...>`
- An element in `TSet<FReplicatedValue>`
- A key in the Replicated Map component itself

Two values are equal if and only if they have the same `ValueType` **and** the same serialized
`Data` payload.

---

## Quick Start — Blueprint

This walkthrough shows how to store and replicate a player's inventory as a typed map
(`String Key → Float Value`).

### Step 1 — Add the component to your Actor Blueprint

1. Open your character or game-state Blueprint (must be a **replicated** Actor).
2. In the **Components** panel, click **+ Add**.
3. Search for `ReplicatedMapComponent` and add it.
4. Rename it `InventoryMap`.

> **Important:** The owning Actor must have **Replicates** checked (Details panel → Replication →
> Replicates = true). The component enables its own replication automatically via
> `SetIsReplicatedByDefault(true)`.

### Step 2 — Add an entry (server authority)

In the **Event Graph** (run this logic on the server, e.g. inside an `Event Begin Play` that is
authority-guarded):

```
[Event BeginPlay]
    └─► [Has Authority?] ─(true)─► [InventoryMap] → [Add To Replicated Map]
                                        Key:   "Sword"      ← auto-cast from String
                                        Value: 1            ← auto-cast from Integer
```

Blueprint nodes available on the component:

- `Add To Replicated Map (Key, Value)` — adds or overwrites a key (accepts any type via auto-cast)
- `Remove From Replicated Map (Key)` — removes a key
- `Clear Replicated Map` — removes all entries

### Step 3 — Read an entry (any machine)

```
[Get Replicated Value]
    Key: "Sword"          ← auto-cast from String
    ─► Out Value (Replicated Value)
    ─► Return Value (bool) — false if key not found
        └─► [To Int (Replicated Value)] ─► Quantity (Integer)
```

Other read nodes:

- `Contains Key (Key)` → bool
- `Num ()` → int32
- `Get All Keys ()` → Array of FReplicatedValue

### Step 4 — React to replication events

Bind to any of the delegates on the component (works on clients **and** server):

| Delegate | Fires when | Parameters |
|---|---|---|
| `On Entry Added` | A new key arrives from the server | `Key: FReplicatedValue`, `Value: FReplicatedValue` |
| `On Entry Updated` | An existing key's value changes | `Key: FReplicatedValue`, `Value: FReplicatedValue` |
| `On Entry Removed` | A key is removed | `Key: FReplicatedValue` |
| `On Map Replicated` | Any replication update finishes (batch signal) | — |

```
[BeginPlay]
    └─► Bind to [InventoryMap] → [On Entry Added]
              └─► Print String: [To Debug String (Key)] + " = " + [To Debug String (Value)]
```

### Step 5 — Client-initiated mutation

Clients can call the same write functions (`Add To Replicated Map`, etc.) from Blueprint.
The component automatically detects it is not the authority and forwards the call to the server
via a **reliable Server RPC**. No extra logic needed in Blueprint.

---

## Quick Start — C++

### Step 1 — Include the headers

```cpp
#include "ReplicatedMapComponent.h"
#include "ReplicatedSetComponent.h"
#include "ReplicatedValue.h"  // For FReplicatedValue factory methods
```

### Step 2 — Declare the component in your Actor header

```cpp
UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Inventory")
TObjectPtr<UReplicatedMapComponent> InventoryMap;

UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Teams")
TObjectPtr<UReplicatedSetComponent> TeamSet;
```

> Use `UActorComponent*` instead of `TObjectPtr` if targeting UE 4.27 (TObjectPtr was added in 5.0).

### Step 3 — Construct the component

```cpp
AMyActor::AMyActor()
{
    InventoryMap = CreateDefaultSubobject<UReplicatedMapComponent>(TEXT("InventoryMap"));
    TeamSet      = CreateDefaultSubobject<UReplicatedSetComponent>(TEXT("TeamSet"));
    bReplicates  = true;  // Actor must replicate
}
```

### Step 4 — Write data (authority only)

```cpp
void AMyActor::GiveItem(const FString& ItemID, int32 Quantity)
{
    if (HasAuthority())
    {
        InventoryMap->AddToReplicatedMap(
            FReplicatedValue::FromString(ItemID),
            FReplicatedValue::FromInt(Quantity)
        );
    }
}

void AMyActor::AddTeamTag(FName Tag)
{
    // Client calls are automatically forwarded via Server RPC
    TeamSet->AddToReplicatedSet(FReplicatedValue::FromName(Tag));
}
```

### Step 5 — Read data (any machine)

```cpp
FReplicatedValue OutValue;
if (InventoryMap->GetReplicatedValue(FReplicatedValue::FromString(TEXT("Sword")), OutValue))
{
    int32 Quantity = OutValue.AsInt();
    UE_LOG(LogTemp, Log, TEXT("Sword count: %d"), Quantity);
}

// Check set membership
if (TeamSet->ContainsReplicatedValue(FReplicatedValue::FromName(TEXT("RedTeam"))))
{
    // Player is on the red team
}
```

### Step 6 — Bind callbacks in C++

```cpp
void AMyActor::BeginPlay()
{
    Super::BeginPlay();

    InventoryMap->OnEntryAdded.AddDynamic(this, &AMyActor::OnItemAdded);
    InventoryMap->OnEntryRemoved.AddDynamic(this, &AMyActor::OnItemRemoved);
    TeamSet->OnValueAdded.AddDynamic(this, &AMyActor::OnTeamTagAdded);
}

void AMyActor::OnItemAdded(const FReplicatedValue& Key, const FReplicatedValue& Value)
{
    UE_LOG(LogTemp, Log, TEXT("Item added: %s = %s"),
        *Key.ToDebugString(), *Value.ToDebugString());
}

void AMyActor::OnItemRemoved(const FReplicatedValue& Key)
{
    UE_LOG(LogTemp, Log, TEXT("Item removed: %s"), *Key.ToDebugString());
}

void AMyActor::OnTeamTagAdded(const FReplicatedValue& Value)
{
    UE_LOG(LogTemp, Log, TEXT("Team tag added: %s"), *Value.ToDebugString());
}
```

---

## UReplicatedMapComponent — Full API

### Write functions

All write functions can be called from **any machine**.
On the server (or listen-server host) they execute immediately.
On a client they are forwarded to the server via a reliable RPC.

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `AddToReplicatedMap` | `Key: FReplicatedValue`, `Value: FReplicatedValue` | `void` | Adds a new entry or overwrites an existing one. Invalid keys (type `None`) are silently ignored. |
| `RemoveFromReplicatedMap` | `Key: FReplicatedValue` | `bool` (authority only; always `false` on client) | Removes the entry for the given key. |
| `ClearReplicatedMap` | — | `void` | Removes all entries. Broadcasts `OnEntryRemoved` for each entry before clearing. |

### Read functions (BlueprintPure, callable anywhere)

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `GetReplicatedValue` | `Key: FReplicatedValue`, `OutValue: FReplicatedValue&` | `bool` | Returns `true` and fills `OutValue` if the key exists. O(1) via cached map. |
| `ContainsKey` | `Key: FReplicatedValue` | `bool` | Returns `true` if the key exists. O(1). |
| `Num` | — | `int32` | Returns the number of entries. |
| `GetAllKeys` | `OutKeys: TArray<FReplicatedValue>&` | `void` | Fills `OutKeys` with all current keys. |

---

## UReplicatedSetComponent — Full API

### Write functions

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `AddToReplicatedSet` | `Value: FReplicatedValue` | `bool` (authority only) | Adds a value if it is not already present. Returns `true` if the value was actually added. |
| `RemoveFromReplicatedSet` | `Value: FReplicatedValue` | `bool` (authority only) | Removes a value. Returns `true` if it was present. |
| `ClearReplicatedSet` | — | `void` | Removes all values. Broadcasts `OnValueRemoved` for each. |

### Read functions

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `ContainsReplicatedValue` | `Value: FReplicatedValue` | `bool` | Returns `true` if the value exists in the set. O(1). |
| `Num` | — | `int32` | Returns the number of values. |
| `GetAllValues` | `OutValues: TArray<FReplicatedValue>&` | `void` | Fills `OutValues` with all current values. |

---

## UReplicatedValueLibrary — Conversion Functions

`UReplicatedValueLibrary` is a `UBlueprintFunctionLibrary` that provides **automatic type
conversion** between native Blueprint types and `FReplicatedValue`. All functions are
`BlueprintPure` with `BlueprintAutocast` metadata, meaning the engine will insert them
automatically when you wire incompatible pin types.

### Utility functions

| Function | Returns | Description |
|---|---|---|
| `Get Value Type` | `EReplicatedValueType` | Returns the type tag of the value |
| `Is Valid` | `bool` | Returns `true` if the value is not `None` |
| `To Debug String` | `FString` | Returns a human-readable string like `Float:100.000000` |

### Native → FReplicatedValue (auto-cast)

These fire automatically when you wire a native pin into an `FReplicatedValue` input:

| Function | Input Type |
|---|---|
| `Conv_BoolToReplicatedValue` | `bool` |
| `Conv_ByteToReplicatedValue` | `uint8` (Byte) |
| `Conv_IntToReplicatedValue` | `int32` (Integer) |
| `Conv_Int64ToReplicatedValue` | `int64` (Integer64) |
| `Conv_FloatToReplicatedValue` | `float` / `double` |
| `Conv_StringToReplicatedValue` | `FString` |
| `Conv_NameToReplicatedValue` | `FName` |
| `Conv_TextToReplicatedValue` | `FText` |
| `Conv_VectorToReplicatedValue` | `FVector` |
| `Conv_RotatorToReplicatedValue` | `FRotator` |
| `Conv_TransformToReplicatedValue` | `FTransform` |
| `Conv_LinearColorToReplicatedValue` | `FLinearColor` |
| `Conv_ObjectToReplicatedValue` | `UObject*` |
| `Conv_ClassToReplicatedValue` | `UClass*` |

### FReplicatedValue → Native (auto-cast)

These fire automatically when you wire an `FReplicatedValue` output into a native pin:

| Function | Output Type | Default on mismatch |
|---|---|---|
| `Conv_ReplicatedValueToBool` | `bool` | `false` |
| `Conv_ReplicatedValueToByte` | `uint8` | `0` |
| `Conv_ReplicatedValueToInt` | `int32` | `0` |
| `Conv_ReplicatedValueToInt64` | `int64` | `0` |
| `Conv_ReplicatedValueToFloat` | `double` | `0.0` |
| `Conv_ReplicatedValueToString` | `FString` | `""` |
| `Conv_ReplicatedValueToName` | `FName` | `NAME_None` |
| `Conv_ReplicatedValueToText` | `FText` | `FText::GetEmpty()` |
| `Conv_ReplicatedValueToVector` | `FVector` | `FVector::ZeroVector` |
| `Conv_ReplicatedValueToRotator` | `FRotator` | `FRotator::ZeroRotator` |
| `Conv_ReplicatedValueToTransform` | `FTransform` | `FTransform::Identity` |
| `Conv_ReplicatedValueToLinearColor` | `FLinearColor` | `FLinearColor::Black` (0,0,0,0) |
| `Conv_ReplicatedValueToObject` | `UObject*` | `nullptr` |
| `Conv_ReplicatedValueToClass` | `UClass*` | `nullptr` |

---

## Delegates & Events

### ReplicatedMapComponent delegates

```cpp
// Fires when a new key is first added (server + clients)
FReplicatedMapValueDelegate OnEntryAdded;      // (const FReplicatedValue& Key, const FReplicatedValue& Value)

// Fires when an existing key's value changes
FReplicatedMapValueDelegate OnEntryUpdated;    // (const FReplicatedValue& Key, const FReplicatedValue& Value)

// Fires when a key is removed
FReplicatedMapKeyDelegate   OnEntryRemoved;    // (const FReplicatedValue& Key)

// Fires once per replication batch (after all per-item callbacks)
FReplicatedMapSyncedDelegate OnMapReplicated;  // ()
```

### ReplicatedSetComponent delegates

```cpp
// Fires when a value is added (server + clients)
FReplicatedSetValueDelegate  OnValueAdded;     // (const FReplicatedValue& Value)

// Fires when a value is removed
FReplicatedSetValueDelegate  OnValueRemoved;   // (const FReplicatedValue& Value)

// Fires once per replication batch
FReplicatedSetSyncedDelegate OnSetReplicated;  // ()
```

### When do delegates fire?

| Situation | Delegates that fire |
|---|---|
| Authority calls Add | `OnEntryAdded` / `OnValueAdded` immediately on server |
| Authority calls Remove | `OnEntryRemoved` / `OnValueRemoved` immediately on server |
| Client calls Add/Remove | Nothing fires on the client immediately; after the RPC executes on the server and replication occurs, the client receives the delta and the matching delegate fires |
| Late-joining client receives initial state | `OnEntryAdded` / `OnValueAdded` fires for every item already in the container |

---

## How It Works

### Architecture overview

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
      ▼                              update CachedMap/CachedSet
 NetDriver sends delta               fire delegate
 (only changed items)
```

### FastArraySerializer (delta replication)

Each component stores its data as a `FFastArraySerializer`-backed `TArray` of items.
When an entry changes, only the **modified items** are serialized and sent over the network —
not the entire container. This is efficient even for large maps with frequent single-entry updates.

The serializer calls three hooks on the client after deserializing:

- `PostReplicatedAdd` — newly arrived items
- `PostReplicatedChange` — items whose values were modified
- `PreReplicatedRemove` — items about to be removed

Each hook updates the in-memory `CachedMap` / `CachedSet` (used for O(1) lookups) and broadcasts
the appropriate delegate.

### Two-tier storage

| Storage | Type | Purpose |
|---|---|---|
| `ReplicatedMap.Items` | `TArray<FReplicatedMapItem>` | Replicated via FastArray; source of truth for the network |
| `CachedMap` | `TMap<FReplicatedValue, FReplicatedValue>` | Local, non-replicated; used for fast `Find` / `Contains` lookups |
| `ReplicatedSet.Items` | `TArray<FReplicatedSetItem>` | Replicated via FastArray; source of truth for the network |
| `CachedSet` | `TSet<FReplicatedValue>` | Local, non-replicated; used for fast `Contains` lookups |

Both are always kept in sync by the internal add/remove/clear helpers.

### FReplicatedValue serialization

`FReplicatedValue` stores all types as a type tag (`EReplicatedValueType`) plus a serialized
`FString` payload. Serialization formats:

| Type | Serialized Format | Example |
|---|---|---|
| Bool | `"true"` / `"false"` | `true` |
| Byte, Int, Int64 | Decimal string | `42` |
| Float | `LexToString(double)` | `3.141593` |
| String, Name | Raw string | `Hello World` |
| Text | `FTextStringHelper` | (UE internal format) |
| Vector | `X,Y,Z` | `100.0,200.0,300.0` |
| Rotator | `P,Y,R` | `0.0,90.0,0.0` |
| Transform | `TX,TY,TZ|QX,QY,QZ,QW|SX,SY,SZ` | `0,0,0|0,0,0,1|1,1,1` |
| LinearColor | `R,G,B,A` | `1.0,0.0,0.0,1.0` |
| Object / Class | `FSoftObjectPath` string | `/Game/BP/MyActor.MyActor_C` |

### Authority routing

Every write function checks `HasAuthority()`:

```
Client calls AddToReplicatedMap(Key, Value)
    └─ HasAuthority() = false
       └─ ServerAddToReplicatedMap_Implementation(Key, Value)  [Server RPC, Reliable]
              └─ AddOrUpdateInternal(Key, Value)  [runs on server]
```

Clients never modify `ReplicatedMap.Items` directly. All mutations are authority-gated.

---

## Dedicated Server & Build Types

The plugin module type is `Runtime`, which means it is compiled and loaded in:

| Build type | Compiled | Loaded |
|---|:---:|:---:|
| UnrealEditor | ✓ | ✓ |
| Game (client) | ✓ | ✓ |
| Game (listen server) | ✓ | ✓ |
| Dedicated Server | ✓ | ✓ |

No `WITH_EDITOR` guards or editor-only code exist in this plugin — it is purely runtime.

### Dedicated server checklist

1. **The owning Actor must replicate.**
   In C++: `bReplicates = true;`
   In Blueprint: Details → Replication → **Replicates = checked**.

2. **The Actor must have a net connection owner for client→server RPCs.**
   Server RPCs (`UFUNCTION(Server, Reliable)`) require the calling client's connection to "own"
   the Actor. This works automatically for:
   - `APawn` possessed by a `APlayerController`
   - Any Actor whose `SetOwner()` points to a `APlayerController`

   If the component is on a `AGameState` or other server-only Actor, the client's Server RPC call
   will be silently dropped. In that case, call the write functions **from the server** (e.g. in
   a server-side Game Mode) instead of from the client.

3. **Replicated Actors must be spawned before `BeginPlay`** (or after, if `SetReplicates(true)`
   is called). The component assigns its `Owner` pointer in both the constructor and `BeginPlay`
   to handle both cases.

4. **Linux dedicated servers** (x64 and ARM64) are fully supported. Both platform strings are
   listed in `SupportedTargetPlatforms`. For cross-compilation from Windows, ensure your UE
   cross-compile toolchain is installed.

---

## Platform Notes

| Platform | Notes |
|---|---|
| **Win64** | Primary development platform. Full support. |
| **Win32** | Supported on UE 4.27 only. UE 5 dropped Win32 entirely. |
| **Linux x64** | Common for dedicated servers. Fully supported. |
| **Linux ARM64** | Used on ARM cloud servers (AWS Graviton, etc.). Fully supported. |
| **macOS** | Fully supported for client and listen-server builds. |
| **Android** | Supported as a client platform. |
| **iOS** | Supported as a client platform. |
| **PS4 / PS5** | Supported. Requires Sony SDK licensing separately. |
| **Xbox One / XSX** | Supported. Requires Microsoft GDK licensing separately. |

The plugin has **no platform-specific code** (no `#if PLATFORM_*` guards) and no
`SupportedTargetPlatforms` restriction in the uplugin. UE treats an absent platform list as
"all platforms", so it compiles and loads on every platform the engine supports without
generating any "Unknown platform" build warnings.

---

## Rules & Gotchas

### 1. Always attach to a replicated Actor

```cpp
// CORRECT
AMyCharacter::AMyCharacter()
{
    bReplicates = true;
    InventoryMap = CreateDefaultSubobject<UReplicatedMapComponent>(TEXT("InventoryMap"));
}

// WRONG — Actor does not replicate, changes never reach clients
AMyStaticActor::AMyStaticActor()
{
    // bReplicates not set
    InventoryMap = CreateDefaultSubobject<UReplicatedMapComponent>(TEXT("InventoryMap"));
}
```

### 2. Server RPCs require net owner for client calls

If you want clients to be able to call write functions, the owning Actor must have a valid net
owner (typically a PlayerController). For game-state-level data driven by the server only,
call the write functions directly from server-side code — no client RPC needed.

### 3. Write functions return values are authority-only

`RemoveFromReplicatedMap` and `AddToReplicatedSet` return a `bool`, but this only reflects the
actual result on the **server**. On a client, the return value is always `false` because the
call is forwarded as an RPC.

### 4. Invalid keys/values are rejected

`AddToReplicatedMap` silently ignores calls where `Key` has type `None` (invalid).
`AddToReplicatedSet` silently ignores calls where `Value` has type `None` (invalid).

### 5. Duplicate adds are no-ops

- Map: adding the same key+value pair that already exists does nothing (no delegate fires).
- Map: adding the same key with a different value fires `OnEntryUpdated`.
- Set: adding a value already present does nothing (returns `false`).

### 6. Key/value type is FReplicatedValue

All keys and values use `FReplicatedValue`, a variant type that supports 15 common Blueprint
types. In Blueprints, automatic type casting means you can wire native types directly into
`FReplicatedValue` pins. In C++, use the static factory methods (`FromString`, `FromInt`, etc.).

### 7. Type safety on read

When reading a value back, the `As*()` methods return a type-appropriate default if the stored
type does not match. For example, calling `AsInt()` on a `String`-typed value returns `0`.
Always check `ValueType` or use `GetValueType()` if the stored type is uncertain.

### 8. OnRep fires after per-item callbacks

On clients, the per-item delegates (`OnEntryAdded`, `OnEntryUpdated`, `OnEntryRemoved`) fire
first (via the FastArray hooks), then `OnMapReplicated` / `OnSetReplicated` fires once to
signal the batch is complete. Do not rely on `OnMapReplicated` to read individual item data —
use the per-item delegates for that.

### 9. Object/Class references use soft paths

`FReplicatedValue::FromObject` and `FromClass` store the asset as a `FSoftObjectPath`. The
object must be a valid, referenceable asset or actor. The `AsObject()` / `AsClass()` getters
resolve the path at read time — if the asset is not loaded, the result may be `nullptr`.

---

## Troubleshooting

### Component does not appear in the Add Component list

- Confirm the plugin is enabled in Edit → Plugins.
- Confirm you regenerated project files after adding the plugin.
- Rebuild the project from Visual Studio / Xcode.

### Changes on the server are not reaching clients

1. Verify `bReplicates = true` on the owning Actor.
2. Verify the Actor is spawned with server authority (i.e. spawned from the server, not
   pre-placed in a level that clients also load without replication).
3. Check that `GetLifetimeReplicatedProps` is being called — if you subclassed the Actor and
   forgot `Super::GetLifetimeReplicatedProps(OutLifetimeProps)`, replication props are lost.

### Client RPC calls do nothing

- Check the Actor has a net owner set to the client's `APlayerController`.
- Use `SetOwner(PlayerController)` on the Actor after spawning it on the server.
- Verify the Actor's **Net Owner** is shown correctly in the editor's replication details.

### `GetAllValues` returns an empty array

Possible causes:
- The set is genuinely empty on this machine.
- The component is on an Actor that does not replicate — the client's cached set never gets
  populated.
- You are reading before `BeginPlay` fires (the `Owner` pointer assignment happens in
  `BeginPlay`).

### Auto-cast not working in Blueprint

If wiring a native type into an `FReplicatedValue` pin does not auto-convert:
- Ensure the plugin is enabled and compiled.
- Try right-clicking the graph and searching for the conversion function manually
  (e.g. `Conv_StringToReplicatedValue`).
- Delete `Intermediate/` and `Saved/` folders, then rebuild.

### Compile error: `EAllowShrinking` not found

This should not happen with the current plugin source.
If you see it, verify you are using the files from this repository (not a cached/intermediate
copy). Delete `Intermediate/` and rebuild.

### Compile error: `NetCore` module not found (UE 4.27)

The `NetCore` module exists in UE 4.27. If the build system cannot find it, verify your engine
installation is complete and not corrupted. You can safely remove `"NetCore"` from `Build.cs`
for UE 4.27 since `FFastArraySerializer` is found via the `Engine` module's include paths.

---

## Changelog

### 2.0.0

- **Breaking:** Replaced `FString` keys/values with `FReplicatedValue` variant type
- Added `FReplicatedValue` struct supporting 15 Blueprint-compatible types (Bool, Byte, Int,
  Int64, Float, String, Name, Text, Vector, Rotator, Transform, LinearColor, Object, Class)
- Added `EReplicatedValueType` enum for runtime type inspection
- Added `UReplicatedValueLibrary` with 28 BlueprintAutocast conversion functions + utility nodes
- Updated `UReplicatedMapComponent` to use `FReplicatedValue` for keys and values
- Updated `UReplicatedSetComponent` to use `FReplicatedValue` for values
- Updated all delegates to pass `FReplicatedValue` parameters
- Automatic Blueprint type casting — wire native types directly into `FReplicatedValue` pins
- Added `ToDebugString()` for human-readable value inspection

### 1.0.0

- Initial release
- `UReplicatedMapComponent` with full CRUD, delta replication, and Blueprint API
- `UReplicatedSetComponent` with add/remove, delta replication, and Blueprint API
- Fixed: `EAllowShrinking::No` version guard for UE 4.27 – 5.0 compatibility
- Fixed: `GetAllValues` now correctly returns all set values via `CachedSet.Array()`
- Added: `SupportedTargetPlatforms` covering all major platforms including dedicated server hosts
- Added: `EngineVersion: 4.27.0` minimum version declaration
