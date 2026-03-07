$f = "c:\Users\capan\Desktop\Trabajo\GARGANO\src\components\Formulario.jsx"
$lines = [System.IO.File]::ReadAllLines($f, [System.Text.Encoding]::UTF8)

# Fix: pass the correct capitalized label that matches config keys
# Line 1397 (0-indexed 1396): renderDiaFormulario call - pass explicit config key
$lines[1396] = '                    {!readOnly && !esFeriado && (() => { const labelMap = {''lunes'':''Lunes'',''martes'':''Martes'',''miercoles'':''Miercoles'',''jueves'':''Jueves'',''viernes'':''Viernes''}; return renderDiaFormulario(diaKey, labelMap[diaKey] || dia, diaKey); })()}'

# Fix encoding in price line (line 1443, 0-indexed 1442)
$lines[1442] = '                ? `(${precioTotal / precioPorDia} dia${precioTotal / precioPorDia > 1 ? ''s'' : ''} x $${precioPorDia.toLocaleString()})`'

# Fix encoding in "menu bonificado" line (1445, 0-indexed 1444)
$lines[1444] = "                   ? 'Menu bonificado (sin costo)'"

# Fix encoding in "selecciona" line (1446, 0-indexed 1445)
$lines[1445] = "                   : 'Selecciona al menos un menu para ver el precio'}"

# Remove the "tardio" warning message (lines 1431-1435, 0-indexed 1430-1434)
$lines[1430] = ''
$lines[1431] = ''
$lines[1432] = ''
$lines[1433] = ''
$lines[1434] = ''

[System.IO.File]::WriteAllLines($f, $lines, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Done"
