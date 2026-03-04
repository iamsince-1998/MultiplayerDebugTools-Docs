---
id: overview
title: Overview
sidebar_position: 1
---

# MultiplayerDebugTools

A runtime Unreal Engine plugin that provides a lightweight in-viewport multiplayer diagnostics overlay.

- Toggle key: `F10`
- Console command: `mdt.Toggle`
- Overlay type: Slate widget (`SMultiplayerDebugOverlay`)
- Data provider: `UGameInstanceSubsystem` (`UMultiplayerDebugSubsystem`)

Supported engine range: `UE 4.27` through `UE 5.7`.

## What It Shows

- `Role`: `Standalone`, `Client`, `Listen Server`, or `Dedicated Server`
- `FPS`: sampled from `GAverageFPS`
- `Ping (ms)`: average across active net connections
- `Loss In (%)`: inbound packet loss percent
- `Loss Out (%)`: outbound packet loss percent
- `Recv`: inbound bandwidth (B/s, KB/s, MB/s)
- `Sent`: outbound bandwidth (B/s, KB/s, MB/s)
- `Actors`: total actor count in world
- `Net Actors`: replicated actor count (`GetIsReplicated()`)

If no network connection is present, network-dependent metrics show `N/A`.

## Visual Thresholds

- **FPS**
  - Green: `>= 55`
  - Yellow: `>= 25 and < 55`
  - Red: `< 25`
- **Ping**
  - Green: `< 50 ms`
  - Yellow: `< 100 ms`
  - Red: `>= 100 ms`
- **Packet Loss**
  - Green: `< 1%`
  - Yellow: `< 5%`
  - Red: `>= 5%`

Disabled metrics show `Off` in a dim color.

## Installation

1. Place `MultiplayerDebugTools` under your project `Plugins/` folder.
2. Open the project in Unreal Editor.
3. Enable **Multiplayer Debug Tools** from **Edit > Plugins**.
4. Restart the editor when prompted.

## Quick Usage

- Press `F10` to toggle the overlay.
- Or run `mdt.Toggle` in the console.

For multiplayer validation in PIE:

1. Set **Number of Players** to 2+.
2. Set play mode to **Listen Server**.
3. Launch PIE.
4. Toggle overlay per window and compare role/ping/loss/bandwidth values.

## Blueprint API

`UMultiplayerDebugSubsystem` is exposed to Blueprint and can be retrieved from Game Instance subsystem access.

### Functions

- `ToggleOverlay()`
- `IsOverlayVisible() -> bool`
- `GetStatsSnapshot() -> FMultiplayerDebugStatsSnapshot`
- `RefreshStatsNow()`
- `SetStatsUpdateInterval(float InSeconds)`
- `GetStatsUpdateInterval() -> float`
- `GetFeatureToggles() -> FMultiplayerDebugFeatureToggles`
- `SetFeatureToggles(FMultiplayerDebugFeatureToggles)`
- `SetFeatureEnabled(EMultiplayerDebugMetric Feature, bool bEnabled)`
- `IsFeatureEnabled(EMultiplayerDebugMetric Feature) -> bool`
- `SetAllFeaturesEnabled(bool bEnabled)`

### Event Dispatcher

- `OnStatsUpdated(FMultiplayerDebugStatsSnapshot Snapshot)`

### Feature Enum

`EMultiplayerDebugMetric`:

- `Role`
- `FPS`
- `Ping`
- `PacketLoss`
- `Bandwidth`
- `ActorCounts`

### Snapshot Struct

`FMultiplayerDebugStatsSnapshot` includes:

- `EnabledFeatures`
- `NetRole`
- `FPS`
- `PingMs`
- `PacketLossInPercent`
- `PacketLossOutPercent`
- `BandwidthInBytesPerSecond`
- `BandwidthOutBytesPerSecond`
- `TotalActors`
- `ReplicatedActors`
- `bHasNetworkConnection`

### Feature Toggle Struct

`FMultiplayerDebugFeatureToggles` includes booleans:

- `bRole`
- `bFPS`
- `bPing`
- `bPacketLoss`
- `bBandwidth`
- `bActorCounts`

## C++ Usage

```cpp
#include "MultiplayerDebugSubsystem.h"

if (UGameInstance* GI = GetGameInstance())
{
    if (UMultiplayerDebugSubsystem* DebugSub = GI->GetSubsystem<UMultiplayerDebugSubsystem>())
    {
        DebugSub->ToggleOverlay();
        DebugSub->SetFeatureEnabled(EMultiplayerDebugMetric::Bandwidth, true);
        DebugSub->SetStatsUpdateInterval(0.2f);
    }
}
```

Bind to updates:

```cpp
DebugSub->OnStatsUpdated.AddDynamic(this, &UMyObject::HandleStatsUpdated);
```

## Runtime Behavior

- Stats ticker interval default: `0.25s` (`SetStatsUpdateInterval` minimum clamp: `0.05s`).
- Actor counts are internally refreshed at `1.0s` intervals.
- Overlay refresh timer is `0.25s`.
- Packet/bandwidth data is sampled from net driver connections:
  - Client side uses `ServerConnection`.
  - Server side aggregates `ClientConnections`.
- Dedicated server builds (`UE_SERVER`) skip Slate overlay/input handling.

## Module Architecture

- `FMultiplayerDebugToolsModule`
  - Registers `mdt.Toggle` console command.
  - Registers an input preprocessor for `F10`.
- `UMultiplayerDebugSubsystem`
  - Collects and caches stats.
  - Owns overlay visibility state.
  - Emits `OnStatsUpdated`.
- `SMultiplayerDebugOverlay`
  - Draws the widget.
  - Pulls subsystem snapshot and applies color/formatting.

## Build and Dependencies

- Public: `Core`, `CoreUObject`, `Engine`, `InputCore`
- Private (non-server targets): `Slate`, `SlateCore`

If your game module includes plugin headers, add `"MultiplayerDebugTools"` to your module dependencies.

## Limitations and Troubleshooting

- Overlay requires a viewport (not visible on dedicated server process).
- In standalone/non-networked sessions, network metrics are expected to be `N/A`.
- If `F10` does nothing, test `mdt.Toggle` in console and check key interception.
- If ping/loss/bandwidth show `N/A`, ensure the session is actually networked.
