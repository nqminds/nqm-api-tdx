# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Dependencies

- Bump semver of dependencies:
  - @nqminds/nqm-core-utils: ^0.5.9
  - base-64: ^1.0.0
  - cross-fetch: ^3.1.2
  - debug: ^4.3.1
- Update devDepdencies to work with NPM v7 `npm install`:
  - Replace babel-cli with @babel/cli: ^7.13.14
  - webpack: ^5.28.0

## [0.9.1] - 2019-08-05
### Changed
- add optional `storeSize` argument to setResourceStore

## [0.9.0] - 2019-08-04
### Changed
- fileUpload - Simplify the response handling for fileUpload
- upsertMany - deprecated in favour of patchMany
- switched to jest test framework

## [0.8.1] - 2019-07-31
### Added
- setResourceStore method - You are unlikely to need to use this method, primarily reserved for system use.

## [0.8.0] - 2019-07-08
### Changed
- Minor version aligned with [@nqminds/nqm-tdx-client](https://github.com/nqminds/nqm-tdx-client).
- All GET requests are now sent with no-cache headers.