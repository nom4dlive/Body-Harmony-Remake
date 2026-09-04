#!/usr/bin/env bash
# scripts/vps/setup-infra-swap.sh
# Nexus Protocol V3.1 — PLAN-143: Automação de Swapfile 4GB e Otimização de Infraestrutura VPS

set -e

echo "=========================================================="
echo "⚡ INICIANDO CONFIGURAÇÃO DE SWAPFILE 4GB NA VPS"
echo "=========================================================="

# 1. Verificar se o Swapfile de 4GB já existe
if grep -q '/swapfile' /proc/swaps; then
    echo "ℹ️ Swapfile já está ativo na VPS."
else
    echo "[1/4] Criando arquivo /swapfile de 4GB..."
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo "[2/4] Tornando o Swapfile persistente em /etc/fstab..."
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
fi

# 2. Configurar Swappiness otimizado
echo "[3/4] Ajustando vm.swappiness=10..."
sysctl vm.swappiness=10
if ! grep -q 'vm.swappiness' /etc/sysctl.conf; then
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
fi

# 3. Validação de recursos de memória
echo "[4/4] Validação do estado de Memória e Swap:"
echo "--- SWAPON ---"
swapon --show
echo "--- FREE -H ---"
free -h

echo "=========================================================="
echo "✅ INFRAESTRUTURA DE MEMÓRIA & SWAP CONFIGURADA COM SUCESSO!"
echo "=========================================================="
