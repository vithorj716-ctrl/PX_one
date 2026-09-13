export function renderErrorPage() {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Erro inesperado</title>
    <style>
      body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
        font-family: ui-sans-serif, system-ui, sans-serif; background:#0b0f14; color:#e6edf3; }
      main { text-align:center; padding:2rem; max-width:32rem; }
      h1 { font-size:1.25rem; margin:0 0 .5rem; }
      p { color:#9aa7b4; margin:0 0 1.25rem; line-height:1.5; }
      button { background:#2563eb; color:#fff; border:0; border-radius:.5rem; padding:.6rem 1.1rem;
        font-size:.9rem; cursor:pointer; }
    </style>
  </head>
  <body>
    <main>
      <h1>Algo deu errado</h1>
      <p>Não foi possível carregar esta página. Tente novamente em instantes.</p>
      <button onclick="location.reload()">Recarregar</button>
    </main>
  </body>
</html>`;
}
