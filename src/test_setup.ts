import tmp = require('tmp');

tmp.setGracefulCleanup();
const tmpdir = tmp.dirSync({template: 'goreleaser-XXXXXX'});
process.env = Object.assign(process.env, {
  RUNNER_TEMP: tmpdir.name,
  RUNNER_TOOL_CACHE: tmpdir.name,
  GITHUB_ACTION: '1'
});
