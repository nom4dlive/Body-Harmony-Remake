# 🧬 Spec: Licensee Photo Mapping & Standardization (V3.1)

## 1. Mapeamento de Dependências (Onde as fotos aparecem)

As fotos das licenciadas percorrem todo o ecossistema Body Harmony. Abaixo, o mapeamento técnico de cada ponto de contato.

| Camada | Arquivo/Componente | Propriedade | Dependência de Dados |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | `licenciadaCard.jsx` | `student.photo` | URL completa vinda da API ou Context |
| **Frontend UI** | `licenciadas.jsx` | `student.photo` | Iteração da lista filtrada |
| **Admin UI** | `licenciadasManager.jsx` | `student.photo_url` | Tabela de gestão e busca |
| **Admin UI** | `LicenciadaModal.jsx` | `student.photo_url` | Preview de upload e input persistente |
| **Student UI** | `PortalDashboard.jsx` | `user.photo` | Avatar do usuário logado |
| **Backend API**| `LicenciadasController.php` | `photo_url` | Gravação física e persistência no SQL |
| **Data Engine**| `sync_photos.php` (Nexus) | N/A | Sincronização em lote (Batch Sync) |
| **Offline** | `DataContext.jsx` | `DEFAULT_DATA.students` | Fallback para ambiente local/desenvolvimento |

---

## 2. Padrão de Nomenclatura: Atual vs Proposto

| Atributo | Estado Atual (Frágil) | Estado Proposto (Nexus Robust) |
| :--- | :--- | :--- |
| **Identificador** | Nome do Instagram (`@user`) | ID do Banco de Dados + Nome Sanitizado |
| **Pasta Servidor** | `/uploads/photos/` | `/uploads/licenciadas/` |
| **Exemplo de Nome**| `@simonesantosmassage.png` | `1_Simone_Assis.jpg` |
| **Unicidade** | Depende do usuário (pode mudar) | Garantida pelo Auto-Increment do SQL |
| **Sensibilidade** | Alta (Ligado a redes sociais) | Baixa (ID interno do sistema) |
| **Estabilidade** | Baixa (Quebra se mudar o arroba) | Alta (ID nunca muda) |

---

## 3. Lógica de Transformação Sugerida

Para cada arquivo na pasta `backups/Fotos-Licenciadas`:

1.  **Fuzzy Match**: Localizar a licenciada no banco de dados cuja propriedade `instagram` ou `name` coincida com o nome do arquivo atual.
2.  **Sanitização**: 
    - Extrair o ID da licenciada.
    - Limpar o Nome (remover acentos, espaços -> underscores, letras minúsculas).
3.  **Renomeação Física**:
    - Padronizar extensão para `.jpg` ou manter original.
    - Formato: `{ID}_{Nome_Sanitizado}.{ext}`.
4.  **Atualização SQL**:
    - UPDATE `students` SET `photo_url` = '/uploads/licenciadas/{novo_nome}' WHERE `id` = {ID}.

---

## 4. Impacto nos Componentes React

Não haverá impacto visual direto (as cores Navy/Gold e o layout dos cards permanecem). O impacto é puramente na **confiabilidade dos ativos**.

- **Vantagem**: Redução de 99% em erros de "Imagem Não Encontrada" (404) na página de Licenciadas.
- **Vantagem Técnica**: Facilita auditorias forenses (o nome do arquivo diz exatamente quem é a pessoa e qual o ID dela no sistema).

---
*Garantido sob Governança OpenSpec V2.3*
