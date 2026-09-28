# Top Locações — site publicado

Repositório da versão estática publicada em [locacoestop.com.br](https://locacoestop.com.br/).

## Estado atual

- A branch `main` representa a versão publicada validada em 28/09/2026.
- A camada de conversão está nos arquivos `assets/cro-v1.*` e `assets/cro-phone-v2.*`.
- A hospedagem é feita na Hostinger; não há deploy automático configurado neste repositório.
- Este repositório contém a distribuição compilada do site. Alterações no bundle principal devem ser evitadas até o projeto-fonte ser recuperado.

## Contato oficial

O WhatsApp oficial é **(16) 99263-1992**, no formato internacional **5516992631992**.

Antes de publicar qualquer alteração, conferir se todos os CTAs, rodapé, página `/obrigado` e eventos de análise apontam para esse número.

## Fluxo de alterações

1. Criar uma branch a partir da `main`.
2. Fazer alterações somente na branch.
3. Validar Home, produtos, formulário e página de agradecimento.
4. Abrir um pull request para a `main`.
5. Publicar na Hostinger apenas depois da aprovação do PR e da validação visual.
6. Confirmar o site publicado após o upload.

Nunca alterar diretamente a `main` nem substituir os arquivos da Hostinger sem manter uma versão recuperável.

## Validação local

Na raiz do repositório:

```bash
python3 -m http.server 5173
```

Abra a porta 5173. No servidor local simples, valide as rotas internas navegando pelos links do próprio site. O fallback direto das rotas é atendido em produção pelo `.htaccess`.

## Checklist obrigatório

- Home em celular e desktop.
- Menu móvel e CTAs.
- `/balancim-eletrico` e `/balancim-manual`.
- Pré-seleção correta do produto.
- Formulário sem envio de dados reais durante testes visuais.
- `/obrigado` com `noindex, nofollow`.
- PDFs e imagens.
- Console sem erros.
- Metadados, canonical, sitemap e robots.
- WhatsApp oficial: `5516992631992`.
