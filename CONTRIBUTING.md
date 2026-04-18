# Contributing

Thanks for your interest in contributing!

## Prerequisites

- [Node.js](https://nodejs.org/) — version pinned in [`.node-version`](./.node-version).
  Tools like [`nvm`](https://github.com/nvm-sh/nvm), [`fnm`](https://github.com/Schniz/fnm),
  [`asdf`](https://asdf-vm.com/), or [`mise`](https://mise.jdx.dev/) read this file
  automatically.
- [`cosign`](https://docs.sigstore.dev/cosign/installation/) — only required if you
  want to run the signature-verification integration tests locally.

## Setup

```sh
npm ci
```

## Pre-commit checklist

Before committing changes to `src/`, `__tests__/`, `package.json`,
`package-lock.json`, or `action.yml`:

```sh
npm run pre-checkin
```

That runs `format` + `build` + `test` — the same checks CI runs.

Then commit `dist/` along with your source changes; the action runtime loads
`dist/index.js` directly, so it must stay in sync.

If CI's `validate / build` job fails because `dist/` differs from a fresh
build, just download the `dist` artifact from the failed run and commit it —
or rerun `npm run build` locally with the Node version in `.node-version`.

## npm scripts

| Script              | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `npm run build`     | Bundle `src/` to `dist/index.js` via `ncc`       |
| `npm run format`    | Run Prettier (write)                             |
| `npm run format-check` | Run Prettier (check only, used in CI)         |
| `npm run lint`      | Run ESLint (check only, used in CI)              |
| `npm run lint:fix`  | Run ESLint with `--fix`                          |
| `npm test`          | Run Jest with coverage                           |
| `npm run pre-checkin` | `format` + `lint:fix` + `build` + `test`       |

## Tests

`npm test` runs the full Jest suite, including integration tests that:

- Download real GoReleaser releases from GitHub
- Verify `checksums.txt` against the downloaded archive
- Verify the cosign sigstore bundle (skipped if `cosign` isn't on `PATH`,
  but the CI image always has it installed)

These need outbound network access. Offline / restrictive-proxy runs will
have those tests fail — that's expected.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`,
`fix:`, `test:`, `docs:`, `chore:`, `ci:`, …). Keep the subject ≤72 chars.

## Pull requests

- Target `master`.
- Make sure `npm run pre-checkin` passes.
- One logical change per PR is easier to review.
- The `signing` CI job and `goreleaser-pro` matrix entries are skipped on PRs
  from forks because they need repository secrets — that's expected and not
  something you need to fix.
