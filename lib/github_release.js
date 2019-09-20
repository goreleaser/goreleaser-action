"use strict";
var GitHubApi = require('github');
var semver = require('semver');
module.exports = function (user, repo, opts) {
    opts = opts || {};
    return new Promise(function (resolve, reject) {
        var github = new GitHubApi({
            // debug: true,
            protocol: 'https',
            host: 'api.github.com',
            headers: {
                'user-agent': 'http://npmjs.com/package/latest-github-tag' // required, can be whatever
            },
            timeout: opts.timeout || 5000
        });
        if (opts.auth) {
            github.authenticate(opts.auth);
        }
        github.repos.getTags({
            user: user,
            repo: repo
        }, function (err, tags) {
            if (err) {
                return reject(err);
            }
            if (!tags.length) {
                return reject(new Error('No tags found for ' + user + '/' + repo));
            }
            var tagsSorted = tags.map(function (item) {
                return item.name;
            })
                .filter(semver.valid)
                .sort(semver.rcompare);
            resolve(tagsSorted[0]);
        });
    });
};
