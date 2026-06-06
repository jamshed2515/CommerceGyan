# Seed Demo Data for Schedule Management
$API = "http://localhost:5000"

# 1. Login
$loginBody = '{"email":"commercegiyan@gmail.com","password":"CommerceGiyan@Admin123"}'
$loginResp = Invoke-RestMethod -Uri "$API/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$token = $loginResp.token
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

Write-Host "✅ Logged in as admin" -ForegroundColor Green

# 2. Create Batches
$batchNames = @("Class 9", "Class 10", "Class 12", "Class 11", "English Spoken", "Competition Class")
$batchIds = @{}

foreach ($name in $batchNames) {
    $body = "{`"batchName`":`"$name`"}"
    try {
        $resp = Invoke-RestMethod -Uri "$API/api/batches" -Method POST -Headers $headers -Body $body
        $batchIds[$name] = $resp.batch._id
        Write-Host "✅ Batch created: $name -> $($resp.batch._id)" -ForegroundColor Cyan
    } catch {
        # May already exist — fetch existing
        $all = Invoke-RestMethod -Uri "$API/api/batches" -Headers $headers
        $existing = $all | Where-Object { $_.batchName -eq $name }
        if ($existing) {
            $batchIds[$name] = $existing._id
            Write-Host "ℹ️  Batch exists: $name -> $($existing._id)" -ForegroundColor Yellow
        }
    }
}

# 3. Create Schedules
$schedules = @(
    @{ batch = $batchIds["Class 9"];          subject = "Science";  dayOfWeek = "Monday";    startTime = "15:30"; endTime = "16:30"; note = "Sweety Maam" },
    @{ batch = $batchIds["Class 10"];         subject = "Maths";    dayOfWeek = "Monday";    startTime = "16:30"; endTime = "17:30"; note = "Suresh Sir" },
    @{ batch = $batchIds["Class 12"];         subject = "Commerce"; dayOfWeek = "Tuesday";   startTime = "17:30"; endTime = "18:30"; note = "Tabarak Sir" },
    @{ batch = $batchIds["Class 11"];         subject = "Commerce"; dayOfWeek = "Tuesday";   startTime = "18:30"; endTime = "19:30"; note = "Tabarak Sir" },
    @{ batch = $batchIds["English Spoken"];   subject = "English";  dayOfWeek = "Wednesday"; startTime = "08:30"; endTime = "10:00"; note = "Hamza Sir" },
    @{ batch = $batchIds["Competition Class"]; subject = "General"; dayOfWeek = "Wednesday"; startTime = "10:00"; endTime = "11:30"; note = "Sanjay Sir" },
    @{ batch = $batchIds["Class 9"];          subject = "Maths";    dayOfWeek = "Thursday";  startTime = "14:00"; endTime = "15:00"; note = "" },
    @{ batch = $batchIds["Class 10"];         subject = "Science";  dayOfWeek = "Friday";    startTime = "15:00"; endTime = "16:00"; note = "" },
    @{ batch = $batchIds["Class 12"];         subject = "Accounts"; dayOfWeek = "Saturday";  startTime = "09:00"; endTime = "10:30"; note = "" }
)

foreach ($s in $schedules) {
    if (-not $s.batch) { Write-Host "⚠️  Skipping (no batch ID)" -ForegroundColor Red; continue }
    $body = $s | ConvertTo-Json -Compress
    try {
        $resp = Invoke-RestMethod -Uri "$API/api/schedules" -Method POST -Headers $headers -Body $body
        Write-Host "✅ Schedule: $($s.dayOfWeek) | $($s.subject) | $($s.startTime)-$($s.endTime)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed: $($s.subject) - $_" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Seed complete!" -ForegroundColor Magenta
