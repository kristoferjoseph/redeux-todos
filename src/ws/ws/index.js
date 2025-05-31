// src/ws/ws/index.js
// Basic WebSocket handler for Architect
// This will pipe messages from the browser test runner to stdout

exports.handler = async function ws(event) {
  console.log('WebSocket event:', JSON.stringify(event, null, 2));

  const connectionId = event.requestContext.connectionId;

  if (event.requestContext.eventType === 'connect') {
    console.log(\`[WS Connect] ConnectionId: \${connectionId}\`);
    return { statusCode: 200 };
  }

  if (event.requestContext.eventType === 'disconnect') {
    console.log(\`[WS Disconnect] ConnectionId: \${connectionId}\`);
    return { statusCode: 200 };
  }

  if (event.requestContext.eventType === 'message') {
    const body = event.body; // The message from the client
    console.log(\`[WS Message from \${connectionId}]: \${body}\`);
    // Echo back to client (optional) or process
    // For test results, we just want to log them to stdout (which console.log does)
  }

  return { statusCode: 200 };
}
