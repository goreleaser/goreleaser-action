# TypeScript Formatter (tsfmt)

[![npm](https://img.shields.io/npm/v/typescript-formatter.svg)](https://www.npmjs.com/package/typescript-formatter)
[![Build Status](https://travis-ci.org/vvakame/typescript-formatter.svg)](https://travis-ci.org/vvakame/typescript-formatter)
[![Dependency Status](https://david-dm.org/vvakame/typescript-formatter.svg?theme=shields.io)](https://david-dm.org/vvakame/typescript-formatter)
[![npm](https://img.shields.io/npm/dm/typescript-formatter.svg)](https://www.npmjs.com/package/typescript-formatter)
[![GitHub stars](https://img.shields.io/github/stars/vvakame/typescript-formatter.svg?style=social&label=Star)](https://github.com/vvakame/typescript-formatter/stargazers)

A TypeScript code formatter powered by [TypeScript Compiler Service](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#pretty-printer-using-the-ls-formatter).

```bash
$ tsfmt --help
  Usage: tsfmt [options] [--] [files...]

  Options:

    -r, --replace         replace .ts file
    --verify              checking file format
    --baseDir <path>      config file lookup from <path>
    --stdin               get formatting content from stdin
    --no-tsconfig         don't read a tsconfig.json
    --no-tslint           don't read a tslint.json
    --no-editorconfig     don't read a .editorconfig
    --no-vscode           don't read a .vscode/settings.json
    --no-tsfmt            don't read a tsfmt.json
    --useTsconfig <path>  using specified config file instead of tsconfig.json
    --useTslint <path>    using specified config file instead of tslint.json
    --useTsfmt <path>     using specified config file instead of tsfmt.json
    --verbose             makes output more verbose
```

## Installation

```npm install -g typescript-formatter```

## Usage

### Format or verify specific TypeScript files

```bash
$ cat sample.ts
class Sample {hello(word="world"){return "Hello, "+word;}}
new Sample().hello("TypeScript");
```

```bash
# basic. read file, output to stdout.
$ tsfmt sample.ts
class Sample { hello(word = "world") { return "Hello, " + word; } }
new Sample().hello("TypeScript");
```

```bash
# from stdin. read from stdin, output to stdout.
$ cat sample.ts | tsfmt --stdin
class Sample { hello(word = "world") { return "Hello, " + word; } }
new Sample().hello("TypeScript");
```

```bash
# replace. read file, and replace file.
$ tsfmt -r sample.ts
replaced sample.ts
$ cat sample.ts
class Sample { hello(word = "world") { return "Hello, " + word; } }
new Sample().hello("TypeScript");
```

```bash
# verify. checking file format.
$ tsfmt --verify sample.ts
sample.ts is not formatted
$ echo $?
1
```

### Reformat all files in a TypeScript project

If no files are specified on the command line but
a TypeScript project file (tsconfig.json) exists,
the list of files will be read from the project file.

```bash
# reads list of files to format from tsconfig.json
tsfmt -r
```

## Read Settings From Files

1st. Read settings from tsfmt.json. Below is the example with [default values](https://github.com/vvakame/typescript-formatter/blob/master/lib/utils.ts):

```json
{
  "baseIndentSize": 0,
  "indentSize": 4,
  "tabSize": 4,
  "indentStyle": 2,
  "newLineCharacter": "\r\n",
  "convertTabsToSpaces": true,
  "insertSpaceAfterCommaDelimiter": true,
  "insertSpaceAfterSemicolonInForStatements": true,
  "insertSpaceBeforeAndAfterBinaryOperators": true,
  "insertSpaceAfterConstructor": false,
  "insertSpaceAfterKeywordsInControlFlowStatements": true,
  "insertSpaceAfterFunctionKeywordForAnonymousFunctions": false,
  "insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis": false,
  "insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets": false,
  "insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces": true,
  "insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces": false,
  "insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces": false,
  "insertSpaceAfterTypeAssertion": false,
  "insertSpaceBeforeFunctionParenthesis": false,
  "insertSpaceBeforeTypeAnnotation": true,
  "placeOpenBraceOnNewLineForFunctions": false,
  "placeOpenBraceOnNewLineForControlBlocks": false
}
```

2nd. Read settings from tsconfig.json ([tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html))

```text
{
  "compilerOptions": {
    "newLine": "LF"
  }
}
```

3rd. Read settings from .editorconfig ([editorconfig](http://editorconfig.org/))

```text
# EditorConfig is awesome: http://EditorConfig.org

# top-most EditorConfig file
root = true

# Unix-style newlines with a newline ending every file
[*]
indent_style = tab
tab_width = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

4th. Read settings from tslint.json ([tslint](https://www.npmjs.org/package/tslint))

```json
{
  "rules": {
    "indent": [true, 4],
    "whitespace": [true,
      "check-branch",
      "check-operator",
      "check-separator",
      "check-typecast"
    ]
  }
}
```

5th. Read settings from .vscode/settings.json ([VisualStudio Code](https://code.visualstudio.com/Docs/customization/userandworkspace))

```json
{
  // Place your settings in this file to overwrite default and user settings.
  "typescript.format.enable": true,
  "typescript.format.insertSpaceAfterCommaDelimiter": true,
  "typescript.format.insertSpaceAfterSemicolonInForStatements": true,
  "typescript.format.insertSpaceBeforeAndAfterBinaryOperators": true,
  "typescript.format.insertSpaceAfterKeywordsInControlFlowStatements": true,
  "typescript.format.insertSpaceAfterFunctionKeywordForAnonymousFunctions": false,
  "typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis": false,
  "typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets": false,
  "typescript.format.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces": false,
  "typescript.format.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces": false,
  "typescript.format.placeOpenBraceOnNewLineForFunctions": false,
  "typescript.format.placeOpenBraceOnNewLineForControlBlocks": false
}
```

### Read Settings Rules

```
$ tree -a
.
├── .vscode
│   └── settings.json
├── foo
│   ├── bar
│   │   ├── .editorconfig
│   │   └── buzz.ts
│   ├── fuga
│   │   ├── piyo.ts
│   │   └── tsfmt.json
│   └── tsfmt.json
└── tslint.json

4 directories, 7 files
```

1. exec `$ tsfmt -r foo/bar/buzz.ts foo/fuga/piyo.ts`
2. for foo/bar/buzz.ts, read foo/tsfmt.json and foo/bar/.editorconfig and ./tslint.json and .vscode/settings.json
3. for foo/fuga/piyo.ts, read foo/fuga/tsfmt.json and ./tslint.json and .vscode/settings.json

## Change Log

See [CHANGELOG](https://github.com/vvakame/typescript-formatter/blob/master/CHANGELOG.md)
