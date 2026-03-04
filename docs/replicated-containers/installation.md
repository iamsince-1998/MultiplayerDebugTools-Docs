---
id: installation
title: Installation
sidebar_position: 2
---

# Installation

## Step 1 — Copy the plugin folder

Copy the `ReplicatedContainers` folder into your project's `Plugins/` directory:

```
YourProject/
  Plugins/
    ReplicatedContainers/        ← put it here
      ReplicatedContainers.uplugin
      Source/
      ...
```

## Step 2 — Regenerate project files

Right-click your `.uproject` file → **Generate Visual Studio project files** (Windows)
or run `GenerateProjectFiles.sh` (Linux/Mac).

## Step 3 — Enable the plugin

Open your project in the Unreal Editor:

1. Go to **Edit → Plugins**
2. Search for **Replicated Containers**
3. Check **Enabled**
4. Restart the editor when prompted

## Step 4 — (C++ projects only) Add to Build.cs

In your game module's `Build.cs`, add the plugin module as a dependency:

```csharp
PublicDependencyModuleNames.AddRange(new string[]
{
    "ReplicatedContainers"
});
```

## Step 5 — Verify

Open any Actor Blueprint → **Add Component** → search for **Replicated Map** or **Replicated Set**.
Both should appear under the *Networking* category.
