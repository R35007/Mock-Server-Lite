async function init() {
  try {
    resources = await window.fetch(localhost + "/_db").then((res) => res.json());
  } catch (err) {
    console.log(err);
  }

  try {
    rewriters = await window.fetch(localhost + "/_rewriters").then((res) => res.json());
  } catch (err) {
    console.log(err);
  }
  createResourcesList(resources);
  Object.entries(rewriters).length && createRewritersList(rewriters);
  showToast("Resources Loaded Successfully");
}

function createResourcesList(resources) {
  $search.value = "";

  // collects all expanded list to restore after refresh
  const expandedList = [];
  $resourcesList.querySelectorAll("li.expanded").forEach(li => expandedList.push(li.id));

  // removes all the resources list
  while ($resourcesList.lastElementChild) {
    $resourcesList.removeChild($resourcesList.lastElementChild);
  }

  setDefaultRoutes(resources);
  $resourcesList.innerHTML = ResourceList(resources);

  expandedList.forEach(toggleInfoBox);
}

function createRewritersList(rewriters) {
  $rewritersList.innerHTML = Object.entries(rewriters).map(([key, val]) => {
    return `
    <li class="nav-item w-100 mt-1 overflow-hidden d-block">
      <div class="header d-flex align-items-center w-100" style='filter:grayscale(0.6)'">
        <a class="nav-link py-2 px-4">
          <span class="route-path" style="word-break:break-all">${key}</span>
          <code class="px-2">⇢</code>
          <span class="route-path" style="word-break:break-all">${val}</span>
        </a>
      </div>
    </li>
    `
  }).join("")
  $rewritersContainer.style.display = "block";
}

function setDefaultRoutes(resources) {
  const routesList = Object.keys(resources)

  if (!routesList.includes("/_db"))
    resources["/_db?_clean=true"] = {
      id: "default_1",
      description: "This route gives you the Db snapshot",
      _isDefault: true,
    }

  if (!routesList.includes("/_store"))
    resources["/_store"] = {
      id: "default_2",
      description: "This route gives you the store values",
      _isDefault: true,
    }
}

function ResourceList(resources) {
  totalRoutesCount = Object.keys(resources).length;
  setRoutesCount(totalRoutesCount);

  return `
    ${Object.entries(resources).map((routesEntry) => ResourceItem(...routesEntry)).join("")}
    <li id="no-resource" class="nav-item w-100 mt-2" style="display: none">
      <span class="nav-link p-2 px-3 d-block bg-dark text-light text-center">
        <span> No Resources Found</span>
      </span>
    </li>
  `;
}

function ResourceItem(routePath, routeConfig) {
  return `
  <li id="${routeConfig.id}" class="nav-item w-100 mt-1 overflow-hidden" style="display: block">
    <div class="header d-flex align-items-center w-100" style="${routeConfig._isDefault ? 'filter:grayscale(0.6)' : 'filter:grayscale(0.1)'}">
      <span role="button" class="info-icon action-icon" onclick="toggleInfoBox('${routeConfig.id}')"><span class="icon">i</span></span>  
      <a class="nav-link py-2 pe-3 ps-0" target="_blank" role="button" href="${routePath}">
        <span class="route-path" style="word-break:break-all">${routePath}</span>
      </a>
    </div>
  </li>
`;
}

function filterRoutes() {
  let searchText, routePath, i, txtValue;
  searchText = $search.value.toUpperCase();
  routePath = $resourcesList.querySelectorAll(".route-path");
  filteredRoutesCount = 0;
  for (i = 0; i < routePath.length; i++) {
    txtValue = routePath[i].textContent || routePath[i].innerText;
    if (txtValue.toUpperCase().indexOf(searchText) > -1) {
      routePath[i].parentNode.parentNode.parentNode.style.display = "block";
      filteredRoutesCount++;
    } else {
      routePath[i].parentNode.parentNode.parentNode.style.display = "none";
    }
  }
  setRoutesCount(totalRoutesCount, filteredRoutesCount, searchText);
  showNoResource(!filteredRoutesCount);
}

function setRoutesCount(totalRoutesCount, filteredRoutesCount, searchText) {
  const count = searchText?.length
    ? `${filteredRoutesCount} / ${totalRoutesCount}`
    : totalRoutesCount;
  $resourcesCount.innerHTML = count;
}

function showNoResource(show) {
  document.getElementById("no-resource").style.display = show
    ? "block"
    : "none";
}

init();
