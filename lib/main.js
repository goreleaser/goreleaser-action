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
const installer = __importStar(require("./installer"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const version = core.getInput('version') || 'latest';
            const args = core.getInput('args');
            const goreleaser = yield installer.getGoReleaser(version);
            let snapshot = '';
            if (!process.env.GITHUB_REF.startsWith('refs/tags/')) {
                console.log(`⚠️ No tag found. Snapshot forced`);
                if (!args.includes('--snapshot')) {
                    snapshot = ' --snapshot';
                }
            }
            else {
                console.log(`✅ ${process.env.GITHUB_REF.split('/')[2]} tag found`);
            }
            console.log('🏃 Running GoReleaser...');
            yield exec.exec(`${goreleaser} ${args}${snapshot}`);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
