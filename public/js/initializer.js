let resources = {};
let rewriters = {};

let totalRoutesCount = 0;
let filteredRoutesCount = 0;

const $container = document.getElementById("container");
const $resourcesContainer = document.getElementById("resources-container");
const $rewritersContainer = document.getElementById("rewriters-container");
const $resourcesList = document.getElementById("resources-list");
const $rewritersList = document.getElementById("rewriters-list");
const $resourcesCount = document.getElementById("resources-count");
const $search = document.getElementById("search");
const $routeConfig = document.getElementById("routeConfig");
const $toast = document.getElementById("toast");

let $bsToast;

try {
  $bsToast = new bootstrap.Toast($toast, { animation: true, delay: 2000 });
} catch {
  $bsToast = {};
}