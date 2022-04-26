console.log('Content script starting ...' + new Date().toISOString())

const INTERVAL_MS = 500
const SESSION_ID = new Date().valueOf().toString()

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
    url: window.location.href,
    session_id: SESSION_ID,
    page_changes_observed: new_mutations_observed - prev_mutations_observed > 0,
    ms_elapsed_on_webpage: time_elapsed_ms
  }
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  }
  console.log(body, headers)

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
  time_elapsed_ms += INTERVAL_MS
  if (time_elapsed_ms <= 15 * 1000) {
    sendRequest()
    setTimeout(timeout_handler, INTERVAL_MS)
  }
  prev_mutations_observed = new_mutations_observed
}

observer.observe(document, {
  attributes: true,
  childList: true,
  characterData: true,
  subtree: true
})

setTimeout(timeout_handler, INTERVAL_MS)