
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
  const [_routePath, routeConfig] = findEntry(id);

  $li.classList.add("expanded");
  $li.appendChild(
    parseHTML(`
    <div class="info-box position-relative overflow=hidden">
      <div class="route-config">${fieldSet(routeConfig, routeConfig.id)}</div>
      <div class="actions justify-content-end p-2" style="display: ${routeConfig._isDefault ? 'none' : 'flex'}">
        <span role="button" class="px-2 pe-1 action-icon" title="refresh" onclick="refresh('${routeConfig.id}')"><i class="fas fa-sync-alt"></i></span>
      </div>
    </div>`)
  );
}

async function refresh(id) {
  const refreshedRoute = await window.fetch(localhost + "/_db/" + id).then((res) => res.json());
  const [routePath, routeConfig] = Object.entries(refreshedRoute)[0];
  resources[routePath] = routeConfig;
  toggleInfoBox(id);
  toggleInfoBox(id);
  showToast(`${routePath} Refreshed Successfully`);
}

function fieldSet(obj, id) {
  return Object.entries(orderRouteConfig(obj)).map(([key, val]) => {
    if (key === "fetchData" && val) {
      return `<div class="row px-3"><fieldset><legend>Fetch Data</legend>${fieldSet(val, id)}</fieldset></div>`
    } else {
      return getKeyVal(key, val, id);
    }
  }).join("")
}

function getKeyVal(key, val, id) {
  if ((!['mock', 'response'].includes(key) && !(val + '')?.length) || val === null || val === undefined || key === "_config") return '';

  if (!ObjectKeys.includes(key) && Array.isArray(val) && val.every(v => typeof v === "string")) {
    if (!['mock', 'response'].includes(key) && !val.length) return '';
    return `
      <div class="row px-3">
        <label for="inputEmail3" class="key col col-form-label p-0">${key} :</label>
        <div class="val col d-flex flex-wrap align-items-center" style="grid-gap:.5rem">
        ${getBadges(val).join("")}
        </div>
      </div>`;
  } else if (typeof val === "object" || ObjectKeys.includes(key)) {
    if (!['mock', 'response'].includes(key) && !Object.keys(val).length) return ''
    if ((val + "").trim().match(/<img(.*)>$/)) {
      return `
      <div class="row px-3">
        <label class="key col col-form-label p-0">${key} :</label>
        <div class="val col">
          <div class="img">${val}</div>
        </div>
      </div>`;
    }
    return `
    <div class="row px-3">
      <label for="inputEmail3" class="key col col-form-label p-0 mb-2 w-100" style="max-width: 100%">
      <button class="btn btn-white text-primary p-0 box-shadow-none" type="button" 
      data-bs-toggle="collapse" data-bs-target="#id-${id.replace(/\=/g, "")}_${key}" 
      aria-expanded="false" aria-controls="id-${id.replace(/\=/g, "")}_${key}">
        ${key} :
      </button>  
      <div class="val col-12 collapse" id="id-${id.replace(/\=/g, "")}_${key}">
        <pre class="form-control">${typeof val === 'object' ? JSON.stringify(val, null, 2) : val}</pre>
      </div>
    </div>`;
  } else if ((val + "").indexOf("<img") >= 0) {
    return `
    <div class="row px-3">
      <label for="inputEmail3" class="key col col-form-label p-0">${key} :</label>
      <div class="val col">
        <div class="img">${val}</div>
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