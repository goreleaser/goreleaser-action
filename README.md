<p align="center">
  <img alt="GoReleaser Logo" src="https://avatars2.githubusercontent.com/u/24697112?v=3&s=200" height="140" />
  <h3 align="center">GoReleaser Action</h3>
  <p align="center"><a href="https://github.com/features/actions">GitHub Action</a> for GoReleaser</p>
  <p align="center">
    <a href="https://github.com/goreleaser/goreleaser-action/releases/latest"><img alt="GitHub release" src="https://img.shields.io/github/release/goreleaser/goreleaser-action.svg?logo=github&style=flat-square"></a>
    <a href="https://github.com/marketplace/actions/goreleaser-action"><img alt="GitHub marketplace" src="https://img.shields.io/badge/marketplace-goreleaser--action-blue?logo=github&style=flat-square"></a>
    <a href="https://github.com/goreleaser/goreleaser-action/actions?workflow=test"><img alt="Test workflow" src="https://img.shields.io/github/workflow/status/goreleaser/goreleaser-action/test?label=test&logo=github&style=flat-square"></a>
    <a href="https://codecov.io/gh/goreleaser/goreleaser-action"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/goreleaser/goreleaser-action?logo=codecov&style=flat-square"></a>
    <a href="https://github.com/sponsors/crazy-max"><img src="https://img.shields.io/badge/sponsor-crazy--max-181717.svg?logo=github&style=flat-square" alt="Become a sponsor"></a>
  </p>
</p>

---

![GoRelease Action](.github/goreleaser-action.png)

## Usage

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
        uses: actions/checkout@v2
      -
        name: Unshallow
        run: git fetch --prune --unshallow
      -
        name: Set up Go
        uses: actions/setup-go@v2
        with:
          go-version: 1.13
      -
        name: Run GoReleaser
        uses: goreleaser/goreleaser-action@v1
        with:
          version: latest
          args: release --rm-dist
          key: ${{ secrets.YOUR_PRIVATE_KEY }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

> **IMPORTANT**: note the `Unshallow` step. It is required for the changelog to work correctly.

If you want to run GoReleaser only on new tag, you can use this event:

```yaml
on:
  push:
    tags:
      - '*'
```

Or with a condition on GoReleaser step:

```yaml
      -
        name: Run GoReleaser
        uses: goreleaser/goreleaser-action@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          version: latest
          args: release --rm-dist
          key: ${{ secrets.YOUR_PRIVATE_KEY }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

> For detailed instructions please follow GitHub Actions [workflow syntax](https://help.github.com/en/articles/workflow-syntax-for-github-actions#About-yaml-syntax-for-workflows).

## Customizing

### inputs

Following inputs can be used as `step.with` keys

| Name          | Type    | Default   | Description                               |
|---------------|---------|-----------|-------------------------------------------|
| `version`     | String  | `latest`  | GoReleaser version. Example: `v0.117.0`   |
| `args`        | String  |           | Arguments to pass to GoReleaser           |
| `key`         | String  |           | Private key to import                     |
| `workdir`     | String  | `.`       | Working directory (below repository root) |

### environment variables

Following environment variables can be used as `step.env` keys

| Name           | Description                           |
|----------------|---------------------------------------|
| `GITHUB_TOKEN` | [GITHUB_TOKEN](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token) as provided by `secrets` |

## Limitation

`GITHUB_TOKEN` permissions [are limited to the repository](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token#about-the-github_token-secret)
that contains your workflow. 

If you need to push the homebrew tap to another repository, you must therefore create a custom [Personal Access Token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)
with `repo` permissions and [add it as a secret in the repository](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets). If you create a 
secret named `GH_PAT`, the step will look like this:

```yaml
      -
        name: Run GoReleaser
        uses: goreleaser/goreleaser-action@v1
        with:
          version: latest
          args: release --rm-dist
          key: ${{ secrets.YOUR_PRIVATE_KEY }}
        env:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
```

## Signing

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
