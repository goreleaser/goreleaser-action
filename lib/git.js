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
const child_process = __importStar(require("child_process"));
const git = (args = []) => __awaiter(void 0, void 0, void 0, function* () {
    const stdout = child_process.execSync(`git ${args.join(' ')}`, {
        encoding: 'utf8'
    });
    return stdout.trim();
});
function isTagDirty(currentTag) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield git(['describe', '--exact-match', '--tags', '--match', currentTag]);
        }
        catch (err) {
            return true;
        }
        return false;
    });
}
exports.isTagDirty = isTagDirty;
function getTag() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield git(['describe', '--tags', '--abbrev=0']);
    });
}
exports.getTag = getTag;
function getShortCommit() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield git(['show', "--format='%h'", 'HEAD', '--quiet']);
    });
}
exports.getShortCommit = getShortCommit;
