<p align="center">
  <img alt="GoReleaser Logo" src="https://avatars2.githubusercontent.com/u/24697112?v=3&s=200" height="140" />
  <h3 align="center">GoReleaser Action</h3>
  <p align="center"><a href="https://github.com/features/actions">GitHub Action</a> for GoReleaser</p>
  <p align="center">
    <a href="https://github.com/goreleaser/goreleaser-action/releases/latest"><img alt="GitHub release" src="https://img.shields.io/github/release/goreleaser/goreleaser-action.svg?logo=github&style=flat-square"></a>
    <a href="https://github.com/marketplace/actions/goreleaser-action"><img alt="GitHub marketplace" src="https://img.shields.io/badge/marketplace-goreleaser--action-blue?logo=github&style=flat-square"></a>
    <a href="https://github.com/goreleaser/goreleaser-action/actions"><img alt="Test workflow" src="https://github.com/goreleaser/goreleaser-action/workflows/test/badge.svg"></a>
    <a href="https://www.patreon.com/crazymax"><img alt="Support CrazyMax on Patreon" src="https://img.shields.io/badge/crazymax-patreon-f96854.svg?logo=patreon&style=flat-square"></a>
  </p>
</p>

---

> **:warning: Note:** To use this action, you must have access to the [GitHub Actions](https://github.com/features/actions) feature. GitHub Actions are currently only available in public beta. You can [apply for the GitHub Actions beta here](https://github.com/features/actions/signup/).

## Usage

Below is a simple snippet to use this action. A [live example](https://github.com/goreleaser/goreleaser-action/actions) is also available for this repository.

```yaml
name: goreleaser

on:
  pull_request:
  push:

jobs:
  goreleaser:
    runs-on: ubuntu-latest
    steps:
      -
        name: Checkout
        uses: actions/checkout@master
      -
        name: Set up Go
        uses: actions/setup-go@master
      -
        name: Run GoReleaser
        uses: goreleaser/goreleaser-action@master
        with:
          version: latest
          args: release --rm-dist
          key: ${{ secrets.YOUR_PRIVATE_KEY }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Customizing

### Inputs

Following inputs can be used as `step.with` keys

| Name          | Type    | Default   | Description                              |
|---------------|---------|-----------|------------------------------------------|
| `version`     | String  | `latest`  | GoReleaser version. Example: `v0.117.0`  |
| `args`        | String  |           | Arguments to pass to GoReleaser          |
| `key`         | String  |           | Private key to import                    |

### Signing

If signing is enabled in your GoReleaser configuration, populate the `key` input with your private key
and reference the key in your signing configuration, e.g.

```yaml
signs:
  - artifacts: checksum
    args: ["--batch", "-u", "<key id, fingerprint, email, ...>", "--output", "${signature}", "--detach-sign", "${artifact}"]
```

This feature is currently only compatible when using the default `gpg` command and a private key without a passphrase.

## License

MIT. See `LICENSE` for more details.
