#!/usr/bin/env python3
"""
Body Harmony Nexus V3.1 — Evolution API v2 Multi-Instance Provisioner (PLAN-152)
Provisions permanent and burner WhatsApp instances, Chatwoot integration & Webhooks
"""

import json
import sys
import urllib.request
import urllib.error

EVO_URL = "http://127.0.0.1:8085"
GLOBAL_KEY = "bh_evo_global_key_v31_2026_secure"
CHATWOOT_INTERNAL_URL = "http://bodyharmony-chatwoot-web:3000"
ACCOUNT_ID = sys.argv[1] if len(sys.argv) > 1 else "1"
TOKEN = sys.argv[2] if len(sys.argv) > 2 else "wxvcKsycZEXjrqM7dxD72oNm"

instances = [
    {"name": "inst_juridico", "inbox_id": "1", "inbox_name": "⚖️ Jurídico & Contratos", "type": "permanent (⚖️ Jurídico)"},
    {"name": "inst_licenciadas", "inbox_id": "2", "inbox_name": "👑 Suporte Licenciadas (Dra. Josi)", "type": "permanent (👑 Licenciadas / Dra. Josi)"},
    {"name": "inst_comercial", "inbox_id": "3", "inbox_name": "💼 Comercial & Vendas (Karice)", "type": "permanent (💼 Comercial / Karice)"},
    {"name": "inst_burner_01", "inbox_id": None, "inbox_name": None, "type": "burner (Descartável 01)"},
    {"name": "inst_burner_02", "inbox_id": None, "inbox_name": None, "type": "burner (Descartável 02)"}
]

headers = {
    "apikey": GLOBAL_KEY,
    "Content-Type": "application/json"
}

print(f">> Initializing Evolution API Provisioning (Account ID: {ACCOUNT_ID})...\n")

for inst in instances:
    name = inst["name"]
    desc = inst["type"]
    print(f">> [1/3] Checking / Creating Instance: {name} [{desc}]...")

    # 1. Create Instance
    payload = {
        "instanceName": name,
        "token": f"token_{name}_v31",
        "qrcode": True,
        "integration": "WHATSAPP-BAILEYS"
    }
    req = urllib.request.Request(f"{EVO_URL}/instance/create", data=json.dumps(payload).encode("utf-8"), headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"    [✓] Created instance {name}")
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode()
        if "already in use" in err_msg or e.code == 403:
            print(f"    [✓] Instance {name} is already registered.")
        else:
            print(f"    [i] Instance status ({e.code}): {err_msg[:100]}")
    except Exception as e:
        print(f"    [!] Error: {e}")

    # 2. Link Chatwoot if inbox is defined
    if inst["inbox_id"]:
        print(f">> [2/3] Linking Chatwoot for {name} (Inbox: {inst['inbox_id']})...")
        cw_payload = {
            "enabled": True,
            "accountId": str(ACCOUNT_ID),
            "token": str(TOKEN),
            "url": CHATWOOT_INTERNAL_URL,
            "signMsg": True,
            "reopenConversation": True,
            "conversationPending": False,
            "importContacts": True,
            "importMessages": True,
            "autoCreate": False,
            "nameInbox": inst["inbox_name"]
        }
        cw_req = urllib.request.Request(f"{EVO_URL}/chatwoot/set/{name}", data=json.dumps(cw_payload).encode("utf-8"), headers=headers)
        try:
            with urllib.request.urlopen(cw_req) as resp:
                print(f"    [✓] Chatwoot linked successfully for {name}")
        except urllib.error.HTTPError as e:
            print(f"    [!] Chatwoot set error ({e.code}): {e.read().decode()[:120]}")
        except Exception as e:
            print(f"    [!] Error: {e}")

    # 3. Set Webhook Events
    print(f">> [3/3] Setting Webhook Events for {name}...")
    wh_payload = {
        "webhook": {
            "enabled": True,
            "url": f"{CHATWOOT_INTERNAL_URL}/webhooks/evolution",
            "webhookByEvents": True,
            "events": [
                "MESSAGES_UPSERT",
                "CHATS_SET",
                "SEND_MESSAGE",
                "CONNECTION_UPDATE",
                "QRCODE_UPDATED",
                "STATUS_INSTANCE"
            ]
        }
    }
    wh_req = urllib.request.Request(f"{EVO_URL}/webhook/set/{name}", data=json.dumps(wh_payload).encode("utf-8"), headers=headers)
    try:
        with urllib.request.urlopen(wh_req) as resp:
            print(f"    [✓] Webhooks configured for {name}\n")
    except urllib.error.HTTPError as e:
        print(f"    [!] Webhook set error ({e.code}): {e.read().decode()[:120]}\n")
    except Exception as e:
        print(f"    [!] Error: {e}\n")

# Fetch all active instances from Evolution API
print("================================================================================")
print("                   STATUS DAS INSTÂNCIAS NA EVOLUTION API                       ")
print("================================================================================")
req_list = urllib.request.Request(f"{EVO_URL}/instance/fetchInstances", headers=headers)
try:
    with urllib.request.urlopen(req_list) as resp:
        inst_list = json.loads(resp.read().decode())
        print(f"Total de Instâncias Ativas: {len(inst_list)}\n")
        for item in inst_list:
            inst_obj = item.get("instance", item)
            name = inst_obj.get("name", "unknown")
            status = inst_obj.get("status", "unknown")
            integ = inst_obj.get("integration", "WHATSAPP-BAILEYS")
            print(f"  • {name.ljust(18)} | Status: {status.ljust(12)} | Integration: {integ}")
except Exception as e:
    print(f"Error fetching instances: {e}")
