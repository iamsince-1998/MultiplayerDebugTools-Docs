---
id: troubleshooting
title: Troubleshooting
sidebar_position: 9
---

# Troubleshooting

## Component does not appear in the Add Component list

- Confirm the plugin is enabled in **Edit → Plugins**.
- Confirm you regenerated project files after adding the plugin.
- Rebuild the project from Visual Studio / Xcode.

## Changes on the server are not reaching clients

1. Verify `bReplicates = true` on the owning Actor.
2. Verify the Actor is spawned with server authority (spawned from the server, not pre-placed in a level that clients also load without replication).
3. Check that `GetLifetimeReplicatedProps` is being called — if you subclassed the Actor and forgot `Super::GetLifetimeReplicatedProps(OutLifetimeProps)`, replication props are lost.

## Client RPC calls do nothing

- Check the Actor has a net owner set to the client's `APlayerController`.
- Use `SetOwner(PlayerController)` on the Actor after spawning it on the server.
- Verify the Actor's **Net Owner** is shown correctly in the editor's replication details.

## `GetAllValues` returns an empty array

Possible causes:

- The set is genuinely empty on this machine.
- The component is on an Actor that does not replicate — the client's cached set never gets populated.
- You are reading before `BeginPlay` fires (the `Owner` pointer assignment happens in `BeginPlay`).

## Compile error: `EAllowShrinking` not found

This should not happen with the current plugin source. If you see it, verify you are using the files from this repository (not a cached/intermediate copy). Delete `Intermediate/` and rebuild.

## Compile error: `NetCore` module not found (UE 4.27)

The `NetCore` module exists in UE 4.27. If the build system cannot find it, verify your engine installation is complete and not corrupted. You can safely remove `"NetCore"` from `Build.cs` for UE 4.27 since `FFastArraySerializer` is found via the `Engine` module's include paths.
