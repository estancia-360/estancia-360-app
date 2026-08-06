// Paleta de marca Estancia360 (constants/theme.ts del móvil — única fuente de verdad de los
// colores reales de la marca, NO inventar valores nuevos acá).
const BRAND = {
    primary: '#336c36', // verde
    secondary: '#e2772a', // naranja
    accent: '#7aa641', // verde claro
    background: '#f7f0dd', // crema
    textPrimary: '#0a0a0a',
    textSecondary: '#4a5565',
    white: '#ffffff',
    border: 'rgba(106, 114, 130, 0.15)',
};

export const VerificationCodeTemplate = (
    code: number,
    title: string = 'Código de verificación',
    message: string = 'Para completar la operación, ingresa el siguiente código:',
    validityMinutes: number = 15,
) => `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>

<body style="margin:0;padding:0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;background:${BRAND.background};color:${BRAND.textPrimary};">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:480px;width:100%;background:${BRAND.white};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header de marca -->
          <tr>
            <td style="background:${BRAND.primary};padding:28px 24px;text-align:center;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:${BRAND.white};letter-spacing:0.5px;">
                Estancia<span style="color:${BRAND.secondary};">360</span>
              </div>
            </td>
          </tr>

          <!-- Franja de acento -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${BRAND.accent},${BRAND.secondary});font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <tr>
            <td style="padding:32px 28px 24px;text-align:center;">
              <h1 style="margin:0 0 12px;font-size:19px;font-weight:700;color:${BRAND.textPrimary};">
                ${title}
              </h1>

              <p style="margin:0;font-size:14px;line-height:20px;color:${BRAND.textSecondary};">
                ${message}
              </p>

              <div style="margin:28px auto;display:inline-block;background:${BRAND.background};border:1.5px dashed ${BRAND.primary};border-radius:12px;padding:16px 32px;">
                <span style="font-size:34px;font-weight:800;letter-spacing:8px;color:${BRAND.primary};font-family:'Courier New',monospace;">
                  ${code.toString().padStart(6, '0')}
                </span>
              </div>

              <p style="margin:8px 0 0;font-size:13px;line-height:19px;color:${BRAND.textSecondary};">
                Este código es válido por <strong style="color:${BRAND.textPrimary};">${validityMinutes} minutos</strong>.
              </p>

              <p style="margin:16px 0 0;font-size:12px;line-height:18px;color:${BRAND.textSecondary};">
                Si no solicitaste esta operación, podés ignorar este correo con tranquilidad.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 24px;background:${BRAND.background};text-align:center;border-top:1px solid ${BRAND.border};">
              <p style="margin:0;font-size:11px;color:${BRAND.textSecondary};">
                Estancia360 — Gestión ganadera. Este mensaje se generó automáticamente, no respondas a este correo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
