// index.js
const Mustache = require('mustache');
const fs = require('fs');
const request = require('sync-request');
const MUSTACHE_MAIN_DIR = './main.mustache';

/* Some logic here */
function generateDataForRepository(repository) {
    var path = "LPauzies/" + repository;
    var apiEndPoint = "https://api.github.com/repos/" + path;
    var headers = {
          'User-Agent': 'request'
        };
    res = request("GET", apiEndPoint, { headers });
    var body = JSON.parse(res.getBody('utf8'));
    return {
        name: repository,
        link: body.svn_url,
        language: body.language,
        path: path,
        description: body.description
    };
}

function getRepositories() {
    var apiEndPoint = "https://api.github.com/users/LPauzies/repos";
    var headers = {
          'User-Agent': 'request'
        };
    res = request("GET", apiEndPoint, { headers });
    var repos = JSON.parse(res.getBody('utf8'))
        .filter(e => e.stargazers_count > 0 && !e.private && !e.archived && !e.disabled)
        .sort((e1, e2) => e2.stargazers_count - e1.stargazers_count)
        .map(e => e.name)
        .slice(0, 5);
    return repos;
}

/**
  * DATA is the object that contains all
  * the data to be provided to Mustache
  * Notice the "name" and "date" property.
*/
let DATA = {
  name: 'Lucas Pauzies',
  date: new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'Europe/Paris',
  }),
  projects: getRepositories().map(repo => generateDataForRepository(repo))
};
/**
  * A - We open 'main.mustache'
  * B - We ask Mustache to render our file with the data
  * C - We create a README.md file with the generated output
  */
function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) =>  {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}

generateReadMe();