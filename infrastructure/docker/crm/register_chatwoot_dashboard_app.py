#!/usr/bin/env python3
"""
Body Harmony Nexus V3.1 — Chatwoot Dashboard App Registrar (PLAN-154)
Registers the Dossiê 360º Embed App in Chatwoot Sidebar for Contact Conversations
"""

import json
import urllib.request
import urllib.error

CHATWOOT_URL = "http://127.0.0.1:3005"
ACCOUNT_ID = "1"
TOKEN = "wxvcKsycZEXjrqM7dxD72oNm"
EMBED_URL = "https://bodyharmony.com.br/portal-gestor/crm/dossier-embed?phone={{contact.phone_number}}"

headers = {
    "api_access_token": TOKEN,
    "Content-Type": "application/json"
}

print(f">> [Chatwoot Dashboard App] Checking existing apps on Account {ACCOUNT_ID}...")

list_url = f"{CHATWOOT_URL}/api/v1/accounts/{ACCOUNT_ID}/dashboard_apps"
req_list = urllib.request.Request(list_url, headers=headers)

existing_app = None
try:
    with urllib.request.urlopen(req_list) as resp:
        apps = json.loads(resp.read().decode())
        print(f">> Found {len(apps)} registered Dashboard Apps.")
        for app in apps:
            if "Dossiê 360" in app.get("title", "") or "Body Harmony" in app.get("title", ""):
                existing_app = app
                print(f"   [✓] Found existing Dossiê 360º App (ID: {app.get('id')})")
except Exception as e:
    print(f">> Notice listing apps: {e}")

payload = {
    "title": "Dossiê 360º Body Harmony",
    "content": [
        {
            "url": EMBED_URL,
            "type": "frame"
        }
    ]
}

if existing_app:
    app_id = existing_app["id"]
    print(f">> Updating Dashboard App ID {app_id}...")
    update_url = f"{CHATWOOT_URL}/api/v1/accounts/{ACCOUNT_ID}/dashboard_apps/{app_id}"
    req_update = urllib.request.Request(update_url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="PUT")
    try:
        with urllib.request.urlopen(req_update) as resp:
            data = json.loads(resp.read().decode())
            print(f"✅ Dashboard App updated successfully: {data.get('title')}")
    except urllib.error.HTTPError as e:
        print(f"❌ Error updating app ({e.code}): {e.read().decode()}")
else:
    print(f">> Creating new Dashboard App in Chatwoot...")
    req_create = urllib.request.Request(list_url, data=json.dumps(payload).encode("utf-8"), headers=headers)
    try:
        with urllib.request.urlopen(req_create) as resp:
            data = json.loads(resp.read().decode())
            print(f"✅ Dashboard App created successfully: {data.get('title')} (ID: {data.get('id')})")
    except urllib.error.HTTPError as e:
        print(f"❌ Error creating app ({e.code}): {e.read().decode()}")
