# MultiplayerDebugTools

A runtime Unreal Engine plugin that provides a lightweight in-viewport multiplayer diagnostics overlay.

- Toggle key: `F10`
- Console command: `mdt.Toggle`
- Overlay type: Slate widget (`SMultiplayerDebugOverlay`)
- Data provider: `UGameInstanceSubsystem` (`UMultiplayerDebugSubsystem`)

The plugin is designed for quick multiplayer validation during PIE, standalone, and packaged gameplay sessions.

Supported engine range: `UE 4.27` through `UE 5.7`.

## What It Shows

The overlay can display the following metrics:

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

Color coding used by the overlay:

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

The subsystem broadcasts updates when values change (or when forced via `RefreshStatsNow`).

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

        // Optional runtime control
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

Core classes:

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

Data flow:

1. User input (`F10`) or console (`mdt.Toggle`) calls subsystem toggle.
2. Subsystem creates/removes overlay widget in viewport.
3. Subsystem ticker updates cached snapshot.
4. Overlay active timer reads snapshot and renders values.

## Build and Dependencies

Module dependencies:

- Public: `Core`, `CoreUObject`, `Engine`, `InputCore`
- Private (non-server targets): `Slate`, `SlateCore`

If your game module includes plugin headers, add `"MultiplayerDebugTools"` to your module dependencies.

## Limitations and Notes

- Overlay requires a viewport (not visible on dedicated server process).
- `F10` can be consumed by this plugin input preprocessor.
- In standalone/non-networked sessions, network metrics are expected to be `N/A`.
- Packet loss values are computed from cumulative packet counters at sample time.

## Troubleshooting

- **Overlay not visible:**
  - Verify plugin is enabled and editor restarted.
  - Run `mdt.Toggle` directly in console.
- **`F10` does nothing:**
  - Test with `mdt.Toggle`.
  - Check if another system is intercepting `F10`.
- **Ping/loss/bandwidth show `N/A`:**
  - Ensure session is networked (listen server + client(s), or client connected to server).
- **No overlay on dedicated server:**
  - Expected behavior; view stats from a client/listen-server viewport.

## Version and Engine

From `MultiplayerDebugTools.uplugin`:

- Version: `1.0.0`
- Supported engine range: `4.27` to `5.7`
- Module type: `Runtime`
- Category: `Networking`
