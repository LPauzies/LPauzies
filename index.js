// index.js
const Mustache = require("mustache");
const fs = require("fs");
const request = require("sync-request");
const MUSTACHE_MAIN_DIR = "./main.mustache";

/* Some logic here */
function generateDataForRepository(repository) {
  var path = "LPauzies/" + repository;
  var apiEndPoint = "https://api.github.com/repos/" + path;
  var headers = {
    "User-Agent": "request",
  };
  res = request("GET", apiEndPoint, { headers });
  var body = JSON.parse(res.getBody("utf8"));
  return {
    name: repository,
    link: body.svn_url,
    language: body.language,
    path: path,
    description: body.description,
  };
}

function getRepositories() {
  var apiEndPoint = "https://api.github.com/users/LPauzies/repos";
  var headers = {
    "User-Agent": "request",
  };
  res = request("GET", apiEndPoint, { headers });
  var repos = JSON.parse(res.getBody("utf8"))
    .filter(
      (e) => e.stargazers_count > 0 && !e.private && !e.archived && !e.disabled
    )
    .sort((e1, e2) => e2.stargazers_count - e1.stargazers_count)
    .map((e) => e.name)
    .slice(0, 5);
  return repos;
}

function readJSON(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

/**
 * DATA is the object that contains all
 * the data to be provided to Mustache
 * Notice the "name" and "date" property.
 */
let DATA = {
  name: "Lucas Pauzies",
  age: Math.abs(
    new Date(new Date() - new Date("11/25/1996")).getUTCFullYear() - 1970
  ),
  experience: Math.abs(
    new Date(new Date() - new Date("09/01/2018")).getUTCFullYear() - 1970
  ),
  date: new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "Europe/Paris",
  }),
  languages: readJSON("assets/data/languages.json"),
  frameworks: readJSON("assets/data/frameworks.json"),
  ai: readJSON("assets/data/ai.json"),
  front: readJSON("assets/data/front.json"),
  cicd: readJSON("assets/data/cicd.json"),
  cloud: readJSON("assets/data/cloud.json"),
  container: readJSON("assets/data/container.json"),
  database: readJSON("assets/data/database.json"),
  versionning: readJSON("assets/data/versionning.json"),
  projects: getRepositories().map((repo) => generateDataForRepository(repo)),
};
/**
 * A - We open 'main.mustache'
 * B - We ask Mustache to render our file with the data
 * C - We create a README.md file with the generated output
 */
function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync("README.md", output);
  });
}

generateReadMe();
