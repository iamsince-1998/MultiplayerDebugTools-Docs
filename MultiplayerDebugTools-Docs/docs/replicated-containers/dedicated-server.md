---
id: dedicated-server
title: Dedicated Server
sidebar_position: 7
---

# Dedicated Server & Build Types

The plugin module type is `Runtime`, compiled and loaded in all build types:

| Build type | Compiled | Loaded |
|---|:---:|:---:|
| UnrealEditor | ✓ | ✓ |
| Game (client) | ✓ | ✓ |
| Game (listen server) | ✓ | ✓ |
| Dedicated Server | ✓ | ✓ |

No `WITH_EDITOR` guards or editor-only code exist — it is purely runtime.

## Dedicated Server Checklist

### 1. The owning Actor must replicate

```cpp
// C++
AMyCharacter::AMyCharacter()
{
    bReplicates = true;
    InventoryMap = CreateDefaultSubobject<UReplicatedMapComponent>(TEXT("InventoryMap"));
}
```

In Blueprint: Details → Replication → **Replicates = checked**.

### 2. The Actor must have a net connection owner for client→server RPCs

Server RPCs (`UFUNCTION(Server, Reliable)`) require the calling client's connection to "own" the Actor. This works automatically for:

- `APawn` possessed by a `APlayerController`
- Any Actor whose `SetOwner()` points to a `APlayerController`

:::warning
If the component is on a `AGameState` or other server-only Actor, client Server RPC calls will be silently dropped. In that case, call write functions **from server-side code** (e.g. in a Game Mode) instead of from the client.
:::

### 3. Replicated Actors must be spawned correctly

Actors must be spawned before `BeginPlay`, or have `SetReplicates(true)` called after. The component assigns its `Owner` pointer in both the constructor and `BeginPlay` to handle both cases.

### 4. Linux dedicated servers are fully supported

Both Linux x64 and ARM64 platform strings are listed in `SupportedTargetPlatforms`. For cross-compilation from Windows, ensure your UE cross-compile toolchain is installed.
