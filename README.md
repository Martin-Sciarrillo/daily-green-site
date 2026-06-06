# 🟩 Daily Green — esquema + automatización para poner el gráfico verde verde

Kit listo para usar. Genera **actividad diaria real** en un site de GitHub Pages
(un *Daily Activity Log*) y, de paso, deja tu gráfico de contribuciones verde —
de forma legítima: contenido propio que se commitea solo cada día.

---

## Cómo funciona el color del gráfico (importante)

GitHub usa **5 niveles** de verde y son **relativos a tu día más activo** (cuartiles):

| Nivel | Color | Contribuciones ese día |
|-------|-------|------------------------|
| 0 | gris | 0 |
| 1 | clarito | 1 → 25% de tu máximo |
| 2 | medio | 25–50% |
| 3 | fuerte | 50–75% |
| 4 | intenso | 75–100% |

👉 No hay número mágico fijo. Para "verde de todos los días" lo único que importa es
**≥1 contribución por día**. Para **verde fuerte/intenso**, varios commits por día.
Este kit hace **4 commits/día** por defecto (`COMMITS_PER_RUN`).

---

## El esquema de actividad

Cada corrida, el script `scripts/generate-daily.mjs`:

1. Crea/actualiza la entrada del día en `content/log/YYYY-MM-DD.md` (con un *tip* rotativo).
2. Actualiza `data/streak.json` (racha, días activos, total).
3. Reconstruye `index.html` → tu **site** muestra racha + historial.
4. Garantiza un *diff* en cada corrida ⇒ **cada commit cuenta**.

Así la actividad **no es vacía**: alimenta un site real que evoluciona solo.

---

## Setup en tu cuenta (5 minutos)

> ⚠️ **Cuenta:** mi token solo ve tu cuenta EMU `MSCIARRILLO_microsoft` (sin Pages,
> repos privados). Tu gráfico de 90 contribuciones y tu site viven en tu **cuenta
> personal de github.com**. Hacé este setup ahí.

### Opción A — GitHub Actions (recomendada, corre en la nube, no depende de tu PC)

1. Creá un repo (público o privado) y subí este kit:
   ```bash
   cd daily-green-site
   git init -b main
   git add -A && git commit -m "feat: daily green kit"
   git remote add origin https://github.com/<TU_USUARIO>/daily-green-site.git
   git push -u origin main
   ```
2. En el repo → **Settings → Secrets and variables → Actions → Variables** → creá:
   - `AUTHOR_EMAIL` = tu email **verificado** en GitHub (clave: si no, no cuenta).
   - `AUTHOR_NAME`  = tu nombre.
3. **Settings → Pages** → Source: `Deploy from a branch` → `main` / `/ (root)`.
   Tu site queda en `https://<TU_USUARIO>.github.io/daily-green-site/`.
   *(Tip: si el repo se llama `<TU_USUARIO>.github.io`, el site va a la raíz del dominio.)*
4. **Settings → Actions → General** → permití *Read and write permissions*.
5. Probalo a mano: pestaña **Actions → Daily Green → Run workflow**.
6. Activá **Profile → Settings → "Include private contributions on my profile"**
   si el repo es privado (muestra el verde sin revelar el contenido).

El workflow ya tiene `cron: "10 12 * * *"` (~09:10 ART). Editá `COMMITS_PER_RUN`
en `.github/workflows/daily-green.yml` para más/menos verde.

### Opción B — Tarea programada local (Windows)

Si preferís correrlo desde tu PC (requiere PC encendida):

```powershell
# editá $AuthorEmail dentro del script primero
.\scripts\local-task.ps1 -Install            # programa la tarea diaria
.\scripts\local-task.ps1 -Run                # corre ahora para probar
```

---

## Que tus commits CUENTEN (causa #1 de gráficos vacíos)

- El **email del autor** del commit debe estar **verificado** y asociado a tu cuenta
  (`git config user.email`). Revisá en **Settings → Emails**.
- Los commits tienen que ir a la **rama por defecto** (`main`) — ya está cubierto.
- Repos privados solo pintan verde si activás *Include private contributions*.

---

## Notas honestas

- Esto automatiza **constancia**, no logro. El verde sube; tu skill, no (eso es laburo aparte 😉).
- GitHub desactiva los cron tras ~60 días de inactividad del repo — como commiteás a diario, se mantiene vivo.
- El cron de Actions puede demorarse algunos minutos respecto de la hora exacta: es normal.
