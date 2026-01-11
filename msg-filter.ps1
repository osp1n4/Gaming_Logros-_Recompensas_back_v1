# Reads commit message from STDIN, replaces old branch name references, writes to STDOUT
$msg = [Console]::In.ReadToEnd()
$msg = $msg -replace 'featue/front','feature/refactor'
$msg = $msg -replace 'feature/front','feature/refactor'
[Console]::Out.Write($msg)
