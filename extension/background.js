let logs = []


const flush_logs = () => {
  const logs_copy = JSON.parse(JSON.stringify(logs))
  logs = []
  fetch('http://localhost:8082/save-logs', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({ logs: logs_copy })
  })
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log(err)
    })
}


const log = (message) => {
  let level = 'INFO'
  let msg = new Date().toISOString().padEnd(30)
  msg += level.padEnd(10)
  msg += message
  
  console.log(msg)
  logs.push(msg)
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request?.method == 'log') {
    log(request?.message)
  }
  if (request?.method == 'close_tab') {
    flush_logs()
    chrome.tabs.remove(sender.tab?.id)
  }
  if (request?.method == 'flush_logs') {
    flush_logs()
  }
})
