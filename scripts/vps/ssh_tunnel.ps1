# SSH Tunnel to Local Server DB (Oracle VPS Replacement)
# Mapeia porta local 3307 para remota 3306.

ssh -o StrictHostKeyChecking=no -L 3307:localhost:3306 germano@192.168.1.44 -N

