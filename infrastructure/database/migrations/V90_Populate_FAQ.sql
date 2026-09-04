-- ==============================================================================
-- V90: Popular FAQ com conteúdo Body Harmony
-- Data: 2026-04-01
-- Descrição: Adiciona perguntas frequentes relevantes para licenciadas
-- ==============================================================================

-- Adicionar coluna category se não existir
ALTER TABLE faq ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Geral' AFTER answer;

-- Limpar FAQs existentes (se houver dados de teste)
DELETE FROM faq WHERE id > 0;

-- ============================================================
-- LOGIN E ACESSO
-- ============================================================
INSERT INTO faq (question, answer, category, display_order, is_active) VALUES
('Esqueci minha senha, o que faço?',
 '<p>Você pode gerar uma nova senha temporária diretamente pelo nosso bot do Telegram:</p>
  <ol>
    <li>Acesse <a href="https://t.me/Body_Harmony_Support_bot" target="_blank">@Body_Harmony_Support_bot</a></li>
    <li>Digite <strong>/novasenha</strong></li>
    <li>Confirme com <strong>Sim</strong></li>
    <li>Use a senha gerada para acessar o portal</li>
  </ol>
  <p>A senha temporária expira em 15 minutos. Altere-a no primeiro login.</p>',
 'Login e Acesso', 1, 1),

('Minha conta está bloqueada',
 '<p>Após 5 tentativas de login incorretas, sua conta é bloqueada automaticamente por 15 minutos como medida de segurança.</p>
  <p><strong>O que fazer:</strong></p>
  <ul>
    <li>Aguarde 15 minutos e tente novamente</li>
    <li>Se não lembra a senha, use o bot do Telegram: <a href="https://t.me/Body_Harmony_Support_bot" target="_blank">@Body_Harmony_Support_bot</a></li>
    <li>Digite <strong>/novasenha</strong> para gerar uma nova</li>
  </ul>',
 'Login e Acesso', 2, 1),

('Atingi o limite de dispositivos',
 '<p>Cada licenciada pode acessar o portal em até 3 dispositivos simultâneos. Se atingir o limite:</p>
  <ol>
    <li>Acesse o portal em <a href="https://bodyharmony.com.br/portal-licenciada" target="_blank">bodyharmony.com.br/portal-licenciada</a></li>
    <li>Vá em <strong>Perfil</strong> → <strong>Dispositivos</strong></li>
    <li>Revogue os dispositivos que não usa mais</li>
  </ol>
  <p>Se precisar de ajuda, fale conosco pelo WhatsApp: <a href="https://wa.me/5518996959486" target="_blank">(18) 99695-9486</a></p>',
 'Login e Acesso', 3, 1),

('Meu CPF está errado no cadastro',
 '<p>Se seu CPF está incorreto no sistema, isso pode impedir seu login. Para corrigir:</p>
  <ol>
    <li>Acesse o bot do Telegram: <a href="https://t.me/Body_Harmony_Support_bot" target="_blank">@Body_Harmony_Support_bot</a></li>
    <li>Vincule seu cadastro pelo nome ou email</li>
    <li>Use o comando <strong>/meusdados</strong> para verificar o CPF cadastrado</li>
    <li>Se estiver errado, responda <strong>CPF ERRADO</strong> no bot</li>
  </ol>
  <p>Nossa equipe será notificada e corrigirá o cadastro.</p>',
 'Login e Acesso', 4, 1);

-- ============================================================
-- PLATAFORMA E CURSOS
-- ============================================================
INSERT INTO faq (question, answer, category, display_order, is_active) VALUES
('Como acesso minhas aulas?',
 '<p>Para acessar suas aulas:</p>
  <ol>
    <li>Acesse <a href="https://bodyharmony.com.br/portal-licenciada" target="_blank">bodyharmony.com.br/portal-licenciada</a></li>
    <li>Faça login com seu <strong>CPF</strong> e <strong>senha</strong></li>
    <li>No painel, clique em <strong>Iniciar Aula</strong> ou selecione o módulo desejado</li>
  </ol>
  <p>Você também pode ver seu progresso e acessar a biblioteca de recursos no mesmo portal.</p>',
 'Plataforma e Cursos', 5, 1),

('Assisti as aulas mas meu progresso está zerado',
 '<p>Isso pode acontecer por alguns motivos:</p>
  <ul>
    <li><strong>Cache do navegador:</strong> Limpe o cache pressionando <code>Ctrl + Shift + R</code></li>
    <li><strong>Assista pelo menos 80% da aula:</strong> O progresso só é registrado quando você assiste a maior parte do conteúdo</li>
    <li><strong>Navegador:</strong> Use Chrome ou Edge atualizados para melhor compatibilidade</li>
  </ul>
  <p>Se o problema persistir, contate o suporte pelo WhatsApp: <a href="https://wa.me/5518996959486" target="_blank">(18) 99695-9486</a></p>',
 'Plataforma e Cursos', 6, 1),

('Como solicito meu certificado?',
 '<p>O certificado é gerado automaticamente quando você conclui todas as aulas do módulo. Para verificar:</p>
  <ol>
    <li>Acesse o portal da licenciada</li>
    <li>Vá em <strong>Meu Progresso</strong></li>
    <li>Quando todas as aulas estiverem concluídas (100%), o certificado estará disponível para download</li>
  </ol>
  <p>Se completou todas as aulas e o certificado não aparece, contate o suporte.</p>',
 'Plataforma e Cursos', 7, 1),

('Como uso a Doctor Harmony (IA)?',
 '<p>A Doctor Harmony é sua assistente de casos clínicos com inteligência artificial:</p>
  <ol>
    <li>Acesse o portal da licenciada</li>
    <li>Clique em <strong>Mentoria IA</strong> no menu</li>
    <li>Descreva o caso clínico e envie fotos se necessário</li>
  </ol>
  <p><strong>Importante:</strong> Seus créditos de consulta com a Doctor Harmony são limitados. Para renovar, contate o suporte pelo WhatsApp.</p>',
 'Plataforma e Cursos', 8, 1);

-- ============================================================
-- CADASTRO E DADOS
-- ============================================================
INSERT INTO faq (question, answer, category, display_order, is_active) VALUES
('Meu cadastro está incompleto',
 '<p>Manter seu cadastro atualizado é importante para receber comunicados e certificados. Para verificar e atualizar:</p>
  <ul>
    <li><strong>Pelo bot Telegram:</strong> Use <strong>/verificarcadastro</strong> para ver o que falta e <strong>/atualizar</strong> para preencher</li>
    <li><strong>Pelo portal:</strong> Acesse <strong>Perfil</strong> e atualize seus dados</li>
  </ul>
  <p>Campos importantes: telefone/WhatsApp, Instagram, estado e cidade.</p>',
 'Cadastro e Dados', 9, 1),

('Quero trocar meu email de cadastro',
 '<p>Para alterar seu email de cadastro, entre em contato com o suporte:</p>
  <ul>
    <li>💬 WhatsApp: <a href="https://wa.me/5518996959486" target="_blank">(18) 99695-9486</a></li>
    <li>📧 Email: <a href="mailto:contato@bodyharmony.com.br">contato@bodyharmony.com.br</a></li>
  </ul>
  <p>Informe seu nome completo, email atual e o novo email desejado.</p>',
 'Cadastro e Dados', 10, 1),

('Como vejo meus dados cadastrais?',
 '<p>Você pode consultar seus dados a qualquer momento:</p>
  <ul>
    <li><strong>Pelo bot Telegram:</strong> Use o comando <strong>/meusdados</strong></li>
    <li><strong>Pelo portal:</strong> Acesse <strong>Perfil</strong> no menu lateral</li>
  </ul>
  <p>Se algum dado estiver incorreto, reporte imediatamente pelo bot respondendo <strong>DADO ERRADO</strong>.</p>',
 'Cadastro e Dados', 11, 1);

-- ============================================================
-- FINANCEIRO E LICENÇA
-- ============================================================
INSERT INTO faq (question, answer, category, display_order, is_active) VALUES
('Minha licença venceu?',
 '<p>Para verificar o status da sua licenciatura:</p>
  <ol>
    <li>Acesse o portal da licenciada</li>
    <li>Vá em <strong>Perfil</strong></li>
    <li>Verifique a data de validade da sua licença</li>
  </ol>
  <p>Se não conseguir acessar ou tiver dúvidas, fale conosco: <a href="https://wa.me/5518996959486" target="_blank">WhatsApp</a></p>',
 'Financeiro e Licença', 12, 1),

('Como renovo minha licença?',
 '<p>Para renovar sua licenciatura Body Harmony:</p>
  <ul>
    <li>💬 WhatsApp: <a href="https://wa.me/5518996959486" target="_blank">(18) 99695-9486</a></li>
    <li>🌐 Site: <a href="https://bodyharmony.com.br" target="_blank">bodyharmony.com.br</a></li>
  </ul>
  <p>Nossa equipe irá te orientar sobre valores, condições de pagamento e benefícios da renovação.</p>',
 'Financeiro e Licença', 13, 1),

('Preciso de segunda via do boleto',
 '<p>Para solicitar segunda via de boletos e comprovantes de pagamento:</p>
  <ul>
    <li>💬 WhatsApp: <a href="https://wa.me/5518996959486" target="_blank">(18) 99695-9486</a></li>
    <li>📧 Email: <a href="mailto:contato@bodyharmony.com.br">contato@bodyharmony.com.br</a></li>
  </ul>
  <p>Informe seu nome completo e o período desejado.</p>',
 'Financeiro e Licença', 14, 1);

-- ============================================================
-- SUPORTE
-- ============================================================
INSERT INTO faq (question, answer, category, display_order, is_active) VALUES
('Quero falar com um atendente',
 '<p>Nossa equipe de suporte está disponível para ajudar:</p>
  <ul>
    <li>💬 WhatsApp: <a href="https://wa.me/5518996959486" target="_blank">(18) 99695-9486</a></li>
    <li>📧 Email: <a href="mailto:contato@bodyharmony.com.br">contato@bodyharmony.com.br</a></li>
    <li>🌐 Site: <a href="https://bodyharmony.com.br" target="_blank">bodyharmony.com.br</a></li>
  </ul>
  <p><strong>Horário de atendimento:</strong> Segunda a Sexta, das 9h às 18h.</p>',
 'Suporte', 15, 1),

('Encontrei um problema no site',
 '<p>Para reportar problemas técnicos, nos informe:</p>
  <ul>
    <li>O que você estava fazendo quando o problema ocorreu</li>
    <li>O que aconteceu (mensagem de erro, tela branca, etc.)</li>
    <li>Qual navegador e dispositivo está usando</li>
    <li>Print da tela (se possível)</li>
  </ul>
  <p>Envie pelo WhatsApp: <a href="https://wa.me/5518996959486" target="_blank">(18) 99695-9486</a> ou email: <a href="mailto:suporte@bodyharmony.com.br">suporte@bodyharmony.com.br</a></p>',
 'Suporte', 16, 1),

('Como uso o bot de suporte do Telegram?',
 '<p>Nosso bot de suporte está disponível 24h no Telegram:</p>
  <ol>
    <li>Acesse <a href="https://t.me/Body_Harmony_Support_bot" target="_blank">@Body_Harmony_Support_bot</a></li>
    <li>Digite <strong>/start</strong> e informe seu CPF ou nome</li>
    <li>Use os comandos disponíveis:</li>
  </ol>
  <table style="width:100%;border-collapse:collapse;margin:1rem 0;">
    <tr style="background:#0A3E60;color:#fff;"><th style="padding:8px;text-align:left;">Comando</th><th style="padding:8px;text-align:left;">Função</th></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #333;"><code>/novasenha</code></td><td style="padding:8px;border-bottom:1px solid #333;">Gerar senha temporária</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #333;"><code>/verificarcadastro</code></td><td style="padding:8px;border-bottom:1px solid #333;">Verificar dados pendentes</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #333;"><code>/atualizar</code></td><td style="padding:8px;border-bottom:1px solid #333;">Preencher dados ausentes</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #333;"><code>/meusdados</code></td><td style="padding:8px;border-bottom:1px solid #333;">Ver todos os seus dados</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #333;"><code>/faq</code></td><td style="padding:8px;border-bottom:1px solid #333;">Perguntas frequentes</td></tr>
    <tr><td style="padding:8px;"><code>/ajuda</code></td><td style="padding:8px;">Falar com suporte humano</td></tr>
  </table>',
 'Suporte', 17, 1);
