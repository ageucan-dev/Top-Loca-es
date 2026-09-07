# Top Locações — validação CRO

Esta branch mantém o site estático usado na Hostinger e adiciona somente a camada de otimização CRO documentada em `CRO-AUDIT.md` e `CRO-CHANGELOG.md`.

## Abrir no GitHub Codespaces

No terminal, na raiz do repositório, execute:

```bash
git fetch origin
git switch cro/mobile-conversion-v1
git pull origin cro/mobile-conversion-v1
python3 -m http.server 5173
```

Depois, abra a porta **5173** pela aba **Ports** do Codespaces.

Para validar as rotas internas, navegue pelos links do próprio site. Em produção, o fallback de rotas continua sendo feito pelo `.htaccess` já existente.

## Página de obrigado

O botão principal da página `/obrigado` foi convertido para **Falar no WhatsApp**, com destino para **(16) 98135-7855** (`5516981357855`) e ícone do WhatsApp em `assets/whatsapp-icon.png`.
