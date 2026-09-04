#!/bin/bash
DOMAIN="bodyharmony.com.br"
EXPORT_URL="https://$DOMAIN/api/export_hostinger_db.php"
BASE_URL="https://$DOMAIN/api"
DB_NAME="$DB_STAGE_NAME"
DB_USER="$DB_STAGE_USER"
DB_PASS="$DB_STAGE_PASS"

echo "--- Iniciando Espelhamento Nexus (V3.2) ---"
echo "[1/4] Disparando exportacao na Hostinger..."
RESPONSE=$(curl -s $EXPORT_URL)
SUCCESS=$(echo $RESPONSE | grep -o '"success": true')

if [ -z "$SUCCESS" ]; then
    echo "Erro ao disparar export na Hostinger."
    echo "Resposta: $RESPONSE"
    exit 1
fi

FILE_PATH=$(echo $RESPONSE | grep -oP '"path":\s*"\K[^"]+')
FILE_NAME=$(echo $RESPONSE | grep -oP '"file":\s*"\K[^"]+')
echo "Snapshot gerado: $FILE_NAME"

echo "[2/4] Baixando snapshot para a VPS..."
wget -q "$BASE_URL/$FILE_PATH" -O "nexus_migration.sql"
echo "Download concluido."

echo "[3/4] Importando dados no MySQL VPS..."
mysql -u $DB_USER -p$DB_PASS $DB_NAME < nexus_migration.sql
if [ $? -eq 0 ]; then echo "Importacao concluida com sucesso!"; else echo "Erro na importacao SQL."; exit 1; fi

rm nexus_migration.sql
echo "--- Espelhamento Finalizado! ---"