export const TwoFactorCodeTemplate = (code: number, title: string = 'Código de verificación', message: string = 'Para completar la operación, ingresa el siguiente código:') => `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>

<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#ffffff;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="border:1px solid #eee;">

          <tr>
            <td style="background:linear-gradient(90deg,#8e0000,#d32f2f);
                       padding:20px;color:#fff;text-align:center;">
              <h1 style="margin:0;font-size:22px;">${title}</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:20px;text-align:center;">
              <p style="margin:0;font-size:14px;">
                ${message}
              </p>

              <div style="margin:20px 0;font-size:32px;font-weight:700;color:#d32f2f;">
                ${code.toString().padStart(6, "0")}
              </div>

              <p style="margin-top:20px;font-size:13px;color:#555;">
                Este código es válido por <strong>5 minutos</strong>.
              </p>

              <p style="margin-top:10px;font-size:13px;color:#555;">
                Si no solicitaste esta operación, ignora este correo.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:12px;background:#fafafa;text-align:center;font-size:12px;color:#777;">
              Este mensaje se generó automáticamente.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
