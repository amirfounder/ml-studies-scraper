let logs = {}


const flush_logs = async (session_id) => {
  const logs_to_flush = logs[session_id]
  await fetch('http://localhost:8082/save-logs', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({ logs: logs_to_flush })
  })
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log(err)
    })
  delete logs[session_id]
}


const log = (session_id, message) => {
  let level = 'INFO'
  let msg = new Date().toISOString().padEnd(30)
  msg += level.padEnd(10)
  msg += message
  
  console.log(msg)
  if (session_id in logs) {
    logs[session_id].push(msg)
  } else {
    logs[session_id] = [msg]
  }
}


chrome.runtime.onMessage.addListener(async (request, sender, _sendResponse) => {
  if (request?.method == 'log') {
    log(request.session_id, request?.message)
  }
  if (request?.method == 'close_tab') {
    chrome.tabs.remove(sender.tab?.id)
  }
  if (request?.method == 'flush_logs') {
    await flush_logs(request.session_id)
  }
})
