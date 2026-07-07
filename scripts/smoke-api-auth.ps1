param(
  [string]$DevBase = 'http://localhost:8080',
  [string]$ProdBase = 'http://192.168.2.1:8081/web'
)

$targets = @(
  @{ Name = 'dev'; Base = $DevBase },
  @{ Name = 'prod'; Base = $ProdBase }
)

$paths = @('/auth/me', '/auth/login', '/v3/api-docs', '/api/jobs')
$results = @()

foreach ($target in $targets) {
  foreach ($path in $paths) {
    $url = "$($target.Base)$path"

    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $url -Method Get -TimeoutSec 8 -MaximumRedirection 0 -ErrorAction Stop
      $results += [pscustomobject]@{
        target = $target.Name
        url = $url
        reachable = $true
        status = $response.StatusCode
        note = 'OK'
      }
    } catch {
      $status = $null
      if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
        $status = [int]$_.Exception.Response.StatusCode
      }

      $results += [pscustomobject]@{
        target = $target.Name
        url = $url
        reachable = $false
        status = $status
        note = $_.Exception.Message
      }
    }
  }
}

$results | ConvertTo-Json -Depth 3
