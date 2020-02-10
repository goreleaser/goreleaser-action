"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const git = __importStar(require("./git"));
const installer = __importStar(require("./installer"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const fs = __importStar(require("fs"));
function run(silent) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const version = core.getInput('version') || 'latest';
            const args = core.getInput('args');
            const key = core.getInput('key');
            const workdir = core.getInput('workdir') || '.';
            const goreleaser = yield installer.getGoReleaser(version);
            const commit = yield git.getShortCommit();
            const tag = yield git.getTag();
            const isTagDirty = yield git.isTagDirty(tag);
            if (workdir && workdir !== '.') {
                core.info(`📂 Using ${workdir} as working directory...`);
                process.chdir(workdir);
            }
            let snapshot = '';
            if (args.split(' ').indexOf('release') > -1) {
                if (isTagDirty) {
                    core.info(`⚠️ No tag found for commit ${commit}. Snapshot forced`);
                    if (!args.includes('--snapshot')) {
                        snapshot = ' --snapshot';
                    }
                }
                else {
                    core.info(`✅ ${tag} tag found for commit ${commit}`);
                }
            }
            if (key) {
                core.info('🔑 Importing signing key...');
                let path = `${process.env.HOME}/key.asc`;
                fs.writeFileSync(path, key, { mode: 0o600 });
                yield exec.exec('gpg', ['--import', path], {
                    silent: silent
                });
            }
            core.info('🏃 Running GoReleaser...');
            yield exec.exec(`${goreleaser} ${args}${snapshot}`, undefined, {
                silent: silent
            });
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
exports.run = run;
run();
