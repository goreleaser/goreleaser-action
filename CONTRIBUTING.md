# Contributing

Thanks for your interest in contributing! This document covers the development
workflow needed to get a change ready to commit and push.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with [Buildx](https://docs.docker.com/buildx/working-with-buildx/)
- Git

That's it. Everything else (Node, npm, linters, the test environment) runs
inside containers driven by `docker buildx bake`.

## Pre-commit checklist

Run these commands, in order, before committing any change to `src/`,
`__tests__/`, `package.json`, `package-lock.json`, or `action.yml`:

```sh
# 1. Format source, refresh node_modules, regenerate dist/index.js
docker buildx bake pre-checkin

# 2. Run the test suite (unit + integration; needs network for release downloads)
docker buildx bake test

# 3. Validate that everything is committed and reproducible
docker buildx bake validate
```

`validate` is what CI runs. If it passes locally, your PR will pass the
`validate` job too.

### Why `pre-checkin` matters

The repository ships the compiled action as `dist/index.js`. CI's
`build-validate` target rebuilds it inside an Alpine container and fails if the
checked-in bytes don't match. **You must commit the `dist/` output produced by
`docker buildx bake pre-checkin`** — running `npm run build` on macOS or a
non-Alpine host produces slightly different bytes and `validate` will reject
the PR.

If you forget and CI complains about a `dist/` diff, just run:

```sh
docker buildx bake build
git add dist/
git commit --amend --no-edit
git push --force-with-lease
```

## Available bake targets

| Target          | Purpose                                             |
| --------------- | --------------------------------------------------- |
| `build`         | Regenerate `dist/index.js` only                     |
| `format`        | Run Prettier on `src/` and `__tests__/`             |
| `vendor`        | Refresh `node_modules` / `package-lock.json`        |
| `pre-checkin`   | `vendor` + `format` + `build` (run before commits)  |
| `lint`          | Prettier check + ESLint                             |
| `build-validate`| Verify `dist/index.js` matches a fresh build        |
| `vendor-validate`| Verify `package-lock.json` is in sync               |
| `validate`      | `lint` + `build-validate` + `vendor-validate`       |
| `test`          | Run Jest with coverage in an Alpine container       |

## Tests

`docker buildx bake test` runs the full Jest suite, including integration
tests that:

- Download real GoReleaser releases from GitHub
- Verify `checksums.txt` against the downloaded archive
- Verify the cosign sigstore bundle (`cosign` is installed in the test image)

These need outbound network access. If you're behind a restrictive proxy or
offline, those tests will fail — that's expected.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`,
`fix:`, `test:`, `docs:`, `chore:`, `ci:`, …). Keep the subject ≤72 chars.

## Pull requests

- Target `master`.
- Make sure `docker buildx bake validate` and `docker buildx bake test` pass.
- One logical change per PR is easier to review.
- The `signing` CI job and `goreleaser-pro` matrix entries are skipped on PRs
  from forks because they need repository secrets — that's expected and not
  something you need to fix.
