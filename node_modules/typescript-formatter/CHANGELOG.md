<a name="7.2.2"></a>
## [7.2.2](https://github.com/vvakame/typescript-formatter/compare/7.2.1...7.2.2) (2018-06-01)

I failed git rebase 😩, released again... (sorry!)

<a name="7.2.1"></a>
## [7.2.1](https://github.com/vvakame/typescript-formatter/compare/7.2.0...7.2.1) (2018-06-01)

checked by TypeScript 2.9.1

<a name="7.2.0"></a>
# [7.2.0](https://github.com/vvakame/typescript-formatter/compare/7.1.0...7.2.0) (2018-04-13)


### Features

* **ci:** remove Node.js v4 from .travis.yml ([e657ccb](https://github.com/vvakame/typescript-formatter/commit/e657ccb))
* **tsfmt:** update dependencies & use npm again ([850b369](https://github.com/vvakame/typescript-formatter/commit/850b369))
* **tslint:** add support to read extended `tslint.json` ([9c55670](https://github.com/vvakame/typescript-formatter/commit/9c55670)), closes [#123](https://github.com/vvakame/typescript-formatter/issues/123)



<a name="7.1.0"></a>
# [7.1.0](https://github.com/vvakame/typescript-formatter/compare/7.0.1...7.1.0) (2018-02-19)


### Features

* **tsfmt:** add insertSpaceAfterConstructor and insertSpaceAfterTypeAssertion support to .vscode/settings.json ([0f8b1e3](https://github.com/vvakame/typescript-formatter/commit/0f8b1e3))
* **tsfmt:** add insertSpaceBeforeTypeAnnotation support refs [#108](https://github.com/vvakame/typescript-formatter/issues/108) ([68bd800](https://github.com/vvakame/typescript-formatter/commit/68bd800))



<a name="7.0.1"></a>
## [7.0.1](https://github.com/vvakame/typescript-formatter/compare/7.0.0...7.0.1) (2017-12-17)

### Features

* **tsfmt:** cache tsconfig.json. thanks @stweedie ([0e42c1b](https://github.com/vvakame/typescript-formatter/commit/0e42c1b))


<a name="7.0.0"></a>
# [7.0.0](https://github.com/vvakame/typescript-formatter/compare/6.1.0...7.0.0) (2017-10-27)


### Features

* **tsfmt:** Use host EOL by default. thanks @vegansk ([9021fc6](https://github.com/vvakame/typescript-formatter/commit/9021fc6))
* **ci:** Update .travis.yml, add Node.js v8 env ([78a1128](https://github.com/vvakame/typescript-formatter/commit/78a1128))



<a name="6.1.0"></a>
# [6.1.0](https://github.com/vvakame/typescript-formatter/compare/6.0.0...6.1.0) (2017-10-26)


### Features

* **tsfmt:** Adds --useVscode flag that specifies an alternative path to .vscode/settings.json configuration. thanks @cspotcode ([5c0072a](https://github.com/vvakame/typescript-formatter/commit/5c0072a))
* **tsfmt:** update dependencies ([7a12cca](https://github.com/vvakame/typescript-formatter/commit/7a12cca))



<a name="6.0.0"></a>
# [6.0.0](https://github.com/vvakame/typescript-formatter/compare/5.2.0...6.0.0) (2017-08-22)


### Features

* **tsfmt:** don't use `default` export in our code ([6d04913](https://github.com/vvakame/typescript-formatter/commit/6d04913))
* **tsfmt:** update peerDependencies, required typescript@^2.1.6 ([d43c3cc](https://github.com/vvakame/typescript-formatter/commit/d43c3cc))
* **tsfmt:** using Language Service API instead of Old Compiler API ([1520cf8](https://github.com/vvakame/typescript-formatter/commit/1520cf8))



<a name="5.2.0"></a>
# [5.2.0](https://github.com/vvakame/typescript-formatter/compare/5.1.3...5.2.0) (2017-05-10)


### Features

* **tsfmt:** update dependencies, use npm-scripts for building ([890836f](https://github.com/vvakame/typescript-formatter/commit/890836f))
* **tsfmt:** add missing rules recently added by vscode ([#99](https://github.com/vvakame/typescript-formatter/pull/99)) thanks @clebert !



<a name="5.1.3"></a>
## [5.1.3](https://github.com/vvakame/typescript-formatter/compare/5.1.2...v5.1.3) (2017-04-06)


### Bug Fixes

* **tsfmt:** fix typo in cli option description [#93](https://github.com/vvakame/typescript-formatter/pull/93) ([aedf34a](https://github.com/vvakame/typescript-formatter/commit/aedf34a))



<a name="5.1.2"></a>
## [5.1.2](https://github.com/vvakame/typescript-formatter/compare/5.1.1...v5.1.2) (2017-03-16)


### Bug Fixes

* **tsfmt:** use --useTsconfig value to use when creating target files list fixes [#90](https://github.com/vvakame/typescript-formatter/issues/90) ([1ad2590](https://github.com/vvakame/typescript-formatter/commit/1ad2590))



<a name="5.1.1"></a>
## [5.1.1](https://github.com/vvakame/typescript-formatter/compare/4.2.2...v5.1.1) (2017-03-06)

bump versions!



<a name="4.2.2"></a>
## [4.2.2](https://github.com/vvakame/typescript-formatter/compare/4.2.1...v4.2.2) (2017-03-06)


### Bug Fixes

* **tsfmt:** changed vscode to be an optional param [#88](https://github.com/vvakame/typescript-formatter/pull/88) ([5779438](https://github.com/vvakame/typescript-formatter/commit/5779438))



<a name="5.1.0"></a>
# [5.1.0](https://github.com/vvakame/typescript-formatter/compare/5.0.1...v5.1.0) (2017-03-02)


### Features

* **api:** print tsc version when exec --version ([17a16ac](https://github.com/vvakame/typescript-formatter/commit/17a16ac))
* **tsfmt:** clean up verbose printing ([64ac10f](https://github.com/vvakame/typescript-formatter/commit/64ac10f))
* **tsfmt:** support new 6 settings ([4f21283](https://github.com/vvakame/typescript-formatter/commit/4f21283)) 
  * see [default settings](https://github.com/vvakame/typescript-formatter#read-settings-from-files).


<a name="5.0.1"></a>
## [5.0.1](https://github.com/vvakame/typescript-formatter/compare/4.2.1...v5.0.1) (2017-02-28)


### Bug Fixes

* **tsfmt:** use ts.sys.readDirectory and ts.parseJsonConfigFileContent completely [#77](https://github.com/vvakame/typescript-formatter/issues/77) [#84](https://github.com/vvakame/typescript-formatter/issues/84) ([4dd3f55](https://github.com/vvakame/typescript-formatter/commit/4dd3f55))



<a name="4.2.1"></a>
## [4.2.1](https://github.com/vvakame/typescript-formatter/compare/4.2.0...v4.2.1) (2017-02-28)


### Bug Fixes

* **tsfmt:** fix procedd of error message generation ([5bab796](https://github.com/vvakame/typescript-formatter/commit/5bab796))



<a name="5.0.0"></a>
# [5.0.0](https://github.com/vvakame/typescript-formatter/compare/4.2.0...v5.0.0) (2017-02-27)


### Features

* **tsfmt:** add --useTsconfig, --useTsfmt, --useTslint options to CLI closes [#67](https://github.com/vvakame/typescript-formatter/issues/67) ([025c543](https://github.com/vvakame/typescript-formatter/commit/025c543))
* **tsfmt:** drop tsconfig.json's filesGlob support, it is unofficial field. ([3b0d38f](https://github.com/vvakame/typescript-formatter/commit/3b0d38f))
* **tsfmt:** remove es6-promise devDependencies ([03ce823](https://github.com/vvakame/typescript-formatter/commit/03ce823))



<a name="4.2.0"></a>
# [4.2.0](https://github.com/vvakame/typescript-formatter/compare/4.1.2...v4.2.0) (2017-02-27)


### Features

* **tsfmt:** add .vscode/settings.json support [#70](https://github.com/vvakame/typescript-formatter/issues/70) ([2d9fbed](https://github.com/vvakame/typescript-formatter/commit/2d9fbed))
* **tsfmt:** add `extends` of tsconfig.json support [#77](https://github.com/vvakame/typescript-formatter/issues/77) ([8b31561](https://github.com/vvakame/typescript-formatter/commit/8b31561))



<a name="4.1.2"></a>
## [4.1.2](https://github.com/vvakame/typescript-formatter/compare/4.1.1...v4.1.2) (2017-02-23)


### Features

* **tsfmt:** run tests with typescript[@2](https://github.com/2).2.1 and add typescript@>=2.3.0-dev support ([7291732](https://github.com/vvakame/typescript-formatter/commit/7291732))



<a name="4.1.1"></a>
## [4.1.1](https://github.com/vvakame/typescript-formatter/compare/4.1.0...v4.1.1) (2017-02-10)


### Features

* **tsfmt:** Use latest release of TypeScript 2.1.5 ([#72](https://github.com/vvakame/typescript-formatter/pull/72)) thanks @xiamx !

### Bug Fixes

* **tsfmt:** Fix an issue with applying edits ([#75](https://github.com/vvakame/typescript-formatter/pull/75)) thanks @xiamx !



<a name="4.1.0"></a>
# [4.1.0](https://github.com/vvakame/typescript-formatter/compare/4.0.1...v4.1.0) (2017-02-05)


### Features

* **tsfmt:** support empty tsconfig.json that does not have files, include and exclude field ([c741d83](https://github.com/vvakame/typescript-formatter/commit/c741d83))



<a name="4.0.1"></a>
## [4.0.1](https://github.com/vvakame/typescript-formatter/compare/4.0.0...v4.0.1) (2016-11-16)

* **tsfmt:** add typescript `>=2.2.0-dev` to peerDependencies ([#68](https://github.com/vvakame/typescript-formatter/pull/68)) thanks @myitcv !

<a name="4.0.0"></a>
# [4.0.0](https://github.com/vvakame/typescript-formatter/compare/3.1.0...v4.0.0) (2016-10-27)

Now, typescript-formatter supports `typescript@^2.0.6`.
If you want to use with older version typescript, you can use `typescript-formatter@^3.0.0`.

### Features

* **tsfmt:** support TypeScript 2.0.6 ([26db3de](https://github.com/vvakame/typescript-formatter/commit/26db3de))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/vvakame/typescript-formatter/compare/3.0.1...v3.1.0) (2016-10-09)


### Features

* **tsfmt:** move final newline character logic to editorconfig part ([2df1f7a](https://github.com/vvakame/typescript-formatter/commit/2df1f7a))

thanks @jrieken !

<a name="3.0.1"></a>
## [3.0.1](https://github.com/vvakame/typescript-formatter/compare/3.0.0...v3.0.1) (2016-09-23)

[TypeScript 2.0.3 released](https://blogs.msdn.microsoft.com/typescript/2016/09/22/announcing-typescript-2-0/)! yay!

### Features

* **example:** update example code ([3b365be](https://github.com/vvakame/typescript-formatter/commit/3b365be))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/vvakame/typescript-formatter/compare/2.3.0...v3.0.0) (2016-08-19)


### Features

* **tsfmt:** support comments in tsconfig.json & tsfmt.json & tslint.json ([5a4fdfd](https://github.com/vvakame/typescript-formatter/commit/5a4fdfd))
* **tsfmt:** support include, exclude properties [@tsconfig](https://github.com/tsconfig).json when using --replace options [#48](https://github.com/vvakame/typescript-formatter/issues/48) ([d8e71f5](https://github.com/vvakame/typescript-formatter/commit/d8e71f5))
* **tsfmt:** update peerDependencies, remove tsc ^1.0.0 ([35c1d62](https://github.com/vvakame/typescript-formatter/commit/35c1d62))



<a name="2.3.0"></a>
# [2.3.0](https://github.com/vvakame/typescript-formatter/compare/2.2.1...v2.3.0) (2016-07-16)


### Features

* **tsfmt:** support TypeScript 2.0.0 and next ([38dc72e](https://github.com/vvakame/typescript-formatter/commit/38dc72e))



<a name="2.2.1"></a>
## [2.2.1](https://github.com/vvakame/typescript-formatter/compare/2.2.0...v2.2.1) (2016-06-30)

### Features

* **tsfmt:** Add 'next' support for TypeScript 2.0.0-dev. ([35a371c](https://github.com/vvakame/typescript-formatter/commit/35a371c))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/vvakame/typescript-formatter/compare/2.1.0...v2.2.0) (2016-05-14)


### Bug Fixes

* **tsfmt:** check rules.indent[1] is "tabs" fromt tslint fixes [#42](https://github.com/vvakame/typescript-formatter/issues/42) ([450c467](https://github.com/vvakame/typescript-formatter/commit/450c467)), closes [#42](https://github.com/vvakame/typescript-formatter/issues/42)



<a name="2.1.0"></a>
# [2.1.0](https://github.com/vvakame/typescript-formatter/compare/2.0.0...v2.1.0) (2016-02-25)


### Bug Fixes

* **ci:** fix Travis CI failed ([68a9c7c](https://github.com/vvakame/typescript-formatter/commit/68a9c7c))

### Features

* **tsfmt:** support typescript@1.8.2. add `insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces`. ([611fee0](https://github.com/vvakame/typescript-formatter/commit/611fee0))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/vvakame/typescript-formatter/compare/1.2.0...v2.0.0) (2016-02-06)


### Features

* **tsfmt:** remove es6-promise from dependencies. tsfmt supports after latest LTS of node.js ([19a7f44](https://github.com/vvakame/typescript-formatter/commit/19a7f44))
* **tsfmt:** remove typescript from dependencies and add to peerDependencies refs #30 ([b8a58c6](https://github.com/vvakame/typescript-formatter/commit/b8a58c6))
* **tsfmt:** update dependencies. support TypeScript 1.7.5 ([bb9cd81](https://github.com/vvakame/typescript-formatter/commit/bb9cd81))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/vvakame/typescript-formatter/compare/1.1.0...v1.2.0) (2015-12-01)


### Features

* **tsfmt:** update dependencies. support TypeScript 1.7.3 ([abd22cf](https://github.com/vvakame/typescript-formatter/commit/abd22cf))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/vvakame/typescript-formatter/compare/1.0.0...v1.1.0) (2015-10-14)


### Bug Fixes

* **tsfmt:** replace line delimiter to formatOptions.NewLineCharacter fixes #26 ([8d84ddb](https://github.com/vvakame/typescript-formatter/commit/8d84ddb)), closes [#26](https://github.com/vvakame/typescript-formatter/issues/26)

### Features

* **example:** update example, support typescript-formatter@1.0.0 ([dd283b3](https://github.com/vvakame/typescript-formatter/commit/dd283b3))
* **tsfmt:** add support for filesGlob. thanks @ximenean #25 ([bf9f704](https://github.com/vvakame/typescript-formatter/commit/bf9f704))
* **tsfmt:** support newline char settings from tsconfig.json ([d618ee8](https://github.com/vvakame/typescript-formatter/commit/d618ee8))

<a name="1.0.0"></a>
# [1.0.0](https://github.com/vvakame/typescript-formatter/compare/0.4.3...v1.0.0) (2015-09-22)


### Features

* **ci:** use `sudo: false` and switch to node.js v4 ([29b0f45](https://github.com/vvakame/typescript-formatter/commit/29b0f45))
* **tsfmt:** add baseDir options closes #23 ([b69c4b6](https://github.com/vvakame/typescript-formatter/commit/b69c4b6)), closes [#23](https://github.com/vvakame/typescript-formatter/issues/23)
* **tsfmt:** add tsconfig.json support. thanks @robertknight #22 ([cb52bd4](https://github.com/vvakame/typescript-formatter/commit/cb52bd4))
* **tsfmt:** change tsc version specied. strict to loose. ([ea4401c](https://github.com/vvakame/typescript-formatter/commit/ea4401c))
* **tsfmt:** fix many issue by @myitcv #24 ([d0f2719](https://github.com/vvakame/typescript-formatter/commit/d0f2719)), closes [#24](https://github.com/vvakame/typescript-formatter/issues/24)
* **tsfmt:** pass Options object to providers ([c425bac](https://github.com/vvakame/typescript-formatter/commit/c425bac))
* **tsfmt:** refactor to es6 style ([2941857](https://github.com/vvakame/typescript-formatter/commit/2941857))
* **tsfmt:** update dependencies, switch to typescript@1.6.2, change build process (tsconfig. ([d8f5670](https://github.com/vvakame/typescript-formatter/commit/d8f5670))



<a name="0.4.3"></a>
## 0.4.3 (2015-08-04)


### Features

* **tsfmt:** pass specified file name to typescript language service. support tsx files. ([b9196e9](https://github.com/vvakame/typescript-formatter/commit/b9196e9))



<a name="0.4.2"></a>
## 0.4.2 (2015-07-26)


### Bug Fixes

* **tsfmt:** remove trailing white chars and add linefeed ([3843e40](https://github.com/vvakame/typescript-formatter/commit/3843e40))



<a name"0.4.0"></a>
## 0.4.0 (2015-06-28)


#### Features

* **tsfmt:** support --verify option ([8dd0f8ee](https://github.com/vvakame/typescript-formatter/commit/8dd0f8ee), closes [#15](https://github.com/vvakame/typescript-formatter/issues/15))


<a name"0.3.2"></a>
### 0.3.2 (2015-05-08)


#### Features

* **tsfmt:** change --stdio option to do not required fileName ([32055514](https://github.com/vvakame/typescript-formatter/commit/32055514))


<a name"0.3.1"></a>
### 0.3.1 (2015-05-06)


#### Features

* **tsfmt:** support typescript@1.5.0-beta ([a5f7f19a](https://github.com/vvakame/typescript-formatter/commit/a5f7f19a))


<a name="0.3.0"></a>
## 0.3.0 (2015-03-22)


#### Features

* **tsfmt:** support --stdin option refs #9 ([e322fc74](git@github.com:vvakame/typescript-formatter/commit/e322fc74eb4b62f908a8a7c0f8c0c736bd933631))


<a name="0.2.2"></a>
### 0.2.2 (2015-02-24)


#### Bug Fixes

* **tsfmt:** fix .d.ts file generation refs #7 ([f5520ec6](git@github.com:vvakame/typescript-formatter/commit/f5520ec65c2a034c40884e07276abc4a9a210ca9))


<a name="0.2.1"></a>
### 0.2.1 (2015-02-18)


#### Features

* **tsfmt:** add grunt-dts-bundle and generate typescript-formatter.d.ts ([c846cf37](git@github.com:vvakame/typescript-formatter/commit/c846cf3762982b9bb23bc6b617155488c125d2ad))


<a name="0.2.0"></a>
## 0.2.0 (2015-02-14)

TypeScript 1.4.1 support!

#### Bug Fixes

* **deps:**
  * bump editorconfig version ([68140595](git@github.com:vvakame/typescript-formatter/commit/681405952ed68071cd97d5358bc0fb153f76d841))
  * remove jquery.d.ts dependency ([ae3b52c6](git@github.com:vvakame/typescript-formatter/commit/ae3b52c6faa69bec862f370fc6dd8e86e429a92d))


#### Features

* **deps:**
  * add grunt-conventional-chagelog ([bbe79771](git@github.com:vvakame/typescript-formatter/commit/bbe797712227c0ce6a70bf2e7baf95e41f939126))
  * remove grunt-espower and add espower-loader, refactor project ([4f213464](git@github.com:vvakame/typescript-formatter/commit/4f21346472cca229c089dd91abd65667c03c6c66))
* **grunt:** remove TypeScript compiler specified ([b241945a](git@github.com:vvakame/typescript-formatter/commit/b241945a13e77ca1db25fdb35d1dd4e9ba3dff27))
* **tsfmt:** add typescript package to dependencies and remove typescript-toolbox submodule ([48d176e9](git@github.com:vvakame/typescript-formatter/commit/48d176e967e67ec41aef2402f299fd99330cde33))
