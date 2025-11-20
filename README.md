# next-sweep

[![npm version](https://img.shields.io/npm/v/next-sweep.svg)](https://www.npmjs.com/package/next-sweep)
[![npm downloads](https://img.shields.io/npm/dm/next-sweep.svg)](https://www.npmjs.com/package/next-sweep)

A CLI tool to find and delete `.next` folders recursively, similar to `npkill` but specifically for Next.js build directories.

## Installation

Install globally using npm or pnpm:

```bash
# Using npm
npm install -g next-sweep

# Using pnpm
pnpm add -g next-sweep

# Using yarn
yarn global add next-sweep
```

Or run it directly with `npx` without installing:

```bash
npx next-sweep
```

## Usage

Once installed, navigate to any directory and run:

```bash
next-sweep
```

The tool will:
1. Scan the current directory recursively for `.next` folders
2. Show you a list of found folders with their sizes
3. Let you select which ones to delete (interactive checkbox interface)
4. Delete the selected folders and show how much space was reclaimed

### Example

```bash
cd ~/my-projects
next-sweep
```

Output:
```
🧹 Next.js Cleaner (Like npkill for .next)

Found 3 folders. Potential space to reclaim: 245.3 MB

? Select folders to delete (Space to select, Enter to confirm):
 ◯ project1/.next  125.4 MB
 ◯ project2/.next  89.2 MB
 ◯ project3/.next  30.7 MB

✔ Cleanup complete!
🎉 Reclaimed space: 245.3 MB
```

## Features

- 🔍 Recursively finds all `.next` folders
- 📊 Shows folder sizes in human-readable format
- ✅ Interactive selection (checkbox interface)
- 🚫 Automatically ignores `node_modules`, `.git`, `.vscode`, `dist`, and `build` directories
- 🎨 Beautiful CLI interface with colors and spinners
- ⚡ Fast and efficient scanning

## How It Works

`next-sweep` scans your current directory and all subdirectories (excluding ignored folders) to find `.next` build directories. It then presents an interactive list where you can select which folders to delete, helping you reclaim disk space from unused Next.js build artifacts.

## Development

If you want to contribute or run the development version:

```bash
# Clone the repository
git clone <repository-url>
cd next-sweep

# Install dependencies
pnpm install

# Run locally
pnpm start
# or
node index.js
```

### Local Development Setup

For local development and testing, you can link the package:

```bash
# Using pnpm
pnpm link --global

# Using npm
npm link
```

Then use `next-sweep` from any directory. To unlink:

```bash
# Using pnpm
pnpm unlink --global

# Using npm
npm unlink -g next-sweep
```

## License

MIT © 2025 next-sweep contributors

## Links

- [npm package](https://www.npmjs.com/package/next-sweep)
- [GitHub repository](https://github.com/yourusername/next-sweep) (if applicable)
