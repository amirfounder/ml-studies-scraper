const log = (message) => {
  chrome?.runtime?.sendMessage({method: 'log', message})
}

log('Tab opened! Script starting ...')

const INTERVAL_MS = 500
const SESSION_ID = new Date().valueOf().toString()
const PAGE_URL = window.location.href

let time_elapsed_ms = 0
let prev_mutations_observed = 0
let new_mutations_observed = 0

const observer = new MutationObserver((mutations, _) => {
  new_mutations_observed += mutations.length
})

const sendRequest = () => {
  const body = {
    scraped_at: new Date().toISOString(),
    html: new XMLSerializer().serializeToString(document),
    url: PAGE_URL,
    session_id: SESSION_ID,
    dom_changes_observed: new_mutations_observed - prev_mutations_observed,
    ms_elapsed_on_webpage: time_elapsed_ms
  }
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  }

  log('Sending request : ' + JSON.stringify({time_elapsed_ms, session_id: SESSION_ID, page_url: PAGE_URL }))

  fetch('http://localhost:8082/save-html', {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log(err)
    })
}

const timeout_handler = () => {
  if (time_elapsed_ms >= 10 * 1000 || !PAGE_URL.startsWith('http')) {
    log('Script Complete! Closing tab ...')
    chrome?.runtime?.sendMessage({method: 'close_tab'})
  }
  time_elapsed_ms += INTERVAL_MS
  sendRequest()
  prev_mutations_observed = new_mutations_observed
  setTimeout(timeout_handler, INTERVAL_MS)
}

observer.observe(document, {
  attributes: true,
  childList: true,
  characterData: true,
  subtree: true
})

setTimeout(timeout_handler, INTERVAL_MS)
