import http from 'k6/http';
import { check, sleep } from 'k6';

// Configurações e limites de carga do k6
export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp-up inicial rápido
    { duration: '1m30s', target: 20 }, // Carga intermediária
    { duration: '2m', target: 50 },    // Carga de pico (Stress)
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],     // Menos de 5% de falhas HTTP
    http_req_duration: ['p(95)<3000'],   // 95% das requisições abaixo de 3 segundos
  },
};

export default function () {
  // O endpoint alvo é configurado dinamicamente via variável de ambiente TARGET_URL.
  // Fallback padrão seguro para o Staging local se nenhuma for especificada.
  const BASE_URL = __ENV.TARGET_URL || 'http://192.168.1.44/api/v1';

  // Usamos CPFs de teste sequenciais com base no ID da VU (Virtual User) do k6.
  // O CPF de stress.user.X é preenchido com zeros à esquerda.
  const vuId = String(__VU).padStart(3, '0');
  const testCPF = `00000000${vuId}`; // Ex: 00000000001, 00000000002...

  const loginPayload = JSON.stringify({
    login: testCPF,
    password: 'Mudar123!'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-DEVICE-ID': `stress-device-${__VU}` // Impede colisão na tabela de múltiplos dispositivos
    }
  };

  // 1. Endpoint de Login
  const loginRes = http.post(`${BASE_URL}/auth/licenciada/login`, loginPayload, params);
  
  if (loginRes.status !== 200) {
    console.log(`[LOGIN FAILED] Status: ${loginRes.status}, Body: ${loginRes.body}, Payload: ${loginPayload}`);
  }

  if (check(loginRes, {
    'login: status 200': (r) => r.status === 200,
    'login: contem token': (r) => r.json('token') !== undefined
  })) {
    const token = loginRes.json('token');
    const authHeaders = {
      headers: {
        'Content-Type': 'application/json',
        'X-DEVICE-TOKEN': token
      }
    };

    // 2. Visualização da Grade de Módulos (GET /lms/modules)
    const modulesRes = http.get(`${BASE_URL}/lms/modules`, authHeaders);
    check(modulesRes, {
      'lms modules: status 200': (r) => r.status === 200
    });

    sleep(1.5); // Pausa reativa do usuário olhando a interface

    // 3. Obtenção de URL Assinada da Aula 1 (POST /lms/sign-url)
    const signPayload = JSON.stringify({ lesson_id: 29 });
    const signRes = http.post(`${BASE_URL}/lms/sign-url`, signPayload, authHeaders);
    
    if (check(signRes, {
      'lms sign-url: status 200': (r) => r.status === 200,
      'lms sign-url: contem url': (r) => r.json('url') !== undefined
    })) {
      // 4. Simulação realista de reprodução (Sincronização de progresso a cada 30 segundos)
      for (let step = 1; step <= 3; step++) {
        const progressPayload = JSON.stringify({
          lesson_id: 29,
          progress_percent: step * 30,
          is_completed: step === 3
        });

        const progressRes = http.post(`${BASE_URL}/lms/progress`, progressPayload, authHeaders);
        check(progressRes, {
          'lms progress sync: status 200': (r) => r.status === 200
        });

        sleep(10); // Throttling reduzido de 30s para 10s para compactar o tempo do teste de stress
      }
    }
  }

  sleep(1);
}
