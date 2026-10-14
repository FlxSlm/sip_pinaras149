# Read-only comparison; the entered password is passed through stdin, never an argument or environment variable.
$ErrorActionPreference = 'Stop'
$credentialSecure = $null
$credentialPointer = [IntPtr]::Zero
$credentialPlain = $null
$credentialJson = $null
$checkProcess = $null
try {
    $workspacePath = Split-Path -Parent $PSScriptRoot
    $checkScriptPath = Join-Path $PSScriptRoot 'check-admin-login.mjs'
    $credentialSecure = Read-Host 'Password admin yang ingin diperiksa (input tersembunyi)' -AsSecureString
    $credentialPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($credentialSecure)
    $credentialPlain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($credentialPointer)
    # ASCII-only JSON escapes preserve every UTF-16 code unit across Windows terminal encodings.
    $credentialJson = '"' + (($credentialPlain.ToCharArray() | ForEach-Object { '\u{0:x4}' -f [int][char]$_ }) -join '') + '"'
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = (Get-Command node.exe).Source
    $processInfo.Arguments = '"' + $checkScriptPath + '" --password-stdin'
    $processInfo.WorkingDirectory = $workspacePath
    $processInfo.UseShellExecute = $false
    $processInfo.CreateNoWindow = $true
    $processInfo.RedirectStandardInput = $true
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $checkProcess = New-Object System.Diagnostics.Process
    $checkProcess.StartInfo = $processInfo
    if (-not $checkProcess.Start()) { throw 'start-failed' }
    $checkProcess.StandardInput.WriteLine($credentialJson)
    $checkProcess.StandardInput.Close()
    $credentialPlain = $null
    $credentialJson = $null
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($credentialPointer)
    $credentialPointer = [IntPtr]::Zero
    $credentialSecure.Dispose()
    $credentialSecure = $null
    $safeOutput = $checkProcess.StandardOutput.ReadToEnd()
    $null = $checkProcess.StandardError.ReadToEnd()
    $checkProcess.WaitForExit()
    if ($checkProcess.ExitCode -ne 0) { throw 'check-failed' }
    $checkResult = ConvertFrom-Json -InputObject $safeOutput
    foreach ($targetName in @('local', 'neon')) {
        $targetResult = $checkResult.$targetName
        if ($targetResult.connectionOrInspectionFailed) {
            Write-Host ($targetName + ': koneksi atau pemeriksaan gagal.')
        } elseif ($null -eq $targetResult.passwordMatches) {
            Write-Host ($targetName + ': password tidak dapat diperiksa.')
        } else {
            $matchLabel = if ($targetResult.passwordMatches) { 'cocok' } else { 'tidak cocok' }
            Write-Host ($targetName + ': password ' + $matchLabel + '.')
        }
    }
} catch { Write-Host 'Pemeriksaan belum berhasil. Tidak ada password atau data database yang diubah.' }
finally {
    $credentialPlain = $null
    $credentialJson = $null
    if ($credentialPointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($credentialPointer) }
    if ($credentialSecure) { $credentialSecure.Dispose() }
    if ($checkProcess) { $checkProcess.Dispose() }
}
