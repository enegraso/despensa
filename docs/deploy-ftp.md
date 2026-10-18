# Deploy — FTP / SSH

> **Credenciales**: están en `.env.deploy` (raíz del repo, gitignored). Nunca commitear.

## Frontend (FTP)

| Campo | Valor |
|-------|-------|
| Server | `ftp.sib-2000.com.ar` |
| Usuario | `sib2000_iagent` |
| Password | *(ver `.env.deploy`)* |
| Ruta FTP | `/home/sib2000_iagent/despensa` |
| URL pública | `https://sib-2000.com.ar/despensa` |

> **Nota**: la ruta FTP completa es `/home/sib2000_iagent/despensa`, no `/despensa`. El servidor home del usuario ya contiene el directorio.

## Proceso de deploy (frontend)

```bash
# 1. Build
cd frontend
npm run build

# 2. Subir archivos del dist/
# Credenciales en .env.deploy (raíz del repo)
set -a; source .env.deploy; set +a
BASE="ftp://${FTP_SERVER}${FTP_PATH}"

curl -T dist/index.html --user "$FTP_USER:$FTP_PASS" "$BASE/index.html"
curl -T dist/assets/index-*.css --user "$FTP_USER:$FTP_PASS" "$BASE/assets/"
curl -T dist/assets/index-*.js --user "$FTP_USER:$FTP_PASS" "$BASE/assets/"
curl -T dist/favicon.svg --user "$FTP_USER:$FTP_PASS" "$BASE/favicon.svg"
curl -T dist/icons.svg --user "$FTP_USER:$FTP_PASS" "$BASE/icons.svg"
```

### PowerShell (este equipo)

```powershell
# Cargar credenciales de .env.deploy
Get-Content .env.deploy | ForEach-Object {
  if ($_ -match '^(\w+)=(.+)$') { Set-Item "env:$($Matches[1])" $Matches[2] }
}
$base = "ftp://$env:FTP_SERVER$env:FTP_PATH"
$cred = "$env:FTP_USER`:$env:FTP_PASS"
curl.exe -T "dist\index.html" --user $cred "$base/index.html"
curl.exe -T "dist\assets\index-HASH.css" --user $cred "$base/assets/index-HASH.css"
curl.exe -T "dist\assets\index-HASH.js" --user $cred "$base/assets/index-HASH.js"
```

## Backend (SSH)

| Campo | Valor |
|-------|-------|
| Server | `66.97.34.227` |
| Puerto | `5469` |
| Usuario | `root` |
| Password | *(ver `.env.deploy`)* |
| Ruta remota | `/root/projects/despensa` |

### Subir cambios al backend

```powershell
# Cargar credenciales
Get-Content .env.deploy | ForEach-Object {
  if ($_ -match '^(\w+)=(.+)$') { Set-Item "env:$($Matches[1])" $Matches[2] }
}

# Subir archivos modificados (ejemplo con pscp/plink de PuTTY)
& "$env:TEMP\pscp.exe" -batch -P $env:SSH_PORT -pw $env:SSH_PASS `
  "backend\controllers\productController.js" "$($env:SSH_USER)@$($env:SSH_HOST):$($env:SSH_PATH)/controllers/"

& "$env:TEMP\plink.exe" -batch -P $env:SSH_PORT -pw $env:SSH_PASS `
  "$($env:SSH_USER)@$($env:SSH_HOST)" "pm2 restart despensa-api --update-env"
```

## Verificación post-deploy

```bash
# Chequear que el index.html referencie el bundle nuevo
curl -s https://sib-2000.com.ar/despensa/ | grep "index-.*\.js"
```

### Verificación y reinicio

```bash
# Conectar y reiniciar el backend
ssh -p 5469 root@66.97.34.227
cd /root/projects/despensa
pm2 restart despensa-api --update-env
```

### Verificar que el backend esté vivo

```bash
# Desde la máquina local
curl -s https://backend.sib-2000.com.ar/backdespen/api/health
```

## Notas

- Los hashes de los archivos cambian en cada build (`index-<hash>.js`). El index.html siempre debe subirse **junto** con los assets nuevos.
- Si el navegador muestra la versión vieja, puede ser cache del browser — probar en incógnito.
- FTP `MKD` en raíz falla (permisos). El directorio `/home/sib2000_iagent/despensa` ya existe.
