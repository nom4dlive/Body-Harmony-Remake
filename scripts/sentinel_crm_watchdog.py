#!/usr/bin/env python3
"""
scripts/sentinel_crm_watchdog.py
Body Harmony Nexus V3.1 — Sentinela CRM Health Watchdog (PLAN-181)

Monitoramento autônomo periódico na VPS Dedicada (2.25.156.25).
Verifica a cada 15 minutos o endpoint https://bodyharmony.com.br/api/v1/crm/health
e registra alertas em caso de desconexão ou degradação.
"""

import sys
import time
import json
import urllib.request
import urllib.error
from datetime import datetime

HEALTH_URL = "https://bodyharmony.com.br/api/v1/crm/health.php"
USER_AGENT = "BodyHarmony-Sentinel-Watchdog/3.1"
CHECK_INTERVAL_SECONDS = 900  # 15 minutos

def check_crm_health() -> dict:
    req = urllib.request.Request(
        HEALTH_URL,
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"}
    )
    try:
        start = time.time()
        with urllib.request.urlopen(req, timeout=10) as response:
            latency_ms = round((time.time() - start) * 1000, 2)
            body = response.read().decode('utf-8')
            data = json.loads(body)
            data['_http_code'] = response.status
            data['_probe_latency_ms'] = latency_ms
            return data
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')
        try:
            data = json.loads(body)
        except Exception:
            data = {"status": "unhealthy", "error": str(e)}
        data['_http_code'] = e.code
        return data
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": f"Connection failed: {str(e)}",
            "_http_code": 0
        }

def evaluate_and_log(result: dict):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status = result.get("status", "unknown")
    http_code = result.get("_http_code", 0)
    checks = result.get("checks", {})

    wa = checks.get("whatsapp_instances", {})
    wa_summary = f"juridico:{wa.get('juridico', '?')}, licenciadas:{wa.get('licenciadas', '?')}, clinica:{wa.get('clinica', '?')}, comercial:{wa.get('comercial', '?')}"

    if status == "healthy" and http_code == 200:
        print(f"[{now_str}] [SENTINEL_CRM_OK] Sistema íntegro (200 OK). Linhas: [{wa_summary}]")
    else:
        print(f"[{now_str}] [SENTINEL_CRM_ALERT] Status: {status.upper()} (HTTP {http_code})")
        print(f"  • Detalhes: {json.dumps(checks, indent=2, ensure_ascii=False)}")
        if result.get("error"):
            print(f"  • Erro: {result.get('error')}")

def main():
    is_loop = "--loop" in sys.argv
    print(f"=== Body Harmony Sentinel CRM Watchdog v3.1 ===")
    print(f"Alvo: {HEALTH_URL}")
    print(f"Modo: {'Loop contínuo (intervalo 15m)' if is_loop else 'Execução pontual (one-shot)'}\n")

    if not is_loop:
        result = check_crm_health()
        evaluate_and_log(result)
        sys.exit(0 if result.get("status") in ["healthy", "degraded"] else 1)

    while True:
        try:
            result = check_crm_health()
            evaluate_and_log(result)
        except Exception as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [SENTINEL_CRM_FATAL] Exceção inesperada: {e}")
        
        time.sleep(CHECK_INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
