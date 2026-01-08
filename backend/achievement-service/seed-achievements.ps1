# Achievement Service - Seed Data Script (PowerShell)
# Crea 10 logros predefinidos para pruebas

Write-Host "🌱 Seeding Achievement Service con 10 logros de prueba..." -ForegroundColor Green
Write-Host ""

$BaseUrl = "http://localhost:3002/api/achievements"

$Achievements = @(
    @{code="FIRST_BLOOD"; titleKey="achievement.first_blood.title"; descriptionKey="achievement.first_blood.description"; requiredValue=1; eventType="MONSTER_KILLED"; isTemporal=$false; isActive=$true},
    @{code="MONSTER_SLAYER_10"; titleKey="achievement.monster_slayer_10.title"; descriptionKey="achievement.monster_slayer_10.description"; requiredValue=10; eventType="MONSTER_KILLED"; isTemporal=$false; isActive=$true},
    @{code="MONSTER_SLAYER_50"; titleKey="achievement.monster_slayer_50.title"; descriptionKey="achievement.monster_slayer_50.description"; requiredValue=50; eventType="MONSTER_KILLED"; isTemporal=$false; isActive=$true},
    @{code="MONSTER_SLAYER_100"; titleKey="achievement.monster_slayer_100.title"; descriptionKey="achievement.monster_slayer_100.description"; requiredValue=100; eventType="MONSTER_KILLED"; isTemporal=$false; isActive=$true},
    @{code="TIME_PLAYED_1H"; titleKey="achievement.time_played_1h.title"; descriptionKey="achievement.time_played_1h.description"; requiredValue=60; eventType="TIME_PLAYED"; isTemporal=$false; isActive=$true},
    @{code="TIME_PLAYED_5H"; titleKey="achievement.time_played_5h.title"; descriptionKey="achievement.time_played_5h.description"; requiredValue=300; eventType="TIME_PLAYED"; isTemporal=$false; isActive=$true},
    @{code="TIME_PLAYED_10H"; titleKey="achievement.time_played_10h.title"; descriptionKey="achievement.time_played_10h.description"; requiredValue=600; eventType="TIME_PLAYED"; isTemporal=$false; isActive=$true},
    @{code="WEEKEND_WARRIOR"; titleKey="achievement.weekend_warrior.title"; descriptionKey="achievement.weekend_warrior.description"; requiredValue=20; eventType="MONSTER_KILLED"; isTemporal=$true; temporalWindowStart="2025-12-01T00:00:00Z"; temporalWindowEnd="2025-12-15T23:59:59Z"; isActive=$true},
    @{code="SPEED_RACER"; titleKey="achievement.speed_racer.title"; descriptionKey="achievement.speed_racer.description"; requiredValue=30; eventType="MONSTER_KILLED"; isTemporal=$true; temporalWindowStart="2026-01-05T00:00:00Z"; temporalWindowEnd="2026-01-10T23:59:59Z"; isActive=$true},
    @{code="LEGENDARY_HUNTER"; titleKey="achievement.legendary_hunter.title"; descriptionKey="achievement.legendary_hunter.description"; requiredValue=500; eventType="MONSTER_KILLED"; isTemporal=$false; isActive=$true}
)

$count = 0
foreach ($achievement in $Achievements) {
    $count++
    Write-Host "📤 Creando logro $count/10..." -ForegroundColor Cyan
    
    try {
        $jsonBody = $achievement | ConvertTo-Json
        $response = Invoke-RestMethod -Uri $BaseUrl -Method Post -ContentType "application/json" -Body $jsonBody
        Write-Host "   ✅ Creado: $($response.code)" -ForegroundColor Green
    }
    catch {
        Write-Host "   ⚠️  $($achievement.code) puede que ya exista" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Seed completado!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifica con:" -ForegroundColor Cyan
Write-Host "  Invoke-RestMethod -Uri http://localhost:3002/api/achievements -Method Get"
