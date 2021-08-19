
function toggleInfoBox(id) {
  const $li = document.getElementById(id);
  const classList = $li.classList;
  classList.contains("expanded") ? hideInfoBox($li) : showInfoBox($li, id);
}

function hideInfoBox($li) {
  $li.classList.remove("expanded");
  $li.removeChild($li.lastElementChild);
}

function showInfoBox($li, id) {
  const [routePath, routeConfig] = findEntry(id);

  $li.classList.add("expanded");
  $li.appendChild(
    parseHTML(`
    <div class="info-box position-relative overflow=hidden">
      <div class="route-config">${expandObject(routeConfig, routeConfig.id)}</div>
    </div>`)
  );
}

function expandObject(obj, id) {
  return Object.entries(orderRouteConfig(obj)).map(([key, val]) => getKeyVal(key, val, id)).join("")
}

function getKeyVal(key, val, id) {
  if ((!ObjectKeys.includes(key) && !(val + '')?.length) || val === null || val === undefined || key === "_config") return '';

  if (!ObjectKeys.includes(key) && Array.isArray(val) && val.every(v => typeof v === "string")) {
    if (!val.length) return '';
    return `
      <div class="row px-3">
        <label for="inputEmail3" class="key col col-form-label p-0">${key} :</label>
        <div class="val col d-flex flex-wrap align-items-center" style="grid-gap:.5rem">
        ${getBadges(val).join("")}
        </div>
      </div>`;
  } else if (typeof val === "object" || ObjectKeys.includes(key)) {
    return `
    <div class="row px-3">
      <label for="inputEmail3" class="key col col-form-label p-0 mb-2 w-100" style="max-width: 100%">
      <button class="btn btn-white text-primary p-0 box-shadow-none" type="button" 
      data-bs-toggle="collapse" data-bs-target="#${id}_${key}" 
      aria-expanded="false" aria-controls="${id}_${key}">
        ${key} :
      </button>  
      <div class="val col-12 collapse" id="${id}_${key}">
        <pre class="form-control">${typeof val === 'object' ? JSON.stringify(val, null, 2) : val}</pre>
      </div>
    </div>`;
  } else {
    if (!(val + "").trim().length) return '';
    return `
      <div class="row px-3">
        <label for="inputEmail3" class="key col col-form-label p-0">${key} :</label>
        <div class="val col">${val}</div>
      </div>`;
  }
}

const ObjectKeys = ["mock", "store"];