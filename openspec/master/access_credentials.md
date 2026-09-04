# Especificação de Credenciais de Acesso (Ambiente Dev & Staging)
**Ambiente:** Desenvolvimento (Local) & Staging (VPS Hostinger)
**Fonte da Verdade:** `infrastructure/database/migrations/` e `apps/web-app/.env`

> ⚠️ **ATENÇÃO:** Em conformidade com a política *Zero Hardcode Policy* (Nexus V3.2), todas as credenciais reais e chaves de acesso são gerenciadas estritamente via arquivos `.env` locais/produção e nunca devem ser comitadas no repositório.

---

## 1. Administradores
| Função | Usuário | Senha Padrão (Dev) | Variável de Ambiente |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `nom4d` | *(Definido no .env local)* | `SUPERADMIN_PASS` |
| **Superadmin** | `Josi` | *(Definido no .env local)* | `ADMIN_JOSI_PASSWORD` |

---

## 2. Licenciadas (Lista de Usuários - Master V36.1)
Estas contas estarão disponíveis ao importar o schema unificado em `infrastructure/database/DATABASE_MASTER_V36_1.sql`.

*A senha padrão para ambiente de desenvolvimento local é configurada via `DEFAULT_STUDENT_PASSWORD` no `.env`.*

| ID | Nome | Usuário |
| :--- | :--- | :--- |
| 1 | Simône Àssis | `simonesantosmassage` |
| 2 | Kaprice Meirelles | `kaprice_meirelles` |
| 3 | Julia Justo | `a.fabrica.de.musas` |
| 4 | Luciane Rezende | `esteticalurezende` |
| 5 | Sara Ribeiro | `life.space.estetica` |
| 6 | Gabriella Ribeiro | `gabriellaribeiroestetica` |
| 7 | Juliana Gomes | `fisioterapiadiasgomes` |
| 8 | Dayane Guillen | `daianeguillen` |
| 9 | Paula Cristina Feliciano | `esteticapaulafeliciano` |
| 10 | Lusilene Leite | `lusilene_leite` |
| 11 | Michele Penteado | `michelepenteado_estetica` |
| 12 | Marina Gersony | `marinagersonystudio` |
| 13 | Viviane Baptistella | `clinicamentallizeamericana` |
| 14 | Katyuscia Saturnino | `katyusciasaturnino` |
| 15 | Luciana Rubo | `bellaluestetica` |
| 16 | Perla Cristina | `perlacristinaesteticista` |
| 17 | Ivana Giacon | `ivanargiacon` |
| 18 | Bruna Gimenes | `biocore360_oficial` |
| 19 | Isabella Mazzari Alvares | `isabellamazzari.fisio` |
| 20 | Rejane Souto | `rejanesouto_` |
| 21 | Daniella Garcia | `esteticadanigarcia` |
| 22 | Hávylla Vitória | `havyllavitoria.fisio` |
| 23 | Paola Antunes | `clinicapaolaantunes` |
| 24 | Ana Bica | `biqueclinic` |
| 25 | Rubiana Reusing | `rubianareusing` |
| 26 | Gabriela Gasque | `bodyharmony.marilia` |
| 27 | Joice Burrego | `joiceburrego` |
| 28 | Michelle Salvador | `fisiomichellesalvador` |
| 29 | Fabiana Medina | `fabianamedinaestetica` |
| 30 | Luana Reis | `luanareisoficial` |
| 31 | Lilian Motta | `esteticalilianmotta` |
| 32 | Nanda Raggon | `nandaraggon` |
| 33 | Leticia Caetano | `leh.caetano_` |
| 34 | Sirlene Coutinho Souza | `siu_coutinho_esthetique` |
| 35 | Elisangela Martins | `uniquestar____` |
| 36 | Adriana Fernandez | `Adrianalfernandez` |
| 37 | Thamyres Menezes | `clinicalecorp_` |
| 38 | Joselene Silva | `josisilva_estetica` |

> **Nota:** Ao importar o banco de produção, as licenciadas reais serão carregadas com seus respectivos hashes de senha criptografados.

---

## 3. Servidor de Staging (VPS Hostinger)
*   **Identificação do Nó:** `HOSTINGER_VPS`
*   **Host / IP:** Configurado via `DB_STAGE_HOST` no `.env`
*   **Porta SSH:** `22` (autenticação via chaves SSH locais protegidas por `.gitignore`)
*   **Porta MySQL:** `3306` (restrita por firewall)
*   **Banco de Dados:** Configurado via `DB_STAGE_NAME`, `DB_STAGE_USER`, `DB_STAGE_PASS` no `.env` local.

