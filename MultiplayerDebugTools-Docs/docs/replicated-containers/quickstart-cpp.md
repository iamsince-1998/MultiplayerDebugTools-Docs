---
id: quickstart-cpp
title: Quick Start — C++
sidebar_position: 4
---

# Quick Start — C++

## Step 1 — Include the headers

```cpp
#include "ReplicatedMapComponent.h"
#include "ReplicatedSetComponent.h"
```

## Step 2 — Declare the component in your Actor header

```cpp
UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Inventory")
TObjectPtr<UReplicatedMapComponent> InventoryMap;

UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Teams")
TObjectPtr<UReplicatedSetComponent> TeamSet;
```

:::note
Use `UActorComponent*` instead of `TObjectPtr` if targeting UE 4.27 — `TObjectPtr` was added in UE 5.0.
:::

## Step 3 — Construct the component

```cpp
AMyActor::AMyActor()
{
    InventoryMap = CreateDefaultSubobject<UReplicatedMapComponent>(TEXT("InventoryMap"));
    TeamSet      = CreateDefaultSubobject<UReplicatedSetComponent>(TEXT("TeamSet"));
    bReplicates  = true;  // Actor must replicate
}
```

## Step 4 — Write data (authority only)

```cpp
void AMyActor::GiveItem(const FString& ItemID, int32 Quantity)
{
    if (HasAuthority())
    {
        InventoryMap->AddToReplicatedMap(ItemID, FString::FromInt(Quantity));
    }
}
```

Clients can also call `AddToReplicatedMap` directly — the component routes it to the server automatically.

## Step 5 — Read data (any machine)

```cpp
FString Qty;
if (InventoryMap->GetReplicatedValue(TEXT("Sword"), Qty))
{
    UE_LOG(LogTemp, Log, TEXT("Sword count: %s"), *Qty);
}
```

## Step 6 — Bind callbacks

```cpp
void AMyActor::BeginPlay()
{
    Super::BeginPlay();

    InventoryMap->OnEntryAdded.AddDynamic(this, &AMyActor::OnItemAdded);
    InventoryMap->OnEntryRemoved.AddDynamic(this, &AMyActor::OnItemRemoved);
}

void AMyActor::OnItemAdded(const FString& Key, const FString& Value)
{
    UE_LOG(LogTemp, Log, TEXT("Item added: %s = %s"), *Key, *Value);
}

void AMyActor::OnItemRemoved(const FString& Key)
{
    UE_LOG(LogTemp, Log, TEXT("Item removed: %s"), *Key);
}
```
