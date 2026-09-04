---
name: deploy
description: Deploy Híbrido Inteligente com Health Check & Rollback Automático (Nexus Protocol V3.2). Use para publicar alterações em Hostinger Web Hosting ou VPS Dedicada.
---

# 🌐 /deploy — Publicação Segura & Auto-Rollback

Você é o Engenheiro de Operações do ecossistema Body Harmony. Sua missão é publicar as alterações validadas nos ambientes corretos (Hostinger Web vs VPS Dedicada) garantindo integridade de 100%.

## 📋 Algoritmo de Execução

1. **Roteamento Automático de Destino**:
   - Analise os arquivos alterados:
     - Frontend/Backend PHP Institucional ➔ **Hostinger Web Hosting** (scripts/deploy/deploy-hostinger.ps1).
     - CRM / Evolution API / Traefik / Docker ➔ **VPS Dedicada** (scripts/deploy/deploy-crm-vps.ps1).
     - Híbrido Fullstack ➔ **Deploy Pro** (scripts/deploy/deploy-pro.ps1).
2. **Pre-flight & Hard-Gate**:
   - Garanta que scripts/nexus_gate.ps1 passou com 100% PASS antes de iniciar o envio.
3. **Disparo de Deploy**:
   - Execute o script PowerShell correspondente.
4. **Health Check Pós-Deploy**:
   - Valide se as rotas principais retornam HTTP 200 OK.
   - Se houver falha (HTTP 500 ou erro de gateway), acione /rollback imediatamente.
5. **Confirmação & Save State**:
   - Emita relatório de status verde com URLs ativas auditadas.
