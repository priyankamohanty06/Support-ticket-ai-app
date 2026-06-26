$root = 'C:\Users\priya\Documents\support-ticket-ai-app'
$prefix = 'http://127.0.0.1:8002/'
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $root at $prefix"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $path = $context.Request.Url.AbsolutePath
    if ($path -eq '/') { $path = '/index.html' }
    $relative = $path.TrimStart('/')
    $fullPath = Join-Path $root $relative

    if ($relative -and (Test-Path $fullPath -PathType Leaf)) {
      $bytes = [System.IO.File]::ReadAllBytes($fullPath)
      $extension = [System.IO.Path]::GetExtension($fullPath)
      $contentType = switch ($extension) {
        '.html' { 'text/html; charset=utf-8' }
        '.css' { 'text/css; charset=utf-8' }
        '.js' { 'application/javascript; charset=utf-8' }
        '.json' { 'application/json; charset=utf-8' }
        default { 'application/octet-stream' }
      }
      $context.Response.ContentType = $contentType
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
    else {
      $context.Response.StatusCode = 404
      $body = [System.Text.Encoding]::UTF8.GetBytes('Not found')
      $context.Response.ContentLength64 = $body.Length
      $context.Response.OutputStream.Write($body, 0, $body.Length)
    }

    $context.Response.Close()
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
