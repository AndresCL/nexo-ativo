# Avaliações do Google na vitrine

O editor oferece a configuração em **Aparência → Google e SEO → Avaliações do Google**. O assinante busca a empresa por nome e cidade, confere o endereço, seleciona o estabelecimento, ativa a exibição e publica. Os formatos disponíveis são resumo e resumo com carrossel.

## Configuração do ambiente

1. Habilitar **Places API (New)** em um projeto Google Cloud com faturamento configurado.
2. Criar uma chave exclusiva do backend, restrita à Places API (New).
3. Cadastrar o segredo das Cloud Functions:

   ```sh
   firebase functions:secrets:set GOOGLE_PLACES_API_KEY
   ```

4. Na próxima publicação das funções, incluir `pesquisarEstabelecimentosGoogle`, `consultarAvaliacoesGooglePrevia` e `consultarAvaliacoesGoogleVitrine`.

No emulador, definir `GOOGLE_PLACES_API_KEY` em `funcoes/.secret.local`, arquivo ignorado pelo Git. O segredo não deve usar prefixo `NEXT_PUBLIC_` e não é necessário para renderizar vitrines que não usam avaliações. Sem credenciais, a leitura pública usa um link para o Google; a prévia informa a indisponibilidade.

Nenhuma credencial é necessária para os testes automatizados: eles substituem a API externa por respostas controladas.

## Dados e publicação

- `avaliacoesGoogle` é uma configuração opcional compartilhada por rascunho e página publicada: `habilitado`, `identificadorLocal` e `modoExibicao`.
- Páginas antigas continuam válidas, com o recurso desativado. Habilitar exige um estabelecimento.
- A publicação existente salva somente a configuração e não depende da disponibilidade do Google.
- A consulta pública recebe apenas o identificador da vitrine. O backend verifica o índice, a organização ativa, a página publicada e o recurso habilitado antes de resolver o estabelecimento.
- Busca e prévia exigem vínculo administrativo ativo e a permissão existente de edição de aparência. A prévia aceita a seleção ainda não publicada sem gravá-la.
- Nota, total, nomes, endereços, fotos e comentários recebidos do Google não são persistidos no Firestore, no histórico de publicações, no armazenamento do navegador ou no cache da página. Os dados ficam apenas no estado da exibição atual. Consultas e respostas usam `no-store`.
- Fotografias de autores usam imagens sem otimização para não criar cópias no cache do Next.js.

## Exibição e falhas

O mesmo bloco atende às três composições e à prévia desktop/mobile. A consulta começa quando o bloco se aproxima da área visível. Abrir o painel de leitura completa compartilha a resposta atual. Mudanças de paleta ou formato não provocam nova consulta, e respostas de uma seleção anterior são descartadas.

A média geral é fornecida pelo Google e não é recalculada a partir dos comentários retornados. A API entrega até cinco comentários por relevância. O texto original é preservado quando fornecido, com autoria, links e atribuições. A interface oferece navegação manual por toque, botões e teclado, respeitando movimento reduzido.

Sem avaliações, o bloco público fica oculto. Em falhas ou esgotamento de cota, aparece o link para o estabelecimento no Google. Erros detalhados são apresentados apenas no painel autenticado.

## Consumo

Os valores iniciais estão em `LIMITES_CONSULTAS_AVALIACOES_GOOGLE`, no arquivo `funcoes/src/avaliacoes/limitadorConsultasAvaliacoesGoogle.ts`:

- 30 consultas por minuto por organização.
- 3.000 consultas por mês por organização.
- 20.000 consultas por mês para a plataforma.

A reserva usa transação e ocorre antes da chamada externa, que fica fora da transação. Todas as operações compartilham esses limites; falhas externas também consomem a reserva. A coleção `consumoAvaliacoesGoogle` contém somente contadores e é inacessível aos clientes pelas regras existentes. As janelas mensais usam UTC.

Esses limites controlam o número de consultas, não representam um teto monetário. Pesquisas e consultas com comentários podem ter categorias de cobrança diferentes. Antes de ativar em produção, dimensionar os limites conforme tráfego e orçamento, configurar alertas de cobrança e manter os termos de uso e a política de privacidade do produto alinhados às exigências do provedor.

Referências oficiais: [Places API: políticas e atribuição](https://developers.google.com/maps/documentation/places/web-service/policies), [campos de Place Details e cobrança](https://developers.google.com/maps/documentation/places/web-service/place-details), [segredos das Cloud Functions](https://firebase.google.com/docs/functions/config-env).
