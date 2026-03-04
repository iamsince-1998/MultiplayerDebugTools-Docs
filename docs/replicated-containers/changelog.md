---
id: changelog
title: Changelog
sidebar_position: 10
---

# Changelog

## 1.0.0

- Initial release
- `UReplicatedMapComponent` with full CRUD, delta replication, and Blueprint API
- `UReplicatedSetComponent` with add/remove, delta replication, and Blueprint API
- Fixed: `EAllowShrinking::No` version guard for UE 4.27 – 5.0 compatibility
- Fixed: `GetAllValues` now correctly returns all set values via `CachedSet.Array()`
- Added: `SupportedTargetPlatforms` covering all major platforms including dedicated server hosts
- Added: `EngineVersion: 4.27.0` minimum version declaration
