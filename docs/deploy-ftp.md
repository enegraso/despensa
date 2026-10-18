# Deploy — FTP / SSH

## Frontend (FTP)

| Campo | Valor |
|-------|-------|
| Server | `ftp.sib-2000.com.ar` |
| Usuario | `sib2000_iagent` |
| Password | *(guardada en gestor de contraseñas / Bitvise)* |
| Ruta FTP | `/home/sib2000_iagent/despensa` |
| URL pública | `https://sib-2000.com.ar/despensa` |

> **Nota**: la ruta FTP completa es `/home/sib2000_iagent/despensa`, no `/despensa`. El servidor home del usuario ya contiene el directorio.

## Proceso de deploy (frontend)

```bash
# 1. Build
cd frontend
npm run build

# 2. Subir archivos del dist/
# Usar la ruta FTP completa, NO solo /despensa
BASE="ftp://ftp.sib-2000.com.ar/home/sib2000_iagent/despensa"
USER="sib2000_iagent"
PASS="TU_PASSWORD"  # valor de .env.production o gestor de contraseñas

curl -T dist/index.html --user "$USER:$PASS" "$BASE/index.html"
curl -T dist/assets/index-*.css --user "$USER:$PASS" "$BASE/assets/"
curl -T dist/assets/index-*.js --user "$USER:$PASS" "$BASE/assets/"
curl -T dist/favicon.svg --user "$USER:$PASS" "$BASE/favicon.svg"
curl -T dist/icons.svg --user "$USER:$PASS" "$BASE/icons.svg"
```

### PowerShell (este equipo)

```powershell
$cred = "sib2000_iagent:TU_PASSWORD"
$base = "ftp://ftp.sib-2000.com.ar/home/sib2000_iagent/despensa"
curl.exe -T "dist\index.html" --user $cred "$base/index.html"
curl.exe -T "dist\assets\index-CSS.css" --user $cred "$base/assets/index-CSS.css"
curl.exe -T "dist\assets\index-JS.js" --user $cred "$base/assets/index-JS.js"
```

## Backend (SSH)

| Campo | Valor |
|-------|-------|
| Server | `66.97.34.227` |
| Puerto | `5469` |
| Usuario | `root` |
| Password | *(guardada en gestor de contraseñas / Bitvise)* |
| Ruta remota | `/root/projects/despensa` |

### Conexión

```bash
# Puerto SSH no estándar: 5469
ssh -p 5469 root@66.97.34.227
```

### Perfil Bitvise

El perfil Bitvise en `C:\Users\Federico\Documents\vpsback-donweb.tlp` contiene la conexión guardada. La contraseña está encriptada con formato propio de Bitvise (no DPAPI estándar), no extraíble por script.

## Verificación post-deploy

```bash
# Chequear que el index.html referencie el bundle nuevo
curl -s https://sib-2000.com.ar/despensa/ | grep "index-.*\.js"
```

## Notas

- Los hashes de los archivos cambian en cada build (`index-<hash>.js`). El index.html siempre debe subirse **junto** con los assets nuevos.
- Si el navegador muestra la versión vieja, puede ser cache del browser — probar en incógnito.
- FTP `MKD` en raíz falla (permisos). El directorio `/home/sib2000_iagent/despensa` ya existe.
