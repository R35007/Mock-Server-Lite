let resources = {};
let rewriters = {};

let totalRoutesCount = 0;
let filteredRoutesCount = 0;

const $container = document.getElementById("container");
const $resourcesContainer = document.getElementById("resources-container");
const $dataContainer = document.getElementById("data-container");
const $rewritersContainer = document.getElementById("rewriters-container");
const $resourcesList = document.getElementById("resources-list");
const $rewritersList = document.getElementById("rewriters-list");
const $resourcesCount = document.getElementById("resources-count");
const $search = document.getElementById("search");
const $frameloader = document.getElementById("iframe-loader");
const $iframeData = document.getElementById("iframe-data");
const $download = document.getElementById("download");
const $toast = document.getElementById("toast");
const $resourceRedirect = document.getElementById("resource-redirect");
const $iframeUrl = document.getElementById("iframe-url");

let $bsToast;

try {
  $bsToast = new bootstrap.Toast($toast, { animation: true, delay: 2000 });
} catch {
  $bsToast = {};
}