#!/bin/bash
# =====================================================
# Body Harmony - OCI Instance Provisioner (V83)
# Extrai metadados via IMDS e cria instância ARM A1
# =====================================================
set -euo pipefail

echo "=== Phase 1: Extracting instance metadata ==="

# Extrair dados via Instance Metadata Service v1
INSTANCE_JSON=$(curl -s http://169.254.169.254/opc/v1/instance/)
VNIC_JSON=$(curl -s http://169.254.169.254/opc/v1/vnics/)

COMPARTMENT_ID=$(echo "$INSTANCE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['compartmentId'])")
REGION=$(echo "$INSTANCE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['region'])")
AD=$(echo "$INSTANCE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['availabilityDomain'])")
EXISTING_ID=$(echo "$INSTANCE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
SUBNET_ID=$(echo "$VNIC_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)[0].get('subnetId','NOT_FOUND'))" 2>/dev/null || echo "NOT_IN_IMDS")

echo "Compartment: $COMPARTMENT_ID"
echo "Region: $REGION"
echo "AD: $AD"
echo "Existing Instance: $EXISTING_ID"
echo "Subnet: $SUBNET_ID"

# Extrair chave SSH pública da instância atual
SSH_PUBKEY=$(echo "$INSTANCE_JSON" | python3 -c "
import sys,json
d = json.load(sys.stdin)
md = d.get('metadata', {})
print(md.get('ssh_authorized_keys', 'NOT_FOUND'))
")

echo ""
echo "=== Phase 2: Installing OCI CLI ==="

if ! command -v oci &> /dev/null; then
    echo "Installing OCI CLI via pip..."
    pip3 install --user oci-cli 2>/dev/null || sudo pip3 install oci-cli
    export PATH="$HOME/.local/bin:$PATH"
fi

echo "OCI CLI Version: $(oci --version 2>/dev/null || echo 'INSTALL_FAILED')"

echo ""
echo "=== Phase 3: Configure OCI CLI (Instance Principal) ==="

# Usar Instance Principal auth (não precisa de API key)
export OCI_CLI_AUTH=instance_principal

echo "Testing auth..."
oci iam region list --auth instance_principal --output table 2>/dev/null && echo "AUTH_OK" || {
    echo "Instance Principal auth failed. Trying resource principal..."
    oci iam region list --auth resource_principal --output table 2>/dev/null && echo "RESOURCE_AUTH_OK" || {
        echo "AUTH_FAILED - Need to configure API keys or enable Instance Principal"
        echo ""
        echo "=== FALLBACK: Export data for manual creation ==="
        echo "COMPARTMENT_ID=$COMPARTMENT_ID"
        echo "REGION=$REGION"
        echo "AD=$AD"
        echo "SSH_PUBKEY=$SSH_PUBKEY"
        exit 1
    }
}

echo ""
echo "=== Phase 4: Find ARM A1 Image ==="

# Buscar imagem Ubuntu 22.04 ARM
IMAGE_ID=$(oci compute image list \
    --compartment-id "$COMPARTMENT_ID" \
    --operating-system "Canonical Ubuntu" \
    --operating-system-version "22.04" \
    --shape "VM.Standard.A1.Flex" \
    --auth instance_principal \
    --query "data[0].id" \
    --raw-output 2>/dev/null || echo "IMAGE_LOOKUP_FAILED")

echo "ARM Image: $IMAGE_ID"

echo ""
echo "=== Phase 5: Get Subnet OCID ==="

# Se subnet não veio do IMDS, buscar via CLI
if [ "$SUBNET_ID" = "NOT_IN_IMDS" ] || [ "$SUBNET_ID" = "NOT_FOUND" ]; then
    SUBNET_ID=$(oci network subnet list \
        --compartment-id "$COMPARTMENT_ID" \
        --auth instance_principal \
        --query "data[0].id" \
        --raw-output 2>/dev/null || echo "SUBNET_LOOKUP_FAILED")
fi

echo "Subnet: $SUBNET_ID"

echo ""
echo "=== Phase 6: Create ARM A1 Instance ==="

echo "Creating bh-streaming-arm (4 OCPUs, 24GB RAM)..."

RESULT=$(oci compute instance launch \
    --compartment-id "$COMPARTMENT_ID" \
    --availability-domain "$AD" \
    --display-name "bh-streaming-arm" \
    --shape "VM.Standard.A1.Flex" \
    --shape-config '{"ocpus": 4, "memoryInGBs": 24}' \
    --image-id "$IMAGE_ID" \
    --subnet-id "$SUBNET_ID" \
    --assign-public-ip true \
    --ssh-authorized-keys-file /dev/stdin \
    --boot-volume-size-in-gbs 50 \
    --auth instance_principal \
    --wait-for-state RUNNING \
    --max-wait-seconds 600 <<< "$SSH_PUBKEY" 2>&1) || {
    echo "CREATE FAILED:"
    echo "$RESULT"
    exit 1
}

echo "$RESULT"

# Extrair IP
NEW_IP=$(echo "$RESULT" | python3 -c "
import sys,json
data = json.load(sys.stdin)
print(data.get('data',{}).get('primary-public-ip','UNKNOWN'))
" 2>/dev/null || echo "CHECK_CONSOLE")

echo ""
echo "========================================="
echo " ✅ ARM A1 Instance Created!"
echo " IP: $NEW_IP"
echo "========================================="
