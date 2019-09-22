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
const tc = __importStar(require("@actions/tool-cache"));
const download = __importStar(require("download"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
const restm = __importStar(require("typed-rest-client/RestClient"));
let osPlat = os.platform();
let osArch = os.arch();
function getGoReleaser(version) {
    return __awaiter(this, void 0, void 0, function* () {
        const selected = yield determineVersion(version);
        if (selected) {
            version = selected;
        }
        console.log(`✅ GoReleaser version found: ${version}`);
        const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'goreleaser-'));
        const fileName = getFileName();
        const downloadUrl = util.format('https://github.com/goreleaser/goreleaser/releases/download/%s/%s', version, fileName);
        console.log(`⬇️ Downloading ${downloadUrl}...`);
        yield download.default(downloadUrl, tmpdir, { filename: fileName });
        console.log('📦 Extracting GoReleaser...');
        let extPath = tmpdir;
        if (osPlat == 'win32') {
            extPath = yield tc.extractZip(`${tmpdir}/${fileName}`);
        }
        else {
            extPath = yield tc.extractTar(`${tmpdir}/${fileName}`);
        }
        return path.join(extPath, osPlat == 'win32' ? 'goreleaser.exe' : 'goreleaser');
    });
}
exports.getGoReleaser = getGoReleaser;
function getFileName() {
    const platform = osPlat == 'win32' ? 'Windows' : osPlat == 'darwin' ? 'Darwin' : 'Linux';
    const arch = osArch == 'x64' ? 'x86_64' : 'i386';
    const ext = osPlat == 'win32' ? 'zip' : 'tar.gz';
    const filename = util.format('goreleaser_%s_%s.%s', platform, arch, ext);
    return filename;
}
function determineVersion(version) {
    return __awaiter(this, void 0, void 0, function* () {
        let rest = new restm.RestClient('ghaction-goreleaser', 'https://github.com', undefined, {
            headers: {
                Accept: 'application/json'
            }
        });
        let res = yield rest.get(`/goreleaser/goreleaser/releases/${version}`);
        if (res.statusCode != 200 || res.result === null) {
            throw new Error(`Cannot find GoReleaser ${version} release (http ${res.statusCode})`);
        }
        return res.result.tag_name;
    });
}
