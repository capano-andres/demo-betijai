$f = "c:\Users\capan\Desktop\Trabajo\GARGANO\src\components\Formulario.jsx"
$lines = [System.IO.File]::ReadAllLines($f, [System.Text.Encoding]::UTF8)

# Fix the broken template literal on the price line (0-indexed 1442)
# Original broken: `(${...} dia${... > 1 ? 's' : '} x $...)`
# Fixed:           `(${...} dia${... > 1 ? 's' : ''} x $...)`
$fixed = "                ? " + '`' + '(${precioTotal / precioPorDia} dia${precioTotal / precioPorDia > 1 ? ' + "'s'" + " : " + "''" + '} x $${precioPorDia.toLocaleString()})' + '`'
$lines[1442] = $fixed

[System.IO.File]::WriteAllLines($f, $lines, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Done"
