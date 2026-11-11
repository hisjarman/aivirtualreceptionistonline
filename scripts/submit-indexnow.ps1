# Submit all public URLs in the live Star69AI sitemap to IndexNow.
# Run after the repository changes are deployed and the key file is publicly reachable.
$ErrorActionPreference = "Stop"
$HostName = "star69ai.com"
$Key = "c2bce683c78de699b10abff8601ac838"
$SitemapUrl = "https://$HostName/sitemap.xml"
$KeyLocation = "https://$HostName/$Key.txt"

Write-Host "Checking IndexNow key file..."
$keyResponse = Invoke-WebRequest -Uri $KeyLocation -Method Get
if ($keyResponse.StatusCode -ne 200 -or $keyResponse.Content.Trim() -ne $Key) {
    throw "IndexNow key verification file is not available or its contents do not match. Deploy the site first."
}

Write-Host "Reading public sitemap..."
[xml]$sitemap = (Invoke-WebRequest -Uri $SitemapUrl -Method Get).Content
$urls = @($sitemap.urlset.url | ForEach-Object { [string]$_.loc } | Where-Object { $_ -like "https://$HostName/*" })
if ($urls.Count -eq 0) { throw "No public URLs were found in the sitemap." }

$body = @{
    host = $HostName
    key = $Key
    keyLocation = $KeyLocation
    urlList = $urls
} | ConvertTo-Json -Depth 5

Write-Host "Submitting $($urls.Count) URLs to IndexNow..."
$response = Invoke-WebRequest -Uri "https://api.indexnow.org/indexnow" -Method Post -ContentType "application/json; charset=utf-8" -Body $body
Write-Host "IndexNow response: HTTP $($response.StatusCode)"
Write-Host "Submitted $($urls.Count) URLs. Submission is a notification, not a guarantee of indexing."
