# 🚀 Deploy Automatizado COMPLETO - Guia de Uso

## ✨ O Que Faz

`deploy-hostinger-full.ps1` é um script **tudo-em-um** que automatiza **100% do deploy**:

1. ✅ Build React (se necessário)
2. ✅ Conecta MySQL remoto via .NET (**sem precisar MySQL instalado**)
3. ✅ Importa 38 licenciadas automaticamente
4. ✅ Sync arquivos via WinSCP
5. ✅ Trigger `setup_auto.php` (primeira vez)
6. ✅ Cleanup automático

## 📋 Pré-requisitos

- ✅ **WinSCP instalado** (você já tem)
- ✅ **`.env.local` configurado** (você já tem)
- ⭐ **MySql.Data.dll** - **auto-download** na primeira execução

## 🎯 Uso

### Deploy Completo (Primeira Vez)
```powershell
.\infrastructure\deploy-hostinger-full.ps1 -FirstDeploy
```

**Faz TUDO:**
- Build React
- Import 38 licenciadas no MySQL
- Upload arquivos
- Executa setup_auto.php
- Remove setup_auto.php

---

### Deploy Rápido (após primeira vez)
```powershell
.\infrastructure\deploy-hostinger-full.ps1
```

**Faz:**
- Build React
- Upload arquivos via WinSCP

---

### Deploy Sem Build (se já fez build)
```powershell
.\infrastructure\deploy-hostinger-full.ps1 -SkipBuild
```

**Útil quando:** Você só mudou arquivos e não quer esperar o build React.

---

### Dry Run (testar sem enviar)
```powershell
.\infrastructure\deploy-hostinger-full.ps1 -DryRun
```

**Útil para:** Ver o que seria enviado sem enviar de fato.

---

## 🔍 Como Funciona

### 1. **MySql.Data.dll Auto-Download**

Na primeira execução, se `MySql.Data.dll` não existir, o script:
1. Baixa de NuGet (10MB)
2. Extrai DLL
3. Salva em `infrastructure/MySql.Data.dll`
4. Usa para conectar ao MySQL

**Depois disso, NUNCA mais precisa baixar.**

### 2. **Conexão MySQL .NET**

```powershell
# Cria conexão
$conn = New-Object MySql.Data.MySqlClient.MySqlConnection($connStr)
$conn.Open()

# Executa SQL
$cmd.ExecuteNonQuery()

# Fecha
$conn.Close()
```

**Vantagens:**
- ❌ NÃO precisa MySQL instalado
- ✅ Conecta direto no MySQL da Hostinger
- ✅ Importa `students_seed.sql` automaticamente

### 3. **WinSCP Sync**

```powershell
# Cria script WinSCP
open ftp://user:pass@host:port
synchronize remote -delete ./public_html
```

**Vantagens:**
- ✅ Envia apenas arquivos modificados
- ✅ Remove arquivos antigos
- ✅ Rápido (~30s)

### 4. **Setup Auto (primeira vez)**

```powershell
# HTTP GET request
Invoke-WebRequest https://site.com/setup_auto.php

# Depois, delete via FTP
rm setup_auto.php
```

---

## 📊 Exemplo de Execução

```
========================================
🚀 Body Harmony - Deploy Automatizado COMPLETO (V2.0)
========================================

🔐 Validando configurações...
✅ Credenciais carregadas

📦 Executando build...
✅ Build concluído!

📊 Importando 38 licenciadas via MySQL remoto...
📥 Baixando MySql.Data.dll (10MB)...
✅ MySql.Data.dll baixado!
✅ Conectado ao MySQL: srv795.hstgr.io
✅ 38 licenciadas importadas!

📤 Sincronizando arquivos via WinSCP...
✅ Arquivos sincronizados!

🔧 Executando setup automático...
✅ Setup executado!

🧹 Removendo setup_auto.php...
✅ setup_auto.php removido

========================================
✅ Deploy Concluído!
========================================

📋 Próximos passos:
1. Site: https://tan-curlew-347494.hostingersite.com
2. Admin: https://tan-curlew-347494.hostingersite.com/portal-gestor
   User: Josi | Pass: @BodyHarmony2026!
3. Validar Barracks (38 licenciadas devem aparecer)
4. Test login licenciada:
   User: CPF | Pass: Mudar123!
```

---

## 🐛 Troubleshooting

### "WinSCP não encontrado"
**Solução:** Instalar em: https://winscp.net/eng/download.php

### "Erro ao conectar MySQL"
**Possíveis causas:**
1. IP não liberado na Hostinger → Verificar hPanel → MySQL Remoto
2. Senha errada → Checar `.env.local`
3. Firewall bloqueando porta 3306

### "Build falhou"
**Solução:** Rodar manualmente primeiro:
```powershell
cd apps\web-app
npm run build:hostinger
```

---

## 🎉 Tudo Pronto!

**Próximo deploy será 1 comando:**
```powershell
.\infrastructure\deploy-hostinger-full.ps1
```

**30 segundos do commit ao site no ar.** 🚀
