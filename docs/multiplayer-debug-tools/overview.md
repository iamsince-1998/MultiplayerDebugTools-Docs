---
id: overview
title: Overview
sidebar_position: 1
---

# MultiplayerDebugTools

A modern, runtime Unreal Engine plugin that gives you a **lightweight multiplayer diagnostics HUD** directly in the viewport.

:::info Core controls
- **Toggle key:** `F10`
- **Console command:** `mdt.Toggle`
- **Overlay widget:** `SMultiplayerDebugOverlay`
- **Subsystem:** `UMultiplayerDebugSubsystem` (`UGameInstanceSubsystem`)
- **Engine support:** `UE 4.27` → `UE 5.7`
:::

---

## Why It’s Useful

Multiplayer debugging can get noisy and slow. MultiplayerDebugTools keeps critical network and gameplay replication signals visible while you iterate:

- ✅ Fast session health checks in PIE
- ✅ Visual thresholds for instant “good/warn/bad” feedback
- ✅ Blueprint + C++ control points for custom workflows
- ✅ Minimal runtime overhead and simple integration

---

## What You Can See In-Game

| Metric | Description |
|---|---|
| `Role` | `Standalone`, `Client`, `Listen Server`, or `Dedicated Server` |
| `FPS` | Sampled from `GAverageFPS` |
| `Ping (ms)` | Average across active net connections |
| `Loss In (%)` | Inbound packet loss |
| `Loss Out (%)` | Outbound packet loss |
| `Recv` | Inbound bandwidth (`B/s`, `KB/s`, `MB/s`) |
| `Sent` | Outbound bandwidth (`B/s`, `KB/s`, `MB/s`) |
| `Actors` | Total actor count in world |
| `Net Actors` | Replicated actor count (`GetIsReplicated()`) |

If no network connection exists, network-dependent metrics are shown as `N/A`.

---

## Visual Thresholds

### FPS
- 🟢 Good: `>= 55`
- 🟡 Warning: `>= 25 and < 55`
- 🔴 Critical: `< 25`

### Ping
- 🟢 Good: `< 50 ms`
- 🟡 Warning: `< 100 ms`
- 🔴 Critical: `>= 100 ms`

### Packet Loss
- 🟢 Good: `< 1%`
- 🟡 Warning: `< 5%`
- 🔴 Critical: `>= 5%`

Disabled metrics appear as `Off` in a dimmed style.

---

## Installation

1. Copy `MultiplayerDebugTools` into your project `Plugins/` folder.
2. Open your project in Unreal Editor.
3. Enable **Multiplayer Debug Tools** via **Edit → Plugins**.
4. Restart when prompted.

---

## Quick Usage (PIE Multiplayer Check)

1. Set **Number of Players** to `2+`.
2. Choose **Listen Server** play mode.
3. Start PIE.
4. Press `F10` in each window and compare values (role, ping, packet loss, bandwidth).

---

## Blueprint API

Access the subsystem through Game Instance subsystem access.

### Main Functions

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

### `EMultiplayerDebugMetric`

- `Role`
- `FPS`
- `Ping`
- `PacketLoss`
- `Bandwidth`
- `ActorCounts`

### `FMultiplayerDebugStatsSnapshot`

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

### `FMultiplayerDebugFeatureToggles`

- `bRole`
- `bFPS`
- `bPing`
- `bPacketLoss`
- `bBandwidth`
- `bActorCounts`

---

## C++ Example

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

---

## Runtime Behavior

- Stats ticker default: `0.25s` (minimum clamp via API: `0.05s`)
- Actor count refresh: `1.0s`
- Overlay refresh timer: `0.25s`
- Data collection source:
  - Client: `ServerConnection`
  - Server: aggregated `ClientConnections`
- Dedicated server (`UE_SERVER`) skips Slate overlay/input handling

---

## Build Dependencies

- **Public:** `Core`, `CoreUObject`, `Engine`, `InputCore`
- **Private (non-server):** `Slate`, `SlateCore`

If your game module includes plugin headers, add `"MultiplayerDebugTools"` to module dependencies.

---

## Notes & Troubleshooting

:::note
- No viewport means no overlay (expected on dedicated server process).
- In non-networked sessions, network metrics showing `N/A` is expected.
- If `F10` does nothing, try `mdt.Toggle` in console.
- If ping/loss/bandwidth remains `N/A`, verify the session is actually networked.
:::
