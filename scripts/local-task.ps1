# Alternativa LOCAL a GitHub Actions: corre la actividad diaria desde tu PC Windows.
# Util si el repo es privado en plan que no permite Actions, o si preferis no usar cron en la nube.
#
# Setup (una vez):
#   1) Edita $RepoPath y $AuthorEmail abajo.
#   2) Corre este script con -Install para crear la Tarea Programada diaria.
#   3) Listo: cada dia a la hora elegida hace N commits y pushea.

param(
  [switch]$Install,
  [switch]$Run,
  [string]$RepoPath   = "C:\Users\msciarrillo\Devs\daily-green-site",
  [string]$AuthorEmail = "msciarrillo@microsoft.com",   # <-- email VERIFICADO en GitHub
  [string]$AuthorName  = "Martin Sciarrillo",
  [int]$CommitsPerDay  = 4,
  [string]$AtTime      = "09:10"
)

function Invoke-DailyGreen {
  Push-Location $RepoPath
  try {
    git config user.email $AuthorEmail
    git config user.name  $AuthorName
    for ($i = 1; $i -le $CommitsPerDay; $i++) {
      node scripts/generate-daily.mjs
      git add -A
      git diff --cached --quiet
      if ($LASTEXITCODE -ne 0) {
        git commit -m "chore(daily): actividad $(Get-Date -Format s) [$i/$CommitsPerDay]"
      }
      Start-Sleep -Seconds 1
    }
    git push
  } finally { Pop-Location }
}

if ($Run) { Invoke-DailyGreen; return }

if ($Install) {
  $action  = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Run"
  $trigger = New-ScheduledTaskTrigger -Daily -At $AtTime
  $set     = New-ScheduledTaskSettingsSet -StartWhenAvailable -WakeToRun
  Register-ScheduledTask -TaskName "DailyGreen" -Action $action -Trigger $trigger `
    -Settings $set -Description "Actividad diaria para grafico verde de GitHub" -Force
  Write-Host "Tarea 'DailyGreen' instalada. Corre cada dia a las $AtTime."
  return
}

Write-Host "Usa -Install para programar la tarea, o -Run para ejecutarla ahora."
