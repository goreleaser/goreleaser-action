/// <reference types="node" />
import * as ts from "typescript";
import { parseJSON } from "./utils";
export { parseJSON };
export declare const version: any;
export interface Options {
    dryRun?: boolean;
    verbose?: boolean;
    baseDir?: string;
    replace: boolean;
    verify: boolean;
    tsconfig: boolean;
    tsconfigFile: string | null;
    tslint: boolean;
    tslintFile: string | null;
    editorconfig: boolean;
    vscode: boolean;
    vscodeFile: string | null;
    tsfmt: boolean;
    tsfmtFile: string | null;
}
export interface OptionModifier {
    (fileName: string, opts: Options, formatSettings: ts.FormatCodeSettings): ts.FormatCodeSettings | Promise<ts.FormatCodeSettings>;
}
export interface PostProcessor {
    (fileName: string, formattedCode: string, opts: Options, formatSettings: ts.FormatCodeSettings): string | Promise<string>;
}
export interface ResultMap {
    [fileName: string]: Result;
}
export interface Result {
    fileName: string;
    settings: ts.FormatCodeSettings | null;
    message: string;
    error: boolean;
    src: string;
    dest: string;
}
export declare function processFiles(files: string[], opts: Options): Promise<ResultMap>;
export declare function processStream(fileName: string, input: NodeJS.ReadableStream, opts: Options): Promise<Result>;
export declare function processString(fileName: string, content: string, opts: Options): Promise<Result>;
