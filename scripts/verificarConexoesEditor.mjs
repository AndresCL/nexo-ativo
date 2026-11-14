import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const raiz = process.cwd();
const servidor = await createServer({
  configFile: false,
  root: resolve(raiz, "testes/navegador/editor-fluxo"),
  plugins: [react()],
  resolve: { alias: { "@": resolve(raiz, "src") } },
  css: { postcss: raiz },
  define: { "process.env": "{}" },
  server: { host: "127.0.0.1", port: 5189, strictPort: true, fs: { allow: [raiz] } },
});
let navegador;
try {
  await servidor.listen();
  const chromeMac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  navegador = await chromium.launch({
    headless: true,
    ...(existsSync(chromeMac) ? { executablePath: chromeMac } : {}),
  });
  const pagina = await navegador.newPage({ viewport: { width: 1600, height: 1000 } });
  pagina.on("pageerror", (erro) => console.error("Erro no navegador:", erro.message));
  await pagina.goto("http://127.0.0.1:5189", { waitUntil: "networkidle" });
  await pagina.getByRole("heading", { name: "Como deseja comprar?" }).first().waitFor();
  await pagina.getByRole("button", { name: "Fechar painel de edição", exact: true }).click();
  async function arrastar(origem, destino) {
    const a = await origem.boundingBox();
    const b = await destino.boundingBox();
    if (!a || !b) throw new Error("Conectores não encontrados.");
    await pagina.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await pagina.mouse.down();
    await pagina.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 30 });
    await pagina.mouse.up();
  }
  const no = (id) => pagina.locator(`.react-flow__node[data-id="${id}"]`);
  await arrastar(
    no("pergunta").locator('[data-handleid="opcao:escolha:vista"]'),
    no("destino").locator(".react-flow__handle.target"),
  );
  const estado = JSON.parse(await pagina.locator("#estado-fluxo").textContent());
  console.log(
    "Resultado ao arrastar entre círculos:",
    JSON.stringify(estado.etapas[0].blocos[0].opcoes[0]),
  );
  await pagina.screenshot({ path: "/tmp/conexoes-editor-fluxo.png", fullPage: true });
  if (estado.etapas[0].blocos[0].opcoes[0].proximaEtapaIdOpcional !== "destino")
    throw new Error("O arrasto entre conectores não gravou a ligação.");
  console.log("Conexão por arrasto entre conectores confirmada no navegador real.");
  await arrastar(
    no("pergunta").locator('[data-handleid="opcao:escolha:financiado"]'),
    no("outra").getByRole("heading", { name: "Outra pergunta", exact: true }),
  );
  const segundo = JSON.parse(await pagina.locator("#estado-fluxo").textContent());
  console.log(
    "Resultado ao soltar sobre a pergunta:",
    JSON.stringify(segundo.etapas[0].blocos[0].opcoes[1]),
  );
  await pagina.screenshot({ path: "/tmp/conexoes-editor-fluxo.png", fullPage: true });
  if (segundo.etapas[0].blocos[0].opcoes[1].proximaEtapaIdOpcional !== "outra")
    throw new Error("Soltar sobre o card não gravou a ligação.");
  console.log("Conexão ao soltar sobre o card confirmada no navegador real.");
  const rotuloFinanciado = pagina
    .locator(".react-flow__edgelabel-renderer > div")
    .filter({ hasText: "Financiado" });
  await rotuloFinanciado.getByRole("button", { name: "Excluir conexão", exact: true }).click();
  await pagina.waitForFunction(() => {
    const fluxo = JSON.parse(document.querySelector("#estado-fluxo").textContent);
    return fluxo.etapas[0].blocos[0].opcoes[1].desconectada === true;
  });
  await arrastar(
    no("pergunta").locator('[data-handleid="opcao:escolha:financiado"]'),
    no("destino").getByRole("heading", { name: "Pergunta de destino", exact: true }),
  );
  await pagina.waitForFunction(() => {
    const fluxo = JSON.parse(document.querySelector("#estado-fluxo").textContent);
    return fluxo.etapas[0].blocos[0].opcoes[1].proximaEtapaIdOpcional === "destino";
  });
  console.log("Exclusão e nova conexão da resposta com outro destino confirmadas.");
  await arrastar(
    no("outra").locator('[data-handleid="padrao"]'),
    no("destino").getByRole("heading", { name: "Pergunta de destino", exact: true }),
  );
  await pagina.waitForFunction(() => {
    const fluxo = JSON.parse(document.querySelector("#estado-fluxo").textContent);
    return fluxo.etapas.find((etapa) => etapa.id === "outra").proximaEtapaPadraoId === "destino";
  });
  console.log("Conexão pela saída padrão confirmada.");
  const antesDeSoltarFora = await pagina.locator("#estado-fluxo").textContent();
  const origem = await no("pergunta")
    .locator('[data-handleid="opcao:escolha:financiado"]')
    .boundingBox();
  await pagina.mouse.move(origem.x + origem.width / 2, origem.y + origem.height / 2);
  await pagina.mouse.down();
  await pagina.mouse.move(1550, 900, { steps: 30 });
  await pagina.mouse.up();
  if ((await pagina.locator("#estado-fluxo").textContent()) !== antesDeSoltarFora)
    throw new Error("Soltar fora dos cards alterou as conexões.");
  console.log("Soltar fora dos cards preserva o fluxo.");
  await pagina.screenshot({ path: "/tmp/conexoes-editor-fluxo.png", fullPage: true });
} finally {
  await navegador?.close();
  await servidor.close();
}
