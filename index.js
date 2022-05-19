// index.js
const Mustache = require("mustache");
const fs = require("fs");
const request = require("sync-request");
const MUSTACHE_MAIN_DIR = "./main.mustache";

const birthday = "11/25/1996";
const firstExperience = "09/01/2018";

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

function generateBadgeData() {
  return [
    readJSON("assets/data/languages.json"),
    readJSON("assets/data/frameworks.json"),
    readJSON("assets/data/ai.json"),
    readJSON("assets/data/front.json"),
    readJSON("assets/data/database.json"),
    readJSON("assets/data/cloud.json"),
    readJSON("assets/data/versionning.json"),
    readJSON("assets/data/cicd.json"),
    readJSON("assets/data/container.json")
  ];
}

/**
 * DATA is the object that contains all
 * the data to be provided to Mustache
 * Notice the "name" and "date" property.
 */
let DATA = {
  name: "Lucas Pauzies",
  age: Math.abs(
    new Date(new Date() - new Date(birthday)).getUTCFullYear() - 1970
  ),
  experience: Math.abs(
    new Date(new Date() - new Date(firstExperience)).getUTCFullYear() - 1970
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
  badges: generateBadgesData(),
  projects: getRepositories().map((repo) => generateDataForRepository(repo)),
};
/**
 * A - We open 'main.mustache'
 * B - We ask Mustache to render our file with the data
 * C - We create a README.md file with the generated output
 */
function generateReadMe(mustacheData) {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), mustacheData);
    fs.writeFileSync("README.md", output);
  });
}

generateReadMe(DATA);
