# Git Automator V3 Preview

**VERY UNCOMPLETE AND UNSTABLE ALPHA VERSION! PLEASE USE [GIT AUTOMATOR V2][link-legacy] INSTEAD
UNLESS YOU SPECIFICALLY WANT TO TEST IT.**

[![Visual Studio Marketplace Version][img-marketplace-version]][link-marketplace]
[![Visual Studio Marketplace Installs][img-marketplace-installs]][link-marketplace]
[![Travis CI Build Status][img-travis]][link-travis]
[![Coveralls Code Coverage][img-coveralls]][link-coveralls]

Git Automator is a Visual Studio Code extension automating your Git workflow: branches creation,
commit splitting & messages, etc.

> This repository hosts the next major version of Git Automator which will integrate a complete
> workflow change as well as integrate multiple new features.

## Features _(in progress)_

- **[Conventional Commits][link-conventional-commits] integration.**
- **Smart auto-prefill for your commit messages.**
- **Actions guessing.**
- **Automated commits splitting (when committing all files).**
- **Branch generator via command palette.**
- **Add and commit all or current file(s) in one shortcut.**
- **Push your current branch in one shortcut.**
- **Compatible with multiple workspaces.**

---

## Usage

### Add all edited files to Git and commit them

1. Hit **Ctrl + Shift + A** (PC) / **Cmd + Shift + A** (Mac).
2. Enter the commit message.
3. Press **ENTER**.

### Add ONLY the current file to Git and commit it

1. Hit **Ctrl + Shift + Z** (PC) / **Cmd + Shift + Z** (Mac).
2. Enter the commit message.
3. Press **ENTER**.

### Push local commits

1. Hit **Ctrl + Shift + X** (PC) / **Cmd + Shift + X** (Mac).

## Issues & Feature Requests

Please report any issue or feature request [there][link-issues].

## Contribute

```bash
git clone https://github.com/ivangabriele/vscode-git-automator.git
cd vscode-git-automator
yarn
```

`F5` under VS Code will run the extension in a new instance of VS Code. The code will be
automatically rebuild when changes are made to the `src/` directory but you have to reload the
tested VS Code instance in order to load your changes. You can find the `>Developer: Reload Window`
in the command palette.

### Recommended VS Code Settings

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.rulers": [100],
  "eslint.enable": false,
  "javascript.format.enable": false,
  "typescript.format.enable": false
}
```

### Test

- Lint Tests: `yarn test:lint`
- Unit Tests: `yarn test:unit`

#### Integration Tests

You can either run `yarn test:inte` (but you need all VS Code instances to be closed) or use the
dockerized tests by running `yarn test:docker` (which will actually run **all** the tests, including
integration ones).

### Release

This commands will also automatically compile production bundle via Rollup, update the version, tag
it and push it to Github:

```bash
npm version prerelease
vsce publish
```

## Links

- [Git Add & Commit extension on Github][link-repo]
- [Git Add & Commit extension on Visual Studio Market Place][link-marketplace]
- [MIT Licence][link-license]

---

[img-coveralls]:
  https://img.shields.io/coveralls/github/ivangabriele/vscode-git-automator/master.svg?style=flat-square
[img-marketplace-installs]:
  https://img.shields.io/visual-studio-marketplace/i/ivangabriele.vscode-git-automator.svg?style=flat-square
[img-marketplace-version]:
  https://img.shields.io/visual-studio-marketplace/v/ivangabriele.vscode-git-automator.svg?style=flat-square
[img-travis]:
  https://img.shields.io/travis/com/ivangabriele/vscode-git-automator/master.svg?style=flat-square
[link-conventional-commits]: https://www.conventionalcommits.org
[link-coveralls]: https://coveralls.io/github/ivangabriele/vscode-git-automator
[link-legacy]: https://marketplace.visualstudio.com/items/ivangabriele.vscode-git-add-and-commit
[link-license]: https://github.com/ivangabriele/vscode-git-automator/blob/master/LICENSE
[link-issues]: https://github.com/ivangabriele/vscode-git-automator/issues
[link-marketplace]: https://marketplace.visualstudio.com/items/ivangabriele.vscode-git-automator
[link-repo]: https://github.com/ivangabriele/vscode-git-automator
[link-travis]: https://travis-ci.com/ivangabriele/vscode-git-automator
