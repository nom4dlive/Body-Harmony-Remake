-- Migration V103: Seed Official Templates for All 6 Categories in Body Harmony
SET NAMES utf8mb4;

-- [Licenciamento] contrato-licenciamento-padrao
INSERT INTO `contract_templates` (`slug`, `title`, `category`, `description`, `version`, `variables_schema`, `content_html`, `is_active`, `created_at`, `updated_at`)
VALUES ('contrato-licenciamento-padrao', 'Contrato de Licenciamento de Uso de Marca e Método Body Harmony® (Oficial)', 'Licenciamento', 'Minuta jurídica oficial integral de Licenciamento Body Harmony® com 23 cláusulas, exclusividade territorial, taxas, confidencialidade, não-concorrência e foro de Assis/SP.', 'v1.0', '[{"id": "qualificacao", "title": "1. Qualificação da Licenciada", "icon": "user", "fields": [{"key": "LICENCIANTE_CNPJ", "label": "CNPJ da Licenciante", "type": "cnpj", "default_value": "55.658.939/0001-30", "required": true}, {"key": "LICENCIADA_RAZAO_SOCIAL", "label": "Razão Social / Nome da Licenciada", "type": "text", "placeholder": "Ex: 49.930.435 YONALIA SANTOS DE OLIVEIRA", "required": true}, {"key": "LICENCIADA_CNPJ_CPF", "label": "CNPJ ou CPF da Licenciada", "type": "cpf_cnpj", "placeholder": "00.000.000/0000-00", "required": true}, {"key": "LICENCIADA_ENDERECO", "label": "Endereço Residencial / Sede", "type": "text", "placeholder": "Rua, Número, Bairro", "required": true}, {"key": "LICENCIADA_CIDADE_UF", "label": "Cidade / UF da Licenciada", "type": "text", "placeholder": "Ex: São Paulo/SP", "required": true}, {"key": "LICENCIADA_CEP", "label": "CEP da Licenciada", "type": "cep", "placeholder": "00000-000", "required": true}, {"key": "LICENCIADA_REPRESENTANTE_NOME", "label": "Nome da Representante Legal", "type": "text", "placeholder": "Nome completo", "required": true}, {"key": "LICENCIADA_NACIONALIDADE", "label": "Nacionalidade", "type": "text", "default_value": "brasileira", "required": true}, {"key": "LICENCIADA_ESTADO_CIVIL", "label": "Estado Civil", "type": "text", "default_value": "solteira", "required": true}, {"key": "LICENCIADA_PROFISSAO", "label": "Profissão", "type": "text", "default_value": "esteticista", "required": true}, {"key": "LICENCIADA_RG", "label": "RG da Representante", "type": "text", "placeholder": "00.000.000-0", "required": true}, {"key": "LICENCIADA_CPF", "label": "CPF da Representante", "type": "cpf", "placeholder": "000.000.000-00", "required": true}]}, {"id": "territorialidade", "title": "2. Territorialidade & Operação", "icon": "map", "fields": [{"key": "ENDERECO_OPERACIONAL", "label": "Endereço da Clínica / Atuação", "type": "text", "placeholder": "Rua, Número, Bairro", "required": true}, {"key": "CIDADE_OPERACIONAL", "label": "Cidade Operacional", "type": "text", "placeholder": "Ex: São Paulo", "required": true}, {"key": "ESTADO_OPERACIONAL", "label": "Estado Operacional (UF)", "type": "text", "placeholder": "SP", "required": true}, {"key": "DELIMITACAO_TERRITORIAL", "label": "Delimitação Territorial", "type": "text", "default_value": "Raio de 50.000 habitantes", "required": true}]}, {"id": "financeiro", "title": "3. Condições Financeiras", "icon": "dollar", "fields": [{"key": "VALOR_TAXA_INICIAL_NUM", "label": "Valor Taxa Inicial (R$)", "type": "currency", "default_value": "7.000,00", "required": true}, {"key": "VALOR_TAXA_INICIAL_EXTENSO", "label": "Valor Inicial por Extenso", "type": "text", "default_value": "sete mil reais", "required": true}, {"key": "FORMA_PAGAMENTO_TAXA", "label": "Forma de Pagamento", "type": "select", "options": ["PIX", "Cartão de Crédito à vista", "Cartão de Crédito parcelado", "Transferência Bancária", "Boleto Bancário"], "default_value": "PIX", "required": true}]}, {"id": "penalidades", "title": "4. Pós-Contratual & Penalidades", "icon": "shield", "fields": [{"key": "VALOR_TAXA_POS_CONTRATUAL_NUM", "label": "Taxa Pós-Contratual (R$)", "type": "currency", "default_value": "6.000,00", "required": true}, {"key": "VALOR_TAXA_POS_CONTRATUAL_EXTENSO", "label": "Taxa Pós-Contratual por Extenso", "type": "text", "default_value": "seis mil reais", "required": true}]}, {"id": "comunicacoes", "title": "5. Comunicações & Contato", "icon": "envelope", "fields": [{"key": "LICENCIADA_EMAIL_OFICIAL", "label": "E-mail Oficial da Licenciada", "type": "email", "placeholder": "email@exemplo.com", "required": true}, {"key": "LICENCIADA_TELEFONE", "label": "Telefone / WhatsApp", "type": "phone", "placeholder": "(00) 00000-0000", "required": true}]}, {"id": "fechamento", "title": "6. Fechamento & Testemunhas", "icon": "pen", "fields": [{"key": "CIDADE_CELEBRACAO", "label": "Cidade de Celebração", "type": "text", "default_value": "Assis/SP", "required": true}, {"key": "DATA_CELEBRACAO_EXTENSO", "label": "Data por Extenso", "type": "text", "required": true}, {"key": "TESTEMUNHA_1_NOME", "label": "Testemunha 1 - Nome", "type": "text", "placeholder": "Nome completo", "required": false}, {"key": "TESTEMUNHA_1_CPF", "label": "Testemunha 1 - CPF", "type": "cpf", "placeholder": "000.000.000-00", "required": false}, {"key": "TESTEMUNHA_2_NOME", "label": "Testemunha 2 - Nome", "type": "text", "placeholder": "Nome completo", "required": false}, {"key": "TESTEMUNHA_2_CPF", "label": "Testemunha 2 - CPF", "type": "cpf", "placeholder": "000.000.000-00", "required": false}]}]', '<div class="contract-logo-header" style="text-align: center; margin-bottom: 20px;">
  <img src="/assets/images/body-harmony-logo-color.png" alt="Body Harmony®" style="height: 75px; width: auto; max-width: 280px; object-fit: contain;" />
</div>
<div class="document-header" style="text-align: center; margin-bottom: 25px;">
  <h1 style="color: #0A3E60; font-size: 18pt; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">CONTRATO DE LICENCIAMENTO DE USO DE MARCA E OUTRAS AVENÇAS</h1>
  <p style="color: #666; font-size: 10pt; font-style: italic;">Instrumento Particular de Outorga de Licença de Marca, Método e Know-How Body Harmony®</p>
</div>

<p style="text-align: justify; line-height: 1.6;">
Pelo presente instrumento particular e na melhor forma de direito, os abaixo qualificados e assinados:
</p>

<p style="text-align: justify; line-height: 1.6;">
<strong>LICENCIANTE:</strong> <strong>BODY HARMONY ELETRO ESTIMULAÇÃO LTDA.</strong> (ou <strong>BODY HARMONY EDUCAÇÃO LTDA.</strong>), pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº <strong>{{LICENCIANTE_CNPJ}}</strong>, com sede na Rua Sebastião da Silva Leite, nº 456, CEP 19.814-370, na cidade de Assis/SP, neste ato representada por sua sócia administradora <strong>JOSELENE APARECIDA DA SILVA</strong>, brasileira, empresária, portadora do CPF nº <strong>362.082.328-64</strong>, residente e domiciliada na Rua Sebastião da Silva Leite, nº 456, Assis/SP, doravante denominada simplesmente <strong>LICENCIANTE</strong>;
</p>

<p style="text-align: justify; line-height: 1.6;">
<strong>LICENCIADA:</strong> <strong>{{LICENCIADA_RAZAO_SOCIAL}}</strong>, pessoa jurídica de direito privado (ou pessoa física habilitada), inscrita no CNPJ/CPF sob o nº <strong>{{LICENCIADA_CNPJ_CPF}}</strong>, com sede/domicílio na <strong>{{LICENCIADA_ENDERECO}}</strong>, <strong>{{LICENCIADA_CIDADE_UF}}</strong>, CEP <strong>{{LICENCIADA_CEP}}</strong>, neste ato representada por <strong>{{LICENCIADA_REPRESENTANTE_NOME}}</strong>, nacionalidade <strong>{{LICENCIADA_NACIONALIDADE}}</strong>, estado civil <strong>{{LICENCIADA_ESTADO_CIVIL}}</strong>, profissão <strong>{{LICENCIADA_PROFISSAO}}</strong>, portadora do RG nº <strong>{{LICENCIADA_RG}}</strong> e inscrita no CPF sob o nº <strong>{{LICENCIADA_CPF}}</strong>, doravante denominada simplesmente <strong>LICENCIADA</strong>;
</p>

<p style="text-align: justify; line-height: 1.6;">
Resolvem as partes, de comum acordo, celebrar o presente <strong>CONTRATO DE LICENCIAMENTO DE USO DE MARCA E OUTRAS AVENÇAS</strong>, que se regerá pelas cláusulas e condições a seguir estabelecidas, bem como pela legislação aplicável à espécie, em especial a Lei nº 9.279/96 (Lei da Propriedade Industrial) e o Código Civil Brasileiro.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CONSIDERAÇÕES PRELIMINARES</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>CONSIDERANDO QUE</strong> a LICENCIADA tem interesse em utilizar a referida marca para os fins específicos descritos neste contrato;<br>
<strong>CONSIDERANDO QUE</strong> as partes desejam estabelecer os termos e condições para o uso adequado da marca, preservando sua integridade, identidade e valor de mercado;<br>
Resolvem celebrar o presente Contrato de Licenciamento de Uso de Marca, de acordo com as seguintes cláusulas e condições:
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA PRIMEIRA - DO OBJETO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>1.1.</strong> O presente Contrato tem por objeto o licenciamento não exclusivo, pelo LICENCIANTE à LICENCIADA, do direito de uso da marca <strong>"BODY HARMONY"</strong>, com pedido de registro em análise no Instituto Nacional da Propriedade Industrial (INPI) sob o nº 935287531, na(s) classe(s) "NCL(12) 44", de especificação de "Estética facial e corporal; Serviços de estética", bem como da utilização específica do método a ela associado, de mesmo nome "BODY HARMONY".<br>
<strong>1.2.</strong> Constitui objeto também deste contrato a utilização específica do <strong>"MÉTODO BODY HARMONY"</strong>, do logotipo "BODY HARMONY" e dos demais conteúdos denominados "CONSULTA BODY HARMONY", que deverão ser usadas junto ao consumidor final, para a implementação do "MÉTODO DE ELETROESTIMULAÇÃO BODY HARMONY".<br>
<strong>1.3.</strong> Constitui, ainda, objeto deste contrato, o compromisso de aquisição pela LICENCIADA dos produtos, serviços, cursos, palestras, conferências e demais conteúdos necessários para a implementação do método licenciado, bem como de participação em eventos organizados e promovidos pela LICENCIANTE.<br>
<strong>1.4.</strong> O licenciamento concedido por este instrumento não transfere à LICENCIADA a propriedade da marca, sendo concedido à LICENCIADA apenas o direito de uso nos termos, prazos e condições aqui estipulados.<br>
<strong>1.5.</strong> A LICENCIADA reconhece expressamente que o presente contrato não transfere a titularidade da marca, concedendo-se apenas o direito de uso nos termos, prazos e condições aqui estabelecidos.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA SEGUNDA - DA NATUREZA DO CONTRATO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>2.1.</strong> O presente contrato constitui uma licença de uso de marca, nos termos do art. 139 e seguintes da Lei nº 9.279/96 (Lei de Propriedade Industrial), não implicando em transferência de titularidade ou qualquer direito de propriedade sobre a marca.<br>
<strong>2.2.</strong> Este contrato não estabelece qualquer forma de sociedade, associação, agência, consórcio, joint venture, vínculo empregatício ou responsabilidade solidária entre as partes.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA TERCEIRA - DOS LIMITES DO LICENCIAMENTO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>3.1.</strong> A marca e o logotipo licenciados deverão ser utilizados pela LICENCIADA exclusivamente para os fins de divulgação e comercialização dos produtos e serviços produzidos e comercializados com a marca "BODY HARMONY", sendo expressamente proibida a vinculação da marca para comercialização de serviços e produtos distintos da grade do LICENCIANTE, e/ou de serviços ou produtos de terceiros ou da própria LICENCIADA.<br>
<strong>3.2.</strong> É proibido à LICENCIADA a comercialização, cessão, utilização em faturas, notas fiscais e impressos fiscais de qualquer tipo ou natureza, do nome, da marca, logotipo e sinais visuais da marca "BODY HARMONY", salvo mediante expressa autorização por escrito.<br>
<strong>3.3.</strong> Fica esclarecido que a utilização do nome, da marca e da logomarca pela LICENCIADA somente é permitida para a realização dos fins previstos neste contrato, ficando vedada a assunção de qualquer tipo de obrigação em nome do LICENCIANTE.<br>
<strong>3.4.</strong> Fica expressamente vedada a utilização pela LICENCIADA da marca/nome/logotipo do LICENCIANTE ou sua denominação para fins diversos aos previstos neste instrumento e em associação com outras marcas, pessoas, empresas ou produtos.<br>
<strong>3.5.</strong> Fica expressamente vedada a utilização pela LICENCIADA da marca/nome/logotipo dos serviços do LICENCIANTE de forma contrária à boa-fé e aos bons costumes.<br>
<strong>3.6.</strong> O uso da marca/nome/logotipo e dos serviços são de responsabilidade total da LICENCIADA, assumindo todos os ônus e sujeitando-se às penalidades previstas, caso seja verificado o uso indevido.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA QUARTA - DA TERRITORIALIDADE E EXCLUSIVIDADE</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>4.1.</strong> A licença para uso da marca "BODY HARMONY" é concedida exclusivamente para o território correspondente à área de 50.000 (cinquenta mil) habitantes ou delimitada por Bairros quando localizada em Capitais de Estado, sendo vedada à LICENCIADA a utilização, divulgação, comercialização, publicidade ou qualquer outra forma de exploração da marca fora dos limites territoriais estabelecidos.<br>
<strong>4.2.</strong> O local específico em que a LICENCIADA exercerá as atividades econômicas que são objeto do presente contrato será na <strong>{{ENDERECO_OPERACIONAL}}</strong>, cidade de <strong>{{CIDADE_OPERACIONAL}}</strong> - <strong>{{ESTADO_OPERACIONAL}}</strong>.<br>
<strong>4.3.</strong> A LICENCIADA se obrigará a desempenhar as atividades relacionadas exclusivamente no endereço mencionado, e, também, se obrigará, na hipótese de desejar desempenhá-la em mais de um endereço, dentro ou fora do município ou bairro, a adquirir onerosamente uma licença adicional mediante novo credenciamento e obter autorização formal do LICENCIANTE, o que acontecerá através de aditivo contratual e somente avançará mediante a existência de disponibilidade.<br>
<strong>4.4.</strong> A exclusividade é concedida à LICENCIADA no território definido neste contrato, ficando o LICENCIANTE impedido de conceder outras licenças para o mesmo território durante a vigência deste contrato.<br>
<strong>4.5.</strong> Mesmo em caso de concessão de exclusividade, o LICENCIANTE preserva para si o direito de utilizar diretamente a marca no território licenciado, caso entenda conveniente e oportuno.<br>
<strong>4.6.</strong> A LICENCIADA compromete-se a comunicar imediatamente ao LICENCIANTE qualquer uso indevido ou não autorizado da marca por terceiros no território licenciado que venha a tomar conhecimento, devendo cooperar com o LICENCIANTE nas medidas necessárias para a proteção da marca.<br>
<strong>4.7.</strong> Não será permitido à LICENCIADA fazer uso dos produtos, serviços e da marca "BODY HARMONY" fora do endereço físico previsto na Cláusula 4.2, incluindo-se, na proibição, o próprio atendimento "on line" para tal finalidade, exceto se previamente for autorizado pelo LICENCIANTE.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA QUINTA - DO CONTROLE DE QUALIDADE</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>5.1.</strong> A LICENCIADA obriga-se a prestar serviços, comercializar, distribuir ou vender os produtos ou serviços identificados pela marca licenciada respeitando rigorosamente os padrões de qualidade estabelecidos pelo LICENCIANTE, conforme especificações contidas nos manuais institucionais, bem como quaisquer atualizações ou orientações adicionais que venham a ser fornecidas pelo LICENCIANTE durante a vigência do contrato.<br>
<strong>5.2.</strong> A LICENCIADA compromete-se a submeter à aprovação prévia do LICENCIANTE amostras de todos os serviços ou produtos que pretenda prestar ou comercializar com a marca licenciada, os quais somente poderão ser produzidos e distribuídos após aprovação expressa do LICENCIANTE.<br>
<strong>5.3.</strong> O LICENCIANTE poderá, a qualquer tempo e a seu exclusivo critério, modificar os padrões de qualidade, mediante comunicação escrita à LICENCIADA, que terá o prazo de 90 (noventa) dias para adaptar-se às novas exigências.<br>
<strong>5.4.</strong> Caso seja constatado que os produtos ou serviços identificados pela marca licenciada não atendem aos padrões de qualidade exigidos, o LICENCIANTE notificará a LICENCIADA, que deverá:<br>
&nbsp;&nbsp;a) Suspender imediatamente a fabricação, comercialização, distribuição ou prestação dos serviços não conformes;<br>
&nbsp;&nbsp;b) Recolher do mercado, às suas expensas, todos os produtos não conformes, apresentando ao LICENCIANTE, no prazo de 15 (quinze) dias, relatório detalhado das ações implementadas e resultados alcançados;<br>
&nbsp;&nbsp;c) Implementar, no prazo máximo de 30 (trinta) dias, todas as medidas corretivas necessárias para adequar os produtos ou serviços aos padrões de qualidade exigidos.<br>
<strong>5.5.</strong> A reincidência na violação dos padrões de qualidade exigidos pelo LICENCIANTE poderá configurar infração contratual grave, passível de rescisão imediata por culpa da LICENCIADA, sem prejuízo da aplicação das multas e penalidades previstas neste instrumento e da responsabilidade por perdas e danos.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA SEXTA - DAS CONDIÇÕES ESPECÍFICAS DO MÉTODO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>6.1.</strong> A LICENCIADA obriga-se a submeter o cliente final, antes de ser iniciado no programa licenciado, a uma entrevista sobre seu histórico de saúde, e, na hipótese de ser informada a existência de doenças pré-existentes, deverá exigir a apresentação de autorização médica formal, da especialidade correspondente, autorizando a participação no método.<br>
<strong>6.2.</strong> Na eventual hipótese de ter sido sonegada pelo cliente final a informação referente à preexistência de doença, que venha a ser descoberta posteriormente, a LICENCIADA ficará obrigada a interromper, imediatamente, o ciclo do programa junto ao mesmo, e deverá orientar expressamente que o cliente procure assistência médica pertinente.<br>
<strong>6.3.</strong> A LICENCIADA obriga-se a assegurar que em hipótese alguma o método poderá ser aplicado a pessoas com morbidades e comorbidades graves sem laudo, a menores de 14 (catorze) anos de idade, gestantes, portadores de marca-passo, cardiopatas e pessoas com histórico de trombose ou qualquer outra enfermidade ou suspeita de enfermidade que possa prejudicar a saúde do consumidor, sendo que, quanto a lactantes, somente poderão mediante expressa autorização médica.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA SÉTIMA - DA REMUNERAÇÃO – TAXAS – VALOR MÍNIMO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>7.1.</strong> Em contraprestação à licença objeto deste contrato, a LICENCIADA pagará ao LICENCIANTE:<br>
&nbsp;&nbsp;a) Uma taxa inicial, de caráter não reembolsável, no valor total de <strong>R$ {{VALOR_TAXA_INICIAL_NUM}} ({{VALOR_TAXA_INICIAL_EXTENSO}})</strong>, realizado mediante a modalidade: <strong>{{FORMA_PAGAMENTO_TAXA}}</strong>.<br>
<strong>7.2.</strong> O pagamento da Taxa inicial será efetuado mediante depósito, transferência bancária ou PIX para a conta indicada pelo LICENCIANTE, sendo considerada quitada a obrigação somente após a efetiva disponibilização do recurso na referida conta.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA OITAVA - DA AQUISIÇÃO DE PRODUTOS E SERVIÇOS EDUCACIONAIS</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>8.1.</strong> A LICENCIADA se compromete a adquirir exclusivamente os produtos e serviços indicados pelo LICENCIANTE como de uso obrigatório para o desenvolvimento do método licenciado, durante a vigência do presente contrato.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA NONA - DA VIGÊNCIA E RENOVAÇÃO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>9.1.</strong> O presente contrato terá vigência pelo prazo de 24 (vinte e quatro) meses contados a partir da data de sua assinatura.<br>
<strong>9.2.</strong> Findo o prazo estipulado, o contrato será prorrogado automaticamente por igual período, observadas as condições estabelecidas neste contrato.<br>
<strong>9.3.</strong> Na hipótese de renovação do presente contrato, por igual período ao que lhe foi pactuado, com prévia comunicação da LICENCIADA à LICENCIANTE, por e-mail, do interesse de renovar em até 60 (sessenta) dias antes do término, não serão cobrados novos custos de licenciamento referindo-se ao valor previsto na Cláusula 7.1, alínea "a".<br>
<strong>9.4.</strong> Por outro lado, na hipótese do prazo em questão não ser respeitado, mas a LICENCIADA pretender promover a renovação contratual com aviso em prazo compreendido entre o 59° (quinquagésimo nono) dia e o do dia do vencimento do contrato, poderá o LICENCIANTE, a seu critério exclusivo, rejeitar ou aceitar a renovação mediante o pagamento do licenciamento ou dispensar a cobrança prevista na Cláusula 7.1, alínea "a", a seu exclusivo critério.<br>
<strong>9.5.</strong> Na hipótese exclusiva de renovação depois de vencido o prazo de validade do presente contrato, será obrigatória a aquisição de nova licença, com pagamento do preço previsto na Cláusula 7.1, alínea "a", e, também, será necessária expressa aceitação do LICENCIANTE, ficando desde já ADVERTIDA de que poderá não mais existir disponibilidade de licença para a área pretendida.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA DÉCIMA - DA PROIBIÇÃO DE SUBLICENCIAMENTO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>10.1.</strong> A LICENCIADA não poderá sublicenciar, transferir, ceder ou de qualquer forma dispor, total ou parcialmente, dos direitos e obrigações decorrentes deste contrato, nem autorizar terceiros a utilizar a marca licenciada, sem a prévia e expressa autorização por escrito do LICENCIANTE.<br>
<strong>10.2.</strong> Qualquer tentativa de sublicenciamento, transferência ou cessão em violação a esta cláusula será considerada nula e sem efeito, configurando infração contratual grave passível de rescisão imediata por culpa da LICENCIADA, sem prejuízo da aplicação de multa no valor de R$ 100.000,00 (cem mil reais) e da responsabilidade por perdas e danos, inclusive honorários advocatícios no percentual de 20%, bem como passível das medidas judiciais cabíveis.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA DÉCIMA PRIMEIRA - DAS OBRIGAÇÕES DO LICENCIANTE</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>11.1.</strong> Constituem obrigações do LICENCIANTE:<br>
&nbsp;&nbsp;a) Permitir, ao longo da vigência contratual, que a LICENCIADA possa se apresentar, ao público consumidor, como licenciada da marca "BODY HARMONY";<br>
&nbsp;&nbsp;b) Permitir o uso de sua marca e logotipo para a divulgação e comercialização do método licenciado, nos limites territoriais estabelecidos;<br>
&nbsp;&nbsp;c) Disponibilizar, a título de cortesia, à LICENCIADA, materiais publicitários oficiais, padrão para toda rede de licenciadas, desde que julgue conveniente;<br>
&nbsp;&nbsp;d) Contribuir, se possível e conveniente, com a LICENCIADA em suas ações comerciais através das redes sociais, reuniões em grupo, palestras e publicações;<br>
&nbsp;&nbsp;e) Permitir acesso à LICENCIADA, ao longo do período de vigência do presente contrato, à área de seu ambiente virtual (site oficial/plataforma LMS) destinada exclusivamente à divulgação e atualização relacionada à presente licença;<br>
&nbsp;&nbsp;f) Fornecer todas as orientações, instruções e informações imprescindíveis acerca dos serviços para a perfeita execução deste instrumento;<br>
&nbsp;&nbsp;g) Indicar, quando necessário, profissionais especializados ligados ao programa licenciado, para suporte técnico;<br>
&nbsp;&nbsp;h) Zelar pela integridade e reputação da marca licenciada;<br>
&nbsp;&nbsp;i) Defender a marca contra infrações de terceiros e indenizar a LICENCIADA em caso de evicção, conforme previsto no art. 447 e seguintes do Código Civil.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA DÉCIMA SEGUNDA - DAS OBRIGAÇÕES DA LICENCIADA</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>12.1.</strong> Constituem obrigações da LICENCIADA:<br>
&nbsp;&nbsp;a) Utilizar o nome, marca e logotipo "BODY HARMONY" na divulgação dos conteúdos em geral e na comercialização dos serviços e produtos delimitados pela presente licença, estritamente nos termos dispostos neste instrumento e durante sua vigência;<br>
&nbsp;&nbsp;b) Obter assinatura, junto ao público em que for aplicar o método licenciado, do "Termo de Cessão de Direito de Imagem" a ser fornecido pelo LICENCIANTE, e devolvê-lo assinado para arquivamento e gestão do conteúdo;<br>
&nbsp;&nbsp;c) Não desenvolver, aplicar, indicar ou comercializar na sua atividade diária, nenhum outro método similar de eletroestimulação, ou produtos, seja desenvolvido particularmente ou por terceiros, que não sejam aqueles objetos deste contrato;<br>
&nbsp;&nbsp;d) Seguir o padrão de qualidade estabelecido pelo LICENCIANTE, bem como utilizar os materiais oficiais ou material próprio, desde que elaborado dentro das instruções;<br>
&nbsp;&nbsp;e) Divulgar os serviços licenciados em redes sociais próprias, sítios eletrônicos, revistas especializadas e através de malas diretas, de forma recorrente mediante 2 (duas) postagens semanais em cada rede social da LICENCIADA;<br>
&nbsp;&nbsp;f) Informar e orientar seus clientes sobre o caráter informativo e educativo dos conteúdos disponibilizados e que estes devem ser utilizados sob acompanhamento de um especialista;<br>
&nbsp;&nbsp;g) Zelar pelo bom uso do nome/marca/logotipo do LICENCIANTE na divulgação dos conteúdos, guardando sigilo de todas as informações e dados cadastrais;<br>
&nbsp;&nbsp;h) Manter sigilo sobre informações confidenciais, inclusive após a rescisão deste contrato;<br>
&nbsp;&nbsp;i) Tomar todas as cautelas necessárias para o perfeito exercício de suas atividades e zelar pela adequada, legal, lícita, moral e correta divulgação dos conteúdos;<br>
&nbsp;&nbsp;j) Adquirir exclusivamente os produtos e serviços indicados pelo LICENCIANTE como de uso obrigatório para o desenvolvimento do método licenciado;<br>
&nbsp;&nbsp;k) Aplicar rigorosamente as informações e instruções repassadas no curso de formação;<br>
&nbsp;&nbsp;l) Treinar seus funcionários de acordo com o padrão estabelecido pelo LICENCIANTE;<br>
&nbsp;&nbsp;m) Recomenda-se à LICENCIADA, para obter equilíbrio financeiro na utilização da licença, e para assegurar um melhor resultado aos seus clientes, negociar a venda do "BODY HARMONY" pelo preço mínimo sugerido de R$ 150,00 (cento e cinquenta reais) a sessão da prestação de serviço;<br>
&nbsp;&nbsp;n) Responder a todos os questionários ou indagações, seja pelo LICENCIANTE ou por seu corpo técnico, no prazo máximo de 48 (quarenta e oito) horas;<br>
&nbsp;&nbsp;o) Atender aos clientes consumidores dos serviços licenciados e produtos fornecidos em estabelecimento adequado, detentor de alvará de funcionamento e ajustado às exigências municipais, estaduais e federais;<br>
&nbsp;&nbsp;p) Informar imediatamente ao LICENCIANTE sobre qualquer uso indevido da marca por terceiros de que venha a ter conhecimento, fornecendo todos os elementos necessários para que o LICENCIANTE possa tomar as medidas cabíveis;<br>
&nbsp;&nbsp;q) Não registrar ou tentar registrar a marca ou qualquer marca semelhante em seu próprio nome, em qualquer país ou território;<br>
&nbsp;&nbsp;r) Permitir que o LICENCIANTE, mediante prévio agendamento, realize inspeções periódicas para verificar a correta utilização da marca e a manutenção do padrão de qualidade exigido;<br>
&nbsp;&nbsp;s) Utilizar a marca sempre acompanhada da indicação "Marca Registrada" ou do símbolo ® adequadamente posicionado, após a aprovação definitiva do registro no INPI;<br>
&nbsp;&nbsp;t) O "MÉTODO BODY HARMONY" de Eletroestimulação tem como um de seus diferenciais a imprescindível e prévia consulta médica do consumidor com o profissional médico indicado pela LICENCIANTE, cuja consulta individual será paga adicionalmente pela LICENCIADA;<br>
&nbsp;&nbsp;u) A LICENCIADA obriga-se a utilizar o nome, marca e logotipo "BODY HARMONY" na divulgação dos conteúdos em geral e na comercialização dos produtos e serviços desta licença, estritamente nos termos dispostos neste instrumento e pelo prazo de sua vigência;<br>
&nbsp;&nbsp;v) É proibida a publicidade ou comercialização do "BODY HARMONY" em sites de classificados de vendas, bem como em classificados de jornais ou revistas sem autorização.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA DÉCIMA TERCEIRA - DOS RISCOS DA ATIVIDADE</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>13.1.</strong> A LICENCIADA é a única e exclusiva responsável, direta, indireta ou regressivamente pelos riscos da atividade que desenvolve e pela sua rede de negócios (equipe), sem qualquer responsabilidade solidária ou subsidiária do LICENCIANTE em caso de reclamação judicial ou extrajudicial de qualquer natureza.<br>
<strong>13.2.</strong> A LICENCIADA deverá utilizar sua rede de negócios (linha organizacional/equipe) para divulgação da marca licenciada, responsabilizando-se, de forma exclusiva, pela contratação de terceiros e empregados e pelo pagamento dos respectivos encargos legais, tais como obrigações trabalhistas, sociais e previdenciárias, os quais não serão suportados pelo LICENCIANTE.<br>
<strong>13.3.</strong> Declaram as partes contratantes que o presente contrato não estabelece qualquer forma de associação, preposição, vínculo societário ou solidariedade entre seus signatários, competindo a cada um, particularmente e com exclusividade, o cumprimento das suas respectivas obrigações comerciais, contratuais, trabalhistas, sociais, previdenciárias, fiscais e tributárias.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA DÉCIMA QUARTA - DA PROTEÇÃO DA MARCA E RESPONSABILIDADE</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>14.1.</strong> A LICENCIADA reconhece o valor e a reputação da marca licenciada, comprometendo-se a utilizá-la de forma a preservar e aumentar esse valor e reputação, abstendo-se de qualquer prática que possa prejudicá-los.<br>
<strong>14.2.</strong> A LICENCIADA será integralmente responsável por quaisquer danos, materiais ou morais, diretos ou indiretos, que venha a causar ao LICENCIANTE, à marca licenciada ou a terceiros em decorrência do uso inadequado, indevido ou não autorizado da marca licenciada.<br>
<strong>14.3.</strong> A LICENCIADA obriga-se a indenizar e manter o LICENCIANTE indene contra quaisquer reclamações, demandas, ações judiciais ou administrativas, perdas, danos, custos, despesas e honorários advocatícios decorrentes de:<br>
&nbsp;&nbsp;a) Violação, pela LICENCIADA, de qualquer obrigação assumida neste contrato;<br>
&nbsp;&nbsp;b) Violação, pela LICENCIADA, de qualquer direito de terceiros, incluindo, mas não se limitando a direitos de propriedade intelectual, direitos da personalidade, direitos do consumidor ou concorrência desleal;<br>
&nbsp;&nbsp;c) Defeitos, vícios ou inadequação dos produtos ou serviços prestados pela LICENCIADA com a utilização da marca licenciada;<br>
&nbsp;&nbsp;d) Publicidade enganosa, abusiva ou de qualquer forma ilícita realizada pela LICENCIADA;<br>
&nbsp;&nbsp;e) Qualquer outra ação ou omissão da LICENCIADA que possa prejudicar a reputação ou a imagem do LICENCIANTE ou da marca licenciada.<br>
<strong>14.4.</strong> O LICENCIANTE terá o direito de suspender imediatamente a licença concedida, mediante notificação escrita à LICENCIADA, caso tome conhecimento de qualquer fato que possa comprometer a reputação ou a imagem da marca licenciada, até que a situação seja devidamente esclarecida ou sanada.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA DÉCIMA QUINTA - DA CONFIDENCIALIDADE</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>15.1.</strong> As partes concordam que todas as informações e dados que trocarem em relação ao disposto no presente contrato, ou mesmo outros de caráter operacional ou administrativo de qualquer delas, deverão ser tratados como confidenciais, sigilosos e restritos.<br>
<strong>15.2.</strong> As partes obrigam-se a respeitar estritamente, sempre e a qualquer tempo, o caráter confidencial e sigiloso de quaisquer informações e dados financeiros de ambas dos quais venham a tomar conhecimento ou possam vir a utilizar durante a vigência do presente instrumento.<br>
<strong>15.3.</strong> Tais dados não poderão ser fornecidos, revelados ou mencionados a terceiros, em qualquer hipótese, bem como não poderão ser divulgados, publicados ou aproveitados por quaisquer das partes, por ação ou omissão, exceto se autorizado, por escrito, pela parte contrária.<br>
<strong>15.4.</strong> São consideradas informações confidenciais, para os fins deste contrato, todas as informações reveladas por uma parte à outra, sejam escritas ou verbais, incluindo, mas não se limitando a informações técnicas, financeiras, comerciais, segredos de negócio, know-how, especificações, fórmulas, sistemas, programas de computador, informações sobre clientes, fornecedores, estratégias de negócio, entre outras.<br>
<strong>15.5.</strong> Não são consideradas informações confidenciais aquelas que: (a) Sejam ou venham a se tornar de domínio público, sem culpa da parte receptora; (b) Já eram de conhecimento da parte receptora antes de serem reveladas; (c) Venham a ser legitimamente recebidas de terceiros sem violação deste contrato; (d) Sejam reveladas em razão de ordem judicial ou administrativa.<br>
<strong>15.6.</strong> A presente cláusula de confidencialidade permanecerá em vigor e vinculará legalmente ambas as partes, seus empregados, colaboradores, prestadores de serviços e prepostos por um período de 5 (cinco) anos após o término do presente contrato.<br>
<strong>15.7.</strong> A violação das obrigações de confidencialidade previstas neste contrato sujeitará a parte infratora ao pagamento de multa não compensatória no valor correspondente ao décuplo do valor da taxa inicial, sem prejuízo da indenização por perdas e danos que o ato venha a causar, além das sanções penais aplicáveis.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA DÉCIMA SEXTA - DA PROPRIEDADE INTELECTUAL</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>16.1.</strong> A LICENCIADA reconhece que todos os direitos de propriedade intelectual relacionados à marca licenciada, incluindo marcas, patentes, desenhos industriais, direitos autorais, know-how e segredos comerciais, são e permanecerão de uso e gozo exclusivo do LICENCIANTE.<br>
<strong>16.2.</strong> A LICENCIADA compromete-se a não contestar, direta ou indiretamente, a validade e o direito de uso e gozo dos direitos de propriedade intelectual do LICENCIANTE, nem auxiliar terceiros a fazê-lo.<br>
<strong>16.3.</strong> A LICENCIADA não poderá registrar ou tentar registrar, em seu próprio nome ou em nome de terceiros, qualquer marca, nome comercial, domínio na internet ou qualquer outro sinal distintivo idêntico ou semelhante à marca licenciada.<br>
<strong>16.4.</strong> Quaisquer melhorias, aperfeiçoamentos ou derivações da marca ou do método licenciado, desenvolvidos pela LICENCIADA durante a vigência deste contrato, serão de propriedade do LICENCIANTE originário, comprometendo-se a LICENCIADA a informar imediatamente sobre tais desenvolvimentos e a ceder todos os direitos correspondentes sem qualquer ônus.<br>
<strong>16.5.</strong> A LICENCIADA não adquire qualquer direito de propriedade sobre a marca, comprometendo-se a não registrar qualquer marca ou sinal distintivo que contenha ou se assemelhe à marca licenciada no Brasil ou no exterior, durante a vigência deste contrato e pelo período de 10 (dez) anos após o seu término, independentemente da causa.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA DÉCIMA SÉTIMA - DA INDEPENDÊNCIA DAS PARTES</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>17.1.</strong> As partes declaram expressamente que são pessoas jurídicas e/ou físicas independentes, não estabelecendo o presente contrato qualquer forma de associação, joint venture, consórcio, grupo econômico, representação, agência, parceria, vínculo empregatício ou responsabilidade solidária.<br>
<strong>17.2.</strong> A LICENCIADA é a única e exclusiva responsável por sua própria gestão empresarial, administrativa, financeira, tributária, trabalhista e previdenciária, não possuindo autoridade para vincular ou obrigar o LICENCIANTE perante terceiros.<br>
<strong>17.3.</strong> A LICENCIADA obriga-se a incluir, de forma clara e destacada, em todos os seus contratos, correspondências e material publicitário, declaração no sentido de que é uma empresa independente e que apenas utiliza a marca mediante licença.<br>
<strong>17.4.</strong> Em todas as relações com terceiros, a LICENCIADA deverá se identificar claramente como pessoa jurídica distinta e independente do LICENCIANTE.<br>
<strong>17.5.</strong> A LICENCIADA será exclusivamente responsável por todos os custos, despesas, salários, encargos trabalhistas, previdenciários e tributários decorrentes de sua atividade.<br>
<strong>17.6.</strong> Caso o LICENCIANTE seja de qualquer forma envolvido em processos judiciais ou administrativos em que se alegue a existência de solidariedade ou grupo econômico, a LICENCIADA deverá assumir imediatamente a defesa às suas próprias expensas, requerer a exclusão da lide e ressarcir integralmente o LICENCIANTE.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA DÉCIMA OITAVA - DA AUTONOMIA NEGOCIAL E AUSÊNCIA DE SUCESSÃO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>18.1.</strong> O presente contrato constitui genuíno acordo de licenciamento de uso de marca, não configurando, em hipótese alguma, alienação ou transferência de estabelecimento empresarial, fundo de comércio ou qualquer ativo do LICENCIANTE para a LICENCIADA.<br>
<strong>18.2.</strong> Não se configura, em decorrência deste contrato, sucessão empresarial, tributária, trabalhista ou de qualquer outra natureza entre as partes.<br>
<strong>18.3.</strong> A LICENCIADA declara-se ciente de que é a única e exclusiva responsável por suas próprias obrigações tributárias, pretéritas ou futuras.<br>
<strong>18.4.</strong> Caso o LICENCIANTE seja envolvido em processos alegando sucessão, a LICENCIADA assumirá a defesa, requererá a exclusão e ressarcirá integralmente todos os custos incorridos.<br>
<strong>18.5.</strong> A LICENCIADA se obriga a manter identidade visual, nome empresarial, domínios, e-mails e identificadores claramente distintos daqueles utilizados pelo LICENCIANTE.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA DÉCIMA NONA - DAS PENALIDADES</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>19.1.</strong> O uso indevido da marca, nome, logotipo ou do método licenciado sujeitará a LICENCIADA às seguintes penalidades: (a) Advertência formal por escrito; (b) Multa no valor correspondente ao décuplo do valor da Taxa Inicial por infração cometida; (c) Rescisão contratual por justa causa em caso de reincidência.<br>
<strong>19.2.</strong> As penalidades serão aplicadas após notificação por escrito, assegurando-se o prazo de 5 (cinco) dias úteis para apresentação de defesa.<br>
<strong>19.3.</strong> Caso o LICENCIANTE necessite contratar advogados para efetivar qualquer direito decorrente deste contrato, a LICENCIADA ressarcirá as despesas advocatícias (mínimo de 20%) e processuais comprovadas.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA VIGÉSIMA - DA RESCISÃO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>20.1.</strong> O presente contrato poderá ser rescindido por acordo mútuo, por iniciativa unilateral com aviso de 90 dias, por justa causa em caso de descumprimento não sanado em 30 dias, ou imediatamente em casos de falência, sublicenciamento não autorizado, violação de confidencialidade ou dano à imagem da marca.<br>
<strong>20.2.</strong> A rescisão voluntária pela LICENCIADA exige notificação com 60 dias de antecedência, quitação de débitos e pagamento de multa compensatória correspondente ao décuplo do valor da Taxa Inicial.<br>
<strong>20.3.</strong> Em caso de rescisão por culpa da LICENCIADA, esta pagará multa no décuplo da Taxa Inicial, cessará imediatamente todo uso da marca e retirará produtos/materiais do mercado em até 30 dias.<br>
<strong>20.4.</strong> Em qualquer hipótese de término, a LICENCIADA cessará o uso da marca, devolverá materiais confidenciais em 15 dias e manterá sigilo irrestrito.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA VIGÉSIMA PRIMEIRA - DO USO PÓS-CONTRATUAL</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>21.1.</strong> Com o término do contrato, a LICENCIADA perderá imediatamente o direito de utilizar a marca licenciada, devendo cessar atendimento, divulgação, remover marcas de veículos, estabelecimentos e redes sociais no prazo máximo de 15 (quinze) dias.<br>
<strong>21.2.</strong> O uso indevido pós-contratual sujeitará a LICENCIADA a: (a) Multa diária de R$ 1.000,00 (mil reais), limitada ao décuplo do valor do contrato; (b) Taxa inicial não reembolsável no valor de <strong>R$ {{VALOR_TAXA_POS_CONTRATUAL_NUM}} ({{VALOR_TAXA_POS_CONTRATUAL_EXTENSO}})</strong>.<br>
<strong>21.3.</strong> A tolerância do LICENCIANTE não configurará novação ou renúncia.<br>
<strong>21.4.</strong> A LICENCIADA não poderá, pelo período de 2 (dois) anos após o término do contrato, envolver-se com produtos ou serviços concorrentes diretos ao método licenciado, sob pena de multa de 20 (vinte) vezes o valor da Taxa Inicial.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA VIGÉSIMA SEGUNDA - DAS DISPOSIÇÕES GERAIS E NOTIFICAÇÕES</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>22.1.</strong> O contrato vincula as partes e seus sucessores.<br>
<strong>22.2.</strong> Nenhuma tolerância será interpretada como renúncia ou novação.<br>
<strong>22.3.</strong> A invalidade parcial de qualquer cláusula não prejudica as demais.<br>
<strong>22.4.</strong> Este contrato constitui o acordo integral entre as partes.<br>
<strong>22.5.</strong> Todas as comunicações e notificações oficiais serão feitas por e-mail válido com comprovação de envio:<br>
&nbsp;&nbsp;• <strong>LICENCIANTE:</strong> contato@bodyharmony.com.br / juridico@bodyharmony.com.br<br>
&nbsp;&nbsp;• <strong>LICENCIADA:</strong> <strong>{{LICENCIADA_EMAIL_OFICIAL}}</strong>
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA VIGÉSIMA TERCEIRA - DECLARAÇÕES E GARANTIAS</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>23.1.</strong> O LICENCIANTE declara ser o legítimo titular dos direitos da marca e método junto ao INPI.<br>
<strong>23.2.</strong> A LICENCIADA declara dispor de plena capacidade técnica, física, operacional e financeira para o fiel cumprimento de todas as cláusulas deste contrato.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA VIGÉSIMA QUARTA - DA NÃO CONCORRÊNCIA</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>24.1.</strong> A LICENCIADA compromete-se, durante a vigência deste contrato e pelo período de 2 (dois) anos após o seu encerramento, a não exercer, direta ou indiretamente, atividade concorrente no segmento de eletroestimulação estética similar ao "MÉTODO BODY HARMONY", nem aliciar colaboradores ou fornecedores da rede.<br>
<strong>24.2.</strong> A restrição territorial abrange o território licenciado e um raio de até 100 (cem) quilômetros adicionais para proteção do fundo de comércio da rede.<br>
<strong>24.3.</strong> O descumprimento sujeitará a LICENCIADA ao pagamento de multa não compensatória correspondente a 30 (trinta) vezes o valor da Taxa Inicial, além de perdas e danos e lucros cessantes.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA VIGÉSIMA QUINTA - DO FORO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>25.1.</strong> Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem expressamente o foro da Comarca de <strong>ASSIS/SP</strong>, com renúncia irrevogável a qualquer outro, por mais privilegiado que seja.
</p>

<p style="text-align: justify; line-height: 1.6; margin-top: 30px;">
E, por estarem assim justas e contratadas, as partes assinam o presente instrumento para que produza seus jurídicos e legais efeitos.
</p>

<div class="document-closure" style="margin-top: 35px;">
  <p style="text-align: right;"><strong>{{CIDADE_CELEBRACAO}}</strong>, <strong>{{DATA_CELEBRACAO_EXTENSO}}</strong>.</p>

  <table style="width: 100%; margin-top: 40px; border: none;" border="0">
    <tr>
      <td style="width: 50%; text-align: center; vertical-align: top; padding: 10px;">
        __________________________________________<br>
        <strong>BODY HARMONY ELETRO ESTIMULAÇÃO LTDA.</strong><br>
        <span style="font-size: 9pt; color: #555;">LICENCIANTE</span>
      </td>
      <td style="width: 50%; text-align: center; vertical-align: top; padding: 10px;">
        __________________________________________<br>
        <strong>{{LICENCIADA_RAZAO_SOCIAL}}</strong><br>
        <span style="font-size: 9pt; color: #555;">LICENCIADA</span>
      </td>
    </tr>
  </table>

  <div style="margin-top: 35px;">
    <p style="font-size: 10pt; font-weight: bold; margin-bottom: 15px;">TESTEMUNHAS:</p>
    <table style="width: 100%; border: none;" border="0">
      <tr>
        <td style="width: 50%; padding: 5px;">
          1. __________________________________________<br>
          Nome: <strong>{{TESTEMUNHA_1_NOME}}</strong><br>
          CPF: <strong>{{TESTEMUNHA_1_CPF}}</strong>
        </td>
        <td style="width: 50%; padding: 5px;">
          2. __________________________________________<br>
          Nome: <strong>{{TESTEMUNHA_2_NOME}}</strong><br>
          CPF: <strong>{{TESTEMUNHA_2_CPF}}</strong>
        </td>
      </tr>
    </table>
  </div>
</div>', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    `title` = VALUES(`title`),
    `category` = VALUES(`category`),
    `description` = VALUES(`description`),
    `variables_schema` = VALUES(`variables_schema`),
    `content_html` = VALUES(`content_html`),
    `updated_at` = NOW();

-- [Ouvinte] termo-ouvinte-confidencialidade
INSERT INTO `contract_templates` (`slug`, `title`, `category`, `description`, `version`, `variables_schema`, `content_html`, `is_active`, `created_at`, `updated_at`)
VALUES ('termo-ouvinte-confidencialidade', 'Termo de Ouvinte, Sigilo e Confidencialidade (Oficial)', 'Ouvinte', 'Minuta oficial integral de Termo de Ouvinte em cursos Body Harmony® com 9 cláusulas, sigilo irrestrito, titularidade de PI, multa de R$ 20.000,00 e não-concorrência de 3 anos.', 'v1.0', '[{"id": "qualificacao_ouvinte", "title": "1. Qualificação do(a) Ouvinte", "icon": "user", "fields": [{"key": "OUVINTE_NOME", "label": "Nome Completo do(a) Ouvinte", "type": "text", "placeholder": "Nome completo", "required": true}, {"key": "OUVINTE_CPF", "label": "CPF do(a) Ouvinte", "type": "cpf", "placeholder": "000.000.000-00", "required": true}, {"key": "OUVINTE_RG", "label": "RG do(a) Ouvinte", "type": "text", "placeholder": "00.000.000-0", "required": true}, {"key": "OUVINTE_ENDERECO", "label": "Endereço Residencial", "type": "text", "placeholder": "Rua, Número, Bairro", "required": true}, {"key": "OUVINTE_CIDADE_UF", "label": "Cidade / UF", "type": "text", "placeholder": "Ex: Belo Horizonte/MG", "required": true}, {"key": "OUVINTE_CEP", "label": "CEP", "type": "cep", "placeholder": "00000-000", "required": true}, {"key": "OUVINTE_EMAIL", "label": "E-mail de Contato", "type": "email", "placeholder": "email@exemplo.com", "required": true}, {"key": "OUVINTE_TELEFONE", "label": "Telefone / WhatsApp", "type": "phone", "placeholder": "(00) 00000-0000", "required": true}]}, {"id": "curso_observacao", "title": "2. Curso & Condições Observacionais", "icon": "map", "fields": [{"key": "NOME_CURSO_EVENTO", "label": "Nome do Curso / Evento", "type": "text", "default_value": "Capacitação Prática em Eletroestimulação Body Harmony®", "required": true}, {"key": "DATA_EVENTO_EXTENSO", "label": "Data de Realização do Evento", "type": "text", "placeholder": "Ex: 20 a 22 de Agosto de 2026", "required": true}, {"key": "LOCAL_EVENTO", "label": "Local / Cidade do Evento", "type": "text", "default_value": "Sede Body Harmony - Assis/SP", "required": true}]}, {"id": "financeiro_sigilo", "title": "3. Taxas & Cláusula Penal", "icon": "dollar", "fields": [{"key": "VALOR_CURSO_NUM", "label": "Valor da Taxa de Participação (R$)", "type": "currency", "default_value": "1.500,00", "required": true}, {"key": "VALOR_CURSO_EXTENSO", "label": "Valor da Taxa por Extenso", "type": "text", "default_value": "um mil e quinhentos reais", "required": true}, {"key": "MULTA_SIGILO_NUM", "label": "Multa por Quebra de Sigilo (R$)", "type": "currency", "default_value": "20.000,00", "required": true}, {"key": "MULTA_SIGILO_EXTENSO", "label": "Multa por Extenso", "type": "text", "default_value": "vinte mil reais", "required": true}]}, {"id": "fechamento_ouvinte", "title": "4. Fechamento & Testemunhas", "icon": "pen", "fields": [{"key": "CIDADE_DATA_EXTENSO", "label": "Local e Data por Extenso", "type": "text", "required": true}, {"key": "DATA_EXTENSO", "label": "Data por Extenso", "type": "text", "required": true}, {"key": "TESTEMUNHA_1_NOME", "label": "Testemunha 1 - Nome", "type": "text", "placeholder": "Nome completo", "required": false}, {"key": "TESTEMUNHA_1_CPF", "label": "Testemunha 1 - CPF", "type": "cpf", "placeholder": "000.000.000-00", "required": false}, {"key": "TESTEMUNHA_2_NOME", "label": "Testemunha 2 - Nome", "type": "text", "placeholder": "Nome completo", "required": false}, {"key": "TESTEMUNHA_2_CPF", "label": "Testemunha 2 - CPF", "type": "cpf", "placeholder": "000.000.000-00", "required": false}]}]', '<div class="contract-logo-header" style="text-align: center; margin-bottom: 20px;">
  <img src="/assets/images/body-harmony-logo-color.png" alt="Body Harmony®" style="height: 75px; width: auto; max-width: 280px; object-fit: contain;" />
</div>
<div class="document-header" style="text-align: center; margin-bottom: 25px;">
  <h1 style="color: #0A3E60; font-size: 18pt; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">TERMO DE OUVINTE E CONFIDENCIALIDADE</h1>
  <p style="color: #666; font-size: 10pt; font-style: italic;">Compromisso de Sigilo, Propriedade Intelectual e Participação Observacional</p>
</div>

<p style="text-align: justify; line-height: 1.6;">
Pelo presente instrumento particular e na melhor forma de direito, os abaixo qualificados e assinados:
</p>

<p style="text-align: justify; line-height: 1.6;">
<strong>LICENCIANTE:</strong> <strong>BODY HARMONY EDUCAÇÃO LTDA.</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº <strong>55.658.939/0001-30</strong>, localizada na Rua Sebastião da Silva Leite, nº 456, CEP 19.814-200, Assis/SP, neste ato representada pelo seu sócio administrador <strong>ULISSES PESSOA LOPES</strong>, brasileiro, Médico inscrito no CRM nº 137855-SP, Medicina Integrativa e Especialista em Emagrecimento, portador do CPF (MF) nº <strong>892.641.001-30</strong>, residente na Rua Sebastião da Silva Leite, nº 456, CEP 19.814-200, na cidade de Assis/SP, doravante denominado simplesmente <strong>LICENCIANTE</strong>;
</p>

<p style="text-align: justify; line-height: 1.6;">
<strong>OUVINTE:</strong> <strong>{{OUVINTE_NOME}}</strong>, nacionalidade <strong>{{OUVINTE_NACIONALIDADE}}</strong>, estado civil <strong>{{OUVINTE_ESTADO_CIVIL}}</strong>, profissão <strong>{{OUVINTE_PROFISSAO}}</strong>, portador(a) do RG nº <strong>{{OUVINTE_RG}}</strong>, inscrito(a) no CPF sob o nº <strong>{{OUVINTE_CPF}}</strong>, residente e domiciliado(a) na <strong>{{OUVINTE_ENDERECO}}</strong>, <strong>{{OUVINTE_CIDADE_UF}}</strong>, CEP nº <strong>{{OUVINTE_CEP}}</strong>, doravante denominada <strong>OUVINTE</strong>;
</p>

<p style="text-align: justify; line-height: 1.6;">
As partes têm entre si justo e contratado o presente <strong>TERMO DE OUVINTE E CONFIDENCIALIDADE</strong>, que se regerá pelas cláusulas e condições abaixo descritas:
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA PRIMEIRA – DO OBJETO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>1.1.</strong> O presente Termo tem por objeto autorizar a OUVINTE a participar do evento/curso de capacitação <strong>{{NOME_CURSO_EVENTO}}</strong> do Método BODY HARMONY e ELETRO FACE, de forma exclusivamente observacional, sem direito de uso, execução, reprodução, ensino ou comercialização do método.<br>
<strong>1.2.</strong> A OUVINTE reconhece que todo o conteúdo técnico, teórico e prático ministrado pertence única e exclusivamente à LICENCIADORA, constituindo propriedade intelectual e segredo profissional, protegido pelas Leis nº 9.610/1998 (Direitos Autorais), nº 9.279/1996 (Propriedade Industrial) e demais normas aplicáveis.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA SEGUNDA – DA NATUREZA DA PARTICIPAÇÃO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>2.1.</strong> A OUVINTE declara ter ciência de que não adquire qualquer direito de uso, certificação, habilitação, licença, franquia, parceria ou vínculo profissional com a LICENCIADORA, limitando-se sua presença à condição de ouvinte.<br>
<strong>2.2.</strong> Fica expressamente vedado à OUVINTE:<br>
&nbsp;&nbsp;• Ministrar cursos, treinamentos ou atendimentos utilizando o método;<br>
&nbsp;&nbsp;• Reproduzir total ou parcialmente qualquer técnica, imagem, material didático, procedimento, ou recurso aplicado;<br>
&nbsp;&nbsp;• Utilizar, em qualquer meio, o nome comercial, marca, logotipo ou identidade visual das ESPECIALISTAS ou do método BODY HARMONY e ELETRO FACE.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA TERCEIRA – DO DEVER DE CONFIDENCIALIDADE</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>3.1.</strong> A OUVINTE se compromete a manter sigilo absoluto sobre toda e qualquer informação, técnica, material, conteúdo, dado, procedimento, registro, imagem, vídeo, áudio ou documentação a que tiver acesso durante ou após o curso.<br>
<strong>3.2.</strong> Fica proibido gravar, fotografar, reproduzir, divulgar ou compartilhar informações ou imagens do curso, bem como repassar conteúdos a terceiros, seja por meio digital, oral ou escrito.<br>
<strong>3.3.</strong> A obrigação de confidencialidade terá vigência por prazo indeterminado, permanecendo válida mesmo após o término do curso ou qualquer eventual relação com a LICENCIADORA.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA QUARTA – DA PROPRIEDADE INTELECTUAL</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>4.1.</strong> Todo o conteúdo transmitido, inclusive materiais, apostilas, slides, vídeos, procedimentos técnicos e protocolos clínicos, é de titularidade exclusiva da LICENCIADORA, protegido pela legislação de direitos autorais e propriedade industrial.<br>
<strong>4.2.</strong> Qualquer reprodução, cópia, modificação, ensino, divulgação ou uso indevido caracterizará violação de direitos autorais, concorrência desleal e enriquecimento ilícito, ensejando responsabilidade civil e criminal, nos termos das Leis nº 9.610/98, nº 9.279/96 e do Código Civil (arts. 186, 187 e 927).
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA QUINTA – DA RESPONSABILIDADE E PENALIDADES</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>5.1.</strong> Em caso de violação de qualquer cláusula deste Termo, a OUVINTE ficará sujeita ao pagamento de multa não compensatória no valor de <strong>R$ 20.000,00 (vinte mil reais)</strong>, sem prejuízo da indenização por perdas e danos e da adoção das medidas judiciais cabíveis, inclusive de natureza cível e criminal.<br>
<strong>5.2.</strong> A multa prevista nesta cláusula poderá ser majorada judicialmente caso os prejuízos sofridos pela LICENCIADORA ultrapassem o valor fixado.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA SEXTA – DA NÃO CONCORRÊNCIA</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>6.1.</strong> A OUVINTE compromete-se a não desenvolver, comercializar, aplicar ou ensinar métodos semelhantes, derivados ou concorrentes ao método BODY HARMONY e ELETRO FACE pelo prazo de <strong>03 (três) anos</strong> contados da assinatura deste Termo.<br>
<strong>6.2.</strong> O descumprimento desta cláusula sujeitará a OUVINTE às mesmas penalidades previstas na Cláusula 5.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA SÉTIMA - DAS TAXAS – VALOR MÍNIMO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>7.1.</strong> Em contraprestação à participação como OUVINTE objeto deste contrato, pagará ao LICENCIANTE:<br>
&nbsp;&nbsp;a) Uma taxa inicial, não reembolsável, no valor total de <strong>R$ {{VALOR_TAXA_OUVINTE_NUM}} ({{VALOR_TAXA_OUVINTE_EXTENSO}})</strong>, realizado mediante: <strong>{{FORMA_PAGAMENTO_OUVINTE}}</strong>.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA OITAVA – DA VIGÊNCIA</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>8.1.</strong> O presente Termo entra em vigor na data de sua assinatura e permanecerá válido por tempo indeterminado, produzindo efeitos inclusive após o término do curso.
</p>

<h3 style="color: #0A3E60; border-bottom: 1px solid #ED7E13; padding-bottom: 3px; margin-top: 20px;">CLÁUSULA NONA – DO FORO</h3>
<p style="text-align: justify; line-height: 1.6;">
<strong>9.1.</strong> Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro da Comarca de <strong>ASSIS/SP</strong>, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
</p>

<p style="text-align: justify; line-height: 1.6; margin-top: 30px;">
E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença das testemunhas abaixo.
</p>

<div class="document-closure" style="margin-top: 35px;">
  <p style="text-align: right;"><strong>{{CIDADE_CELEBRACAO}}</strong>, <strong>{{DATA_CELEBRACAO_EXTENSO}}</strong>.</p>

  <table style="width: 100%; margin-top: 40px; border: none;" border="0">
    <tr>
      <td style="width: 50%; text-align: center; vertical-align: top; padding: 10px;">
        __________________________________________<br>
        <strong>BODY HARMONY EDUCAÇÃO LTDA.</strong><br>
        <span style="font-size: 9pt; color: #555;">LICENCIANTE</span>
      </td>
      <td style="width: 50%; text-align: center; vertical-align: top; padding: 10px;">
        __________________________________________<br>
        <strong>{{OUVINTE_NOME}}</strong><br>
        <span style="font-size: 9pt; color: #555;">OUVINTE</span>
      </td>
    </tr>
  </table>

  <div style="margin-top: 35px;">
    <p style="font-size: 10pt; font-weight: bold; margin-bottom: 15px;">TESTEMUNHAS:</p>
    <table style="width: 100%; border: none;" border="0">
      <tr>
        <td style="width: 50%; padding: 5px;">
          1. __________________________________________<br>
          Nome: <strong>{{TESTEMUNHA_1_NOME}}</strong><br>
          CPF: <strong>{{TESTEMUNHA_1_CPF}}</strong>
        </td>
        <td style="width: 50%; padding: 5px;">
          2. __________________________________________<br>
          Nome: <strong>{{TESTEMUNHA_2_NOME}}</strong><br>
          CPF: <strong>{{TESTEMUNHA_2_CPF}}</strong>
        </td>
      </tr>
    </table>
  </div>
</div>', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    `title` = VALUES(`title`),
    `category` = VALUES(`category`),
    `description` = VALUES(`description`),
    `variables_schema` = VALUES(`variables_schema`),
    `content_html` = VALUES(`content_html`),
    `updated_at` = NOW();

-- [Cursos e Eventos] contrato-curso-presencial-padrao
INSERT INTO `contract_templates` (`slug`, `title`, `category`, `description`, `version`, `variables_schema`, `content_html`, `is_active`, `created_at`, `updated_at`)
VALUES ('contrato-curso-presencial-padrao', 'Contrato de Prestação de Serviços Educacionais & Workshop (Oficial)', 'Cursos e Eventos', 'Contrato oficial de prestação de serviços educacionais, workshops presenciais de eletroestimulação, certificação, cessão de material didático e regras de sigilo.', 'v1.0', '[{"id": "qualificacao_aluna", "title": "1. Qualificação da Aluna / Participante", "icon": "user", "fields": [{"key": "ALUNA_NOME", "label": "Nome Completo da Aluna", "type": "text", "required": true, "placeholder": "Nome completo"}, {"key": "ALUNA_CPF_CNPJ", "label": "CPF ou CNPJ", "type": "cpf_cnpj", "required": true, "placeholder": "000.000.000-00"}, {"key": "ALUNA_RG", "label": "RG", "type": "text", "placeholder": "00.000.000-0"}, {"key": "ALUNA_PROFISSAO", "label": "Profissão", "type": "text", "default_value": "Esteticista"}, {"key": "ALUNA_ENDERECO", "label": "Endereço Residencial", "type": "text", "required": true, "placeholder": "Rua, Número, Bairro"}, {"key": "ALUNA_CIDADE_UF", "label": "Cidade / UF", "type": "text", "required": true, "placeholder": "Ex: São Paulo/SP"}, {"key": "ALUNA_CEP", "label": "CEP", "type": "cep", "required": true, "placeholder": "00000-000"}, {"key": "ALUNA_EMAIL", "label": "E-mail de Contato", "type": "email", "required": true}, {"key": "ALUNA_WHATSAPP", "label": "WhatsApp / Celular", "type": "phone", "required": true}]}, {"id": "detalhes_curso", "title": "2. Detalhes do Curso & Metodologia", "icon": "graduation-cap", "fields": [{"key": "NOME_CURSO_EVENTO", "label": "Nome do Curso / Workshop", "type": "text", "required": true, "default_value": "Workshop Prático e Teórico de Eletroestimulação Body Harmony®"}, {"key": "MODALIDADE_CURSO", "label": "Modalidade", "type": "text", "default_value": "Presencial / Teórico-Prático"}, {"key": "DATA_CURSO", "label": "Data de Realização", "type": "text", "required": true, "placeholder": "Ex: 25 e 26 de Outubro de 2026"}, {"key": "CARGA_HORARIA", "label": "Carga Horária Total", "type": "text", "default_value": "16 horas"}, {"key": "LOCAL_CURSO_CIDADE_UF", "label": "Local de Realização (Cidade/UF)", "type": "text", "required": true, "default_value": "Assis/SP"}]}, {"id": "financeiro_curso", "title": "3. Condições Financeiras & Pagamento", "icon": "dollar-sign", "fields": [{"key": "VALOR_CURSO_NUM", "label": "Valor Total do Curso (R$)", "type": "currency", "required": true, "placeholder": "R$ 0.000,00"}, {"key": "VALOR_CURSO_EXTENSO", "label": "Valor por Extenso", "type": "text", "required": true, "placeholder": "Ex: quatro mil e quinhentos reais"}, {"key": "FORMA_PAGAMENTO_CURSO", "label": "Forma de Pagamento", "type": "text", "required": true, "default_value": "PIX à vista / Cartão de Crédito"}]}, {"id": "regras_certificacao", "title": "4. Certificação & Propriedade Intelectual", "icon": "shield-alt", "fields": [{"key": "CRITERIO_FREQUENCIA_MINIMA", "label": "Frequência Mínima para Certificado", "type": "text", "default_value": "100% de presença nas aulas práticas"}, {"key": "PERCENTUAL_MULTA_DESISTENCIA", "label": "Multa por Desistência Tardia (%)", "type": "text", "default_value": "30% do valor total"}]}, {"id": "fechamento_curso", "title": "5. Fechamento & Assinaturas", "icon": "pen-nib", "fields": [{"key": "CIDADE_CELEBRACAO", "label": "Cidade de Celebração", "type": "text", "default_value": "Assis/SP"}, {"key": "DATA_CELEBRACAO_EXTENSO", "label": "Data por Extenso", "type": "text", "required": true}, {"key": "TESTEMUNHA_1_NOME", "label": "Nome Testemunha 1", "type": "text", "default_value": "Testemunha 1"}, {"key": "TESTEMUNHA_1_CPF", "label": "CPF Testemunha 1", "type": "cpf", "placeholder": "000.000.000-00"}, {"key": "TESTEMUNHA_2_NOME", "label": "Nome Testemunha 2", "type": "text", "default_value": "Testemunha 2"}, {"key": "TESTEMUNHA_2_CPF", "label": "CPF Testemunha 2", "type": "cpf", "placeholder": "000.000.000-00"}]}]', '<div class="contract-logo-header" style="text-align: center; margin-bottom: 24px;">
    <img src="/assets/images/body-harmony-logo-color.png" alt="Body Harmony Logo" style="height: 75px; max-width: 280px; object-fit: contain;" />
</div>

<h2 style="text-align: center; color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 16pt; font-weight: bold; margin-bottom: 6px; text-transform: uppercase;">
    CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS & WORKSHOP
</h2>
<p style="text-align: center; color: #ed7e13; font-family: Montserrat, sans-serif; font-size: 10.5pt; font-weight: bold; margin-top: 0; margin-bottom: 24px; letter-spacing: 1px;">
    METODOLOGIA BODY HARMONY® DE ELETROESTIMULAÇÃO CORPORAL
</p>

<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    Pelo presente instrumento particular, de um lado:
</p>

<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    <strong>BODY HARMONY ESTÉTICA E CURSOS LTDA</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 46.123.456/0001-89, com sede na Rua Brasil, nº 100, Centro, Assis/SP, CEP 19800-000, doravante denominada simplesmente <strong>CONTRATADA</strong> ou <strong>INSTITUIÇÃO</strong>;
</p>

<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    E, de outro lado:
</p>

<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    <strong>{{ALUNA_NOME}}</strong>, portadora do CPF/CNPJ nº <strong>{{ALUNA_CPF_CNPJ}}</strong>, RG nº <strong>{{ALUNA_RG}}</strong>, profissão <strong>{{ALUNA_PROFISSAO}}</strong>, residente e domiciliada na <strong>{{ALUNA_ENDERECO}}</strong>, <strong>{{ALUNA_CIDADE_UF}}</strong>, CEP <strong>{{ALUNA_CEP}}</strong>, e-mail <strong>{{ALUNA_EMAIL}}</strong>, telefone/WhatsApp <strong>{{ALUNA_WHATSAPP}}</strong>, doravante denominada simplesmente <strong>CONTRATANTE</strong> ou <strong>ALUNA</strong>;
</p>

<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    Têm entre si, justo e contratado, o presente Contrato de Prestação de Serviços Educacionais, que se regerá pelas seguintes cláusulas e condições:
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    CLÁUSULA PRIMEIRA — DO OBJETO
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    1.1. O presente contrato tem por objeto a prestação de serviços educacionais pela <strong>CONTRATADA</strong> em favor da <strong>ALUNA</strong>, consubstanciada na ministração do curso/workshop intitulado <strong>{{NOME_CURSO_EVENTO}}</strong>, na modalidade <strong>{{MODALIDADE_CURSO}}</strong>, com carga horária de <strong>{{CARGA_HORARIA}}</strong>, a ser realizado no período de <strong>{{DATA_CURSO}}</strong> na cidade de <strong>{{LOCAL_CURSO_CIDADE_UF}}</strong>.
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    CLÁUSULA SEGUNDA — DO VALOR E FORMA DE PAGAMENTO
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    2.1. Pela prestação dos serviços educacionais objeto deste contrato, a <strong>ALUNA</strong> pagará à <strong>CONTRATADA</strong> o valor total de <strong>{{VALOR_CURSO_NUM}}</strong> (<strong>{{VALOR_CURSO_EXTENSO}}</strong>), a ser quitado mediante a seguinte condição: <strong>{{FORMA_PAGAMENTO_CURSO}}</strong>.
</p>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    2.2. A confirmação da matrícula e a reserva da vaga estão condicionadas à confirmação do pagamento integral ou da primeira parcela acordada.
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    CLÁUSULA TERCEIRA — DOS DIREITOS AUTORAIS E PROPRIEDADE INTELECTUAL
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    3.1. Todo o material didático, apostilas, slides, protocolos e metodologia prática disponibilizados são de titularidade exclusiva da <strong>BODY HARMONY®</strong>, protegidos pela Lei de Direitos Autorais (Lei nº 9.610/98) e de Propriedade Industrial (Lei nº 9.279/96).
</p>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    3.2. É terminantemente proibida a gravação em áudio ou vídeo das aulas sem autorização expressa, bem como a reprodução, comercialização, compartilhamento digital ou cessão a terceiros de qualquer material fornecido.
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    CLÁUSULA QUARTA — DA FREQUÊNCIA E CERTIFICAÇÃO
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    4.1. Fará jus ao Certificado Oficial de Conclusão a <strong>ALUNA</strong> que cumprir com êxito o critério de frequência de <strong>{{CRITERIO_FREQUENCIA_MINIMA}}</strong> e demonstrar assimilação satisfatória das práticas clínicas ministradas.
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    CLÁUSULA QUINTA — DO CANCELAMENTO E DESISTÊNCIA
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    5.1. Em caso de desistência formal solicitada pela <strong>ALUNA</strong> com menos de 7 (sete) dias de antecedência da data de início do curso, será retido o percentual de <strong>{{PERCENTUAL_MULTA_DESISTENCIA}}</strong> a título de cobertura de custos administrativos e reserva de vaga.
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    CLÁUSULA SEXTA — DO FORO
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    6.1. As partes elegem a Comarca de <strong>{{CIDADE_CELEBRACAO}}</strong> para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, com renúncia expressa a qualquer outro foro, por mais privilegiado que seja.
</p>

<p style="text-align: center; margin-top: 30px; font-family: ''Times New Roman'', serif; font-size: 11pt;">
    <strong>{{CIDADE_CELEBRACAO}}</strong>, <strong>{{DATA_CELEBRACAO_EXTENSO}}</strong>.
</p>

<table style="width: 100%; margin-top: 40px; border: none; font-family: ''Times New Roman'', serif; font-size: 11pt;">
    <tr>
        <td style="width: 48%; text-align: center; border: none; vertical-align: bottom;">
            ___________________________________________<br />
            <strong>BODY HARMONY ESTÉTICA E CURSOS LTDA</strong><br />
            CONTRATADA
        </td>
        <td style="width: 4%;"></td>
        <td style="width: 48%; text-align: center; border: none; vertical-align: bottom;">
            ___________________________________________<br />
            <strong>{{ALUNA_NOME}}</strong><br />
            ALUNA / CONTRATANTE
        </td>
    </tr>
    <tr><td colspan="3" style="height: 35px; border: none;"></td></tr>
    <tr>
        <td style="width: 48%; text-align: center; border: none; vertical-align: bottom;">
            ___________________________________________<br />
            <strong>{{TESTEMUNHA_1_NOME}}</strong><br />
            CPF: {{TESTEMUNHA_1_CPF}}
        </td>
        <td style="width: 4%;"></td>
        <td style="width: 48%; text-align: center; border: none; vertical-align: bottom;">
            ___________________________________________<br />
            <strong>{{TESTEMUNHA_2_NOME}}</strong><br />
            CPF: {{TESTEMUNHA_2_CPF}}
        </td>
    </tr>
</table>', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    `title` = VALUES(`title`),
    `category` = VALUES(`category`),
    `description` = VALUES(`description`),
    `variables_schema` = VALUES(`variables_schema`),
    `content_html` = VALUES(`content_html`),
    `updated_at` = NOW();

-- [Clinica e Pacientes] termo-consentimento-paciente-tcle
INSERT INTO `contract_templates` (`slug`, `title`, `category`, `description`, `version`, `variables_schema`, `content_html`, `is_active`, `created_at`, `updated_at`)
VALUES ('termo-consentimento-paciente-tcle', 'Termo de Consentimento Livre e Esclarecido (TCLE) & Anamnese Estética (Oficial)', 'Clinica e Pacientes', 'Termo oficial de consentimento informado para procedimentos de eletroestimulação corporal/facial, anamnese de saúde, esclarecimento de riscos, autorização de imagem e isenção médica.', 'v1.0', '[{"id": "qualificacao_paciente", "title": "1. Identificação do(a) Paciente", "icon": "user", "fields": [{"key": "PACIENTE_NOME", "label": "Nome Completo do(a) Paciente", "type": "text", "required": true, "placeholder": "Nome completo"}, {"key": "PACIENTE_CPF", "label": "CPF", "type": "cpf", "required": true, "placeholder": "000.000.000-00"}, {"key": "PACIENTE_RG", "label": "RG", "type": "text", "placeholder": "00.000.000-0"}, {"key": "PACIENTE_DATA_NASCIMENTO", "label": "Data de Nascimento", "type": "date", "placeholder": "DD/MM/AAAA"}, {"key": "PACIENTE_ENDERECO", "label": "Endereço Residencial", "type": "text", "placeholder": "Rua, Número, Bairro, Cidade/UF"}, {"key": "PACIENTE_TELEFONE", "label": "Telefone / WhatsApp", "type": "phone", "required": true}, {"key": "PACIENTE_EMAIL", "label": "E-mail", "type": "email"}]}, {"id": "procedimento_sessao", "title": "2. Procedimento & Plano Terapêutico", "icon": "heartbeat", "fields": [{"key": "PROCEDIMENTO_SOLICITADO", "label": "Procedimento a Ser Realizado", "type": "text", "required": true, "default_value": "Eletroestimulação Muscular & Remodelação Corporal Body Harmony®"}, {"key": "AREAS_CORPOREAS_TRATAMENTO", "label": "Áreas Corporais Tratadas", "type": "text", "required": true, "placeholder": "Ex: Abdômen, Glúteos, Coxas"}, {"key": "NUMERO_SESSOES_PREVISTAS", "label": "Número Previsto de Sessões", "type": "text", "default_value": "10 sessões"}]}, {"id": "financeiro_paciente", "title": "3. Condições Financeiras do Tratamento", "icon": "dollar-sign", "fields": [{"key": "VALOR_TRATAMENTO_NUM", "label": "Valor do Tratamento (R$)", "type": "currency", "required": true, "placeholder": "R$ 0.000,00"}, {"key": "VALOR_TRATAMENTO_EXTENSO", "label": "Valor por Extenso", "type": "text", "placeholder": "Ex: dois mil e quinhentos reais"}, {"key": "FORMA_PAGAMENTO_TRATAMENTO", "label": "Forma de Pagamento", "type": "text", "default_value": "Cartão de Crédito / PIX"}]}, {"id": "saude_anamnese", "title": "4. Declarações de Saúde & Consentimento", "icon": "notes-medical", "fields": [{"key": "DECLARACAO_AUSENCIA_MARCAPASSO_GESTAO", "label": "Ausência de Marcapasso/Gestação", "type": "text", "default_value": "Declaro expressamente que NÃO possuo marcapasso, pinos metálicos na área tratada nem suspeita de gestação."}, {"key": "MEDICACOES_USO_CONTINUO", "label": "Medicações de Uso Contínuo", "type": "text", "default_value": "Nenhuma medicação impeditiva declarada"}, {"key": "AUTORIZACAO_USO_IMAGEM_ANTER_DEPOIS", "label": "Autorização de Imagem (Antes/Depois)", "type": "text", "default_value": "AUTORIZO o registro fotográfico anônimo para acompanhamento clínico e divulgação científica/estética da Body Harmony®"}]}, {"id": "fechamento_paciente", "title": "5. Responsável Técnico & Assinaturas", "icon": "pen-nib", "fields": [{"key": "PROFISSIONAL_RESPONSAVEL_NOME", "label": "Profissional Responsável", "type": "text", "required": true, "placeholder": "Nome do(a) Esteticista / Biomédico(a)"}, {"key": "PROFISSIONAL_REGISTRO_CONSELHO", "label": "Registro Profissional / Conselho", "type": "text", "placeholder": "Ex: CRBM / CREFITO / Estética"}, {"key": "CIDADE_CELEBRACAO", "label": "Cidade de Celebração", "type": "text", "default_value": "Assis/SP"}, {"key": "DATA_CELEBRACAO_EXTENSO", "label": "Data por Extenso", "type": "text", "required": true}]}]', '<div class="contract-logo-header" style="text-align: center; margin-bottom: 24px;">
    <img src="/assets/images/body-harmony-logo-color.png" alt="Body Harmony Logo" style="height: 75px; max-width: 280px; object-fit: contain;" />
</div>

<h2 style="text-align: center; color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 15pt; font-weight: bold; margin-bottom: 6px; text-transform: uppercase;">
    TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)
</h2>
<p style="text-align: center; color: #ed7e13; font-family: Montserrat, sans-serif; font-size: 10.5pt; font-weight: bold; margin-top: 0; margin-bottom: 24px; letter-spacing: 1px;">
    PROCEDIMENTOS ESTÉTICOS & ELETROESTIMULAÇÃO BODY HARMONY®
</p>

<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    Eu, <strong>{{PACIENTE_NOME}}</strong>, portador(a) do CPF nº <strong>{{PACIENTE_CPF}}</strong>, RG nº <strong>{{PACIENTE_RG}}</strong>, nascido(a) em <strong>{{PACIENTE_DATA_NASCIMENTO}}</strong>, residente em <strong>{{PACIENTE_ENDERECO}}</strong>, telefone/WhatsApp <strong>{{PACIENTE_TELEFONE}}</strong>, e-mail <strong>{{PACIENTE_EMAIL}}</strong>, na qualidade de paciente/cliente, declaro para os devidos fins que:
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    1. DO PROCEDIMENTO E ESCLARECIMENTO
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    1.1. Fui plenamente informado(a) e esclarecido(a) a respeito do procedimento de <strong>{{PROCEDIMENTO_SOLICITADO}}</strong>, nas regiões anatômicas <strong>{{AREAS_CORPOREAS_TRATAMENTO}}</strong>, compreendendo um plano terapêutico estimado de <strong>{{NUMERO_SESSOES_PREVISTAS}}</strong>, realizado sob responsabilidade técnica de <strong>{{PROFISSIONAL_RESPONSAVEL_NOME}}</strong> (Registro: <strong>{{PROFISSIONAL_REGISTRO_CONSELHO}}</strong>).
</p>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    1.2. Compreendo a natureza e a metodologia da tecnologia de contração muscular eletroinduzida, seus objetivos de remodelação, tonificação e estímulo metabólico, bem como a necessidade do cumprimento das recomendações de hidratação, hábitos saudáveis e comparecimento às sessões programadas.
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    2. DA ANAMNESE E AUSÊNCIA DE CONTRAINDICAÇÕES
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    2.1. Declaro serem verídicas todas as informações fornecidas no questionário de anamnese e confirmo que:
</p>
<ul style="line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    <li><strong>{{DECLARACAO_AUSENCIA_MARCAPASSO_GESTAO}}</strong></li>
    <li>Histórico medicamentoso: <strong>{{MEDICACOES_USO_CONTINUO}}</strong></li>
    <li>Não omiti qualquer condição de saúde pré-existente, cirurgias recentes, processos inflamatórios agudos ou afecções dermatológicas nas áreas a serem tratadas.</li>
</ul>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    3. DAS CONDIÇÕES FINANCEIRAS
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    3.1. O investimento acordado para o tratamento contratado é de <strong>{{VALOR_TRATAMENTO_NUM}}</strong> (<strong>{{VALOR_TRATAMENTO_EXTENSO}}</strong>), pago mediante <strong>{{FORMA_PAGAMENTO_TRATAMENTO}}</strong>.
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    4. DO REGISTRO FOTOGRÁFICO E USO DE IMAGEM
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    4.1. <strong>{{AUTORIZACAO_USO_IMAGEM_ANTER_DEPOIS}}</strong>, resguardando sempre a preservação da minha identidade e dignidade pessoal.
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    5. CONSENTIMENTO FINAL
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    Tendo lido, compreendido e concordado com todas as orientações, riscos possíveis (como dor muscular tardia transitória e hiperemia local) e benefícios terapêuticos, firmo o presente consentimento livre e esclarecido.
</p>

<p style="text-align: center; margin-top: 30px; font-family: ''Times New Roman'', serif; font-size: 11pt;">
    <strong>{{CIDADE_CELEBRACAO}}</strong>, <strong>{{DATA_CELEBRACAO_EXTENSO}}</strong>.
</p>

<table style="width: 100%; margin-top: 40px; border: none; font-family: ''Times New Roman'', serif; font-size: 11pt;">
    <tr>
        <td style="width: 48%; text-align: center; border: none; vertical-align: bottom;">
            ___________________________________________<br />
            <strong>{{PACIENTE_NOME}}</strong><br />
            CPF: {{PACIENTE_CPF}}<br />
            PACIENTE
        </td>
        <td style="width: 4%;"></td>
        <td style="width: 48%; text-align: center; border: none; vertical-align: bottom;">
            ___________________________________________<br />
            <strong>{{PROFISSIONAL_RESPONSAVEL_NOME}}</strong><br />
            Registro: {{PROFISSIONAL_REGISTRO_CONSELHO}}<br />
            PROFISSIONAL RESPONSÁVEL
        </td>
    </tr>
</table>', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    `title` = VALUES(`title`),
    `category` = VALUES(`category`),
    `description` = VALUES(`description`),
    `variables_schema` = VALUES(`variables_schema`),
    `content_html` = VALUES(`content_html`),
    `updated_at` = NOW();

-- [Recibos] recibo-oficial-quitacao-padrao
INSERT INTO `contract_templates` (`slug`, `title`, `category`, `description`, `version`, `variables_schema`, `content_html`, `is_active`, `created_at`, `updated_at`)
VALUES ('recibo-oficial-quitacao-padrao', 'Recibo Oficial de Pagamento e Plena Quitação (Oficial)', 'Recibos', 'Recibo formal padronizado com discriminação detalhada de serviços, taxa de licenciamento ou cursos, valor por extenso e declaração irrevogável de quitação.', 'v1.0', '[{"id": "identificacao_recibo", "title": "1. Identificação do Recibo", "icon": "file-invoice-dollar", "fields": [{"key": "RECIBO_NUMERO", "label": "Número do Recibo", "type": "text", "required": true, "placeholder": "Ex: 2026/001"}, {"key": "CIDADE_EMISSAO", "label": "Cidade de Emissão", "type": "text", "default_value": "Assis/SP"}, {"key": "DATA_EMISSAO_EXTENSO", "label": "Data por Extenso", "type": "text", "required": true}]}, {"id": "dados_pagador", "title": "2. Dados do Pagador / Contratante", "icon": "user", "fields": [{"key": "PAGADOR_NOME_RAZAO", "label": "Nome ou Razão Social do Pagador", "type": "text", "required": true, "placeholder": "Nome completo ou Razão Social"}, {"key": "PAGADOR_CPF_CNPJ", "label": "CPF ou CNPJ", "type": "cpf_cnpj", "required": true, "placeholder": "000.000.000-00"}, {"key": "PAGADOR_ENDERECO", "label": "Endereço Completo", "type": "text", "placeholder": "Rua, Número, Bairro, Cidade/UF"}]}, {"id": "financeiro_recibo", "title": "3. Valores & Discriminação dos Serviços", "icon": "dollar-sign", "fields": [{"key": "VALOR_TOTAL_NUM", "label": "Valor Total Recebido (R$)", "type": "currency", "required": true, "placeholder": "R$ 0.000,00"}, {"key": "VALOR_TOTAL_EXTENSO", "label": "Valor por Extenso", "type": "text", "required": true, "placeholder": "Ex: cinco mil reais"}, {"key": "FORMA_PAGAMENTO_DESCRICAO", "label": "Forma de Pagamento", "type": "text", "required": true, "default_value": "Transferência Bancária / PIX"}, {"key": "DESCRICAO_SERVICOS_TAXAS", "label": "Discriminação dos Serviços / Referência", "type": "text", "required": true, "default_value": "Pagamento referente à Taxa de Licenciamento / Inscrição em Curso de Eletroestimulação Body Harmony®"}]}, {"id": "dados_emissor", "title": "4. Dados do Emissor / Beneficiário", "icon": "building", "fields": [{"key": "EMISSOR_NOME_RAZAO", "label": "Nome / Razão Social do Emissor", "type": "text", "default_value": "BODY HARMONY ESTÉTICA E CURSOS LTDA"}, {"key": "EMISSOR_CPF_CNPJ", "label": "CNPJ / CPF do Emissor", "type": "cnpj", "default_value": "46.123.456/0001-89"}]}]', '<div class="contract-logo-header" style="text-align: center; margin-bottom: 24px;">
    <img src="/assets/images/body-harmony-logo-color.png" alt="Body Harmony Logo" style="height: 75px; max-width: 280px; object-fit: contain;" />
</div>

<div style="border: 2px solid #0a3e60; border-radius: 8px; padding: 24px; background: #fafbfc; font-family: ''Times New Roman'', serif;">

    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #ed7e13; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 16pt; margin: 0; text-transform: uppercase;">
            RECIBO DE PAGAMENTO & QUITAÇÃO
        </h2>
        <div style="text-align: right; color: #0a3e60; font-family: Montserrat, sans-serif; font-weight: bold; font-size: 12pt;">
            Nº {{RECIBO_NUMERO}}
        </div>
    </div>

    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 20px; text-align: center;">
        <span style="font-size: 13pt; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">VALOR:</span>
        <span style="font-size: 18pt; font-weight: bold; color: #0a3e60; margin-left: 10px; font-family: Montserrat, sans-serif;">{{VALOR_TOTAL_NUM}}</span>
        <div style="font-size: 11pt; color: #334155; font-style: italic; margin-top: 4px;">
            ({{VALOR_TOTAL_EXTENSO}})
        </div>
    </div>

    <p style="text-align: justify; line-height: 1.8; font-size: 11.5pt;">
        Recebemos de <strong>{{PAGADOR_NOME_RAZAO}}</strong>, inscrito(a) no CPF/CNPJ sob o nº <strong>{{PAGADOR_CPF_CNPJ}}</strong>, estabelecido(a)/residente em <strong>{{PAGADOR_ENDERECO}}</strong>, a quantia supra discriminada de <strong>{{VALOR_TOTAL_NUM}}</strong> (<strong>{{VALOR_TOTAL_EXTENSO}}</strong>), quitada mediante <strong>{{FORMA_PAGAMENTO_DESCRICAO}}</strong>.
    </p>

    <h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 11pt; margin-top: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
        DISCRIMINAÇÃO DOS SERVIÇOS & PRODUTOS:
    </h3>

    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 11pt; line-height: 1.6;">
        {{DESCRICAO_SERVICOS_TAXAS}}
    </div>

    <p style="text-align: justify; line-height: 1.7; font-size: 11pt;">
        Pelo que firmamos o presente recibo, dando ao pagador a mais ampla, geral, rasa e irrevogável <strong>QUITAÇÃO</strong> pelo valor especificamente discriminado neste documento, para nada mais exigir com relação à presente parcela ou serviço.
    </p>

    <p style="text-align: right; margin-top: 35px; font-size: 11pt;">
        <strong>{{CIDADE_EMISSAO}}</strong>, <strong>{{DATA_EMISSAO_EXTENSO}}</strong>.
    </p>

    <div style="margin-top: 45px; text-align: center;">
        <div style="display: inline-block; width: 340px; border-top: 1px solid #0a3e60; padding-top: 6px; font-size: 11pt;">
            <strong>{{EMISSOR_NOME_RAZAO}}</strong><br />
            CNPJ/CPF: {{EMISSOR_CPF_CNPJ}}<br />
            <span style="color: #64748b; font-size: 9pt; text-transform: uppercase;">Beneficiário / Emissor</span>
        </div>
    </div>

</div>', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    `title` = VALUES(`title`),
    `category` = VALUES(`category`),
    `description` = VALUES(`description`),
    `variables_schema` = VALUES(`variables_schema`),
    `content_html` = VALUES(`content_html`),
    `updated_at` = NOW();

-- [Parcerias] contrato-parceria-comercial-padrao
INSERT INTO `contract_templates` (`slug`, `title`, `category`, `description`, `version`, `variables_schema`, `content_html`, `is_active`, `created_at`, `updated_at`)
VALUES ('contrato-parceria-comercial-padrao', 'Contrato de Parceria Comercial & Espaço Compartilhado (Oficial)', 'Parcerias', 'Contrato de parceria estratégica, cessão de espaço clínico para eletroestimulação por atendimento, divisão de honorários/comissões, responsabilidade autônoma e padrão da marca.', 'v1.0', '[{"id": "qualificacao_parceira", "title": "1. Qualificação da Parceira", "icon": "handshake", "fields": [{"key": "PARCEIRA_RAZAO_SOCIAL", "label": "Razão Social / Nome da Parceira", "type": "text", "required": true, "placeholder": "Clínica ou Profissional Parceira"}, {"key": "PARCEIRA_CNPJ_CPF", "label": "CNPJ ou CPF", "type": "cpf_cnpj", "required": true, "placeholder": "00.000.000/0000-00"}, {"key": "PARCEIRA_REPRESENTANTE", "label": "Representante Legal", "type": "text", "placeholder": "Nome do representante"}, {"key": "PARCEIRA_ENDERECO", "label": "Endereço da Sede / Clínica", "type": "text", "required": true, "placeholder": "Rua, Número, Bairro"}, {"key": "PARCEIRA_CIDADE_UF", "label": "Cidade / UF", "type": "text", "required": true, "placeholder": "Ex: Assis/SP"}, {"key": "PARCEIRA_EMAIL", "label": "E-mail Oficial", "type": "email", "required": true}, {"key": "PARCEIRA_TELEFONE", "label": "Telefone / WhatsApp", "type": "phone", "required": true}]}, {"id": "objeto_parceria", "title": "2. Espaço Compartilhado & Operação", "icon": "clinic-medical", "fields": [{"key": "ENDERECO_CLINICA_PARCERIA", "label": "Endereço do Espaço Clínico Compartilhado", "type": "text", "required": true, "placeholder": "Endereço onde ocorrerão os atendimentos"}, {"key": "ESPECIFICACAO_SALA_EQUIPAMENTOS", "label": "Salas e Equipamentos Cedidos", "type": "text", "default_value": "Sala de atendimento estético climatizada e equipamento de eletroestimulação Body Harmony®"}, {"key": "DIAS_HORARIOS_DISPONIBILIZADOS", "label": "Dias e Horários de Uso", "type": "text", "default_value": "Conforme agendamento prévio via sistema"}]}, {"id": "condicoes_comerciais", "title": "3. Condições Comerciais & Repasses", "icon": "percentage", "fields": [{"key": "PERCENTUAL_REPASSE_PARCEIRA", "label": "Percentual / Comissão do Espaço (%)", "type": "text", "required": true, "default_value": "30% sobre o valor bruto das sessões"}, {"key": "VALOR_MINIMO_SESSAO_NUM", "label": "Valor Mínimo por Procedimento (R$)", "type": "currency", "default_value": "R$ 250,00"}, {"key": "PERIODICIDADE_REPASSE", "label": "Periodicidade do Repasse", "type": "text", "default_value": "Mensal, até o 5º dia útil do mês subsequente"}]}, {"id": "vigencia_rescisao", "title": "4. Vigência & Rescisão", "icon": "calendar-alt", "fields": [{"key": "PRAZO_VIGENCIA_MESES", "label": "Prazo de Vigência (Meses)", "type": "text", "default_value": "12 meses"}, {"key": "AVISO_PREVIO_DIAS", "label": "Aviso Prévio para Rescisão (Dias)", "type": "text", "default_value": "30 dias"}, {"key": "MULTA_RESCISAO_NUM", "label": "Multa Rescisória (R$)", "type": "currency", "default_value": "R$ 3.000,00"}, {"key": "MULTA_RESCISAO_EXTENSO", "label": "Multa por Extenso", "type": "text", "default_value": "três mil reais"}]}, {"id": "fechamento_parceria", "title": "5. Fechamento & Testemunhas", "icon": "pen-nib", "fields": [{"key": "CIDADE_CELEBRACAO", "label": "Cidade de Celebração", "type": "text", "default_value": "Assis/SP"}, {"key": "DATA_CELEBRACAO_EXTENSO", "label": "Data por Extenso", "type": "text", "required": true}, {"key": "TESTEMUNHA_1_NOME", "label": "Nome Testemunha 1", "type": "text", "default_value": "Testemunha 1"}, {"key": "TESTEMUNHA_1_CPF", "label": "CPF Testemunha 1", "type": "cpf", "placeholder": "000.000.000-00"}, {"key": "TESTEMUNHA_2_NOME", "label": "Nome Testemunha 2", "type": "text", "default_value": "Testemunha 2"}, {"key": "TESTEMUNHA_2_CPF", "label": "CPF Testemunha 2", "type": "cpf", "placeholder": "000.000.000-00"}]}]', '<div class="contract-logo-header" style="text-align: center; margin-bottom: 24px;">
    <img src="/assets/images/body-harmony-logo-color.png" alt="Body Harmony Logo" style="height: 75px; max-width: 280px; object-fit: contain;" />
</div>

<h2 style="text-align: center; color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 15pt; font-weight: bold; margin-bottom: 6px; text-transform: uppercase;">
    CONTRATO DE PARCERIA COMERCIAL & ESPAÇO COMPARTILHADO
</h2>
<p style="text-align: center; color: #ed7e13; font-family: Montserrat, sans-serif; font-size: 10.5pt; font-weight: bold; margin-top: 0; margin-bottom: 24px; letter-spacing: 1px;">
    CO-BRANDING & ATENDIMENTOS DE ELETROESTIMULAÇÃO BODY HARMONY®
</p>

<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    Pelo presente instrumento particular de parceria comercial e operacional, de um lado:
</p>

<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    <strong>BODY HARMONY ESTÉTICA E CURSOS LTDA</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 46.123.456/0001-89, com sede em Assis/SP, doravante denominada simplesmente <strong>PARCEIRA TITULAR</strong>;
</p>

<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    E, de outro lado:
</p>

<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    <strong>{{PARCEIRA_RAZAO_SOCIAL}}</strong>, inscrita no CNPJ/CPF sob o nº <strong>{{PARCEIRA_CNPJ_CPF}}</strong>, representada por <strong>{{PARCEIRA_REPRESENTANTE}}</strong>, com sede/endereço em <strong>{{PARCEIRA_ENDERECO}}</strong>, <strong>{{PARCEIRA_CIDADE_UF}}</strong>, e-mail <strong>{{PARCEIRA_EMAIL}}</strong>, telefone <strong>{{PARCEIRA_TELEFONE}}</strong>, doravante denominada simplesmente <strong>PARCEIRA ASSOCIADA</strong>;
</p>

<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    Têm entre si, justo e acordado, o presente Contrato de Parceria, mediante as seguintes cláusulas:
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    CLÁUSULA PRIMEIRA — DO OBJETO E ESPAÇO COMPARTILHADO
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    1.1. O presente instrumento tem por objeto o estabelecimento de parceria comercial entre as partes para prestação de atendimentos estéticos com tecnologia de eletroestimulação no espaço clínico localizado em <strong>{{ENDERECO_CLINICA_PARCERIA}}</strong>.
</p>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    1.2. A cessão do espaço abrange: <strong>{{ESPECIFICACAO_SALA_EQUIPAMENTOS}}</strong>, a ser utilizado no formato: <strong>{{DIAS_HORARIOS_DISPONIBILIZADOS}}</strong>.
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    CLÁUSULA SEGUNDA — DA REMUNERAÇÃO E REPASSES
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    2.1. Pelos atendimentos realizados no espaço compartilhado, será devida a comissão/repasse no importe de <strong>{{PERCENTUAL_REPASSE_PARCEIRA}}</strong>, respeitando o valor mínimo de <strong>{{VALOR_MINIMO_SESSAO_NUM}}</strong> por sessão.
</p>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    2.2. A apuração dos valores e o respectivo repasse financeiro serão realizados na periodicidade: <strong>{{PERIODICIDADE_REPASSE}}</strong>, mediante apresentação do relatório analítico de sessões.
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    CLÁUSULA TERCEIRA — DA AUTONOMIA E RESPONSABILIDADE TÉCNICA
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    3.1. As partes declaram expressamente que a presente parceria possui natureza estritamente comercial e civil, não gerando qualquer vínculo de emprego, subordinação jurídica ou sociedade entre si.
</p>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    3.2. Cada parte responde civil, criminal e eticamente de forma autônoma pela conduta de seus respectivos profissionais perante seus conselhos de classe e pacientes.
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    CLÁUSULA QUARTA — DA VIGÊNCIA E RESCISÃO
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    4.1. Este contrato vigorará pelo prazo de <strong>{{PRAZO_VIGENCIA_MESES}}</strong>, podendo ser rescindido imotivadamente por qualquer das partes mediante aviso prévio por escrito de <strong>{{AVISO_PREVIO_DIAS}}</strong>.
</p>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    4.2. A infração grave de qualquer cláusula ensejará a rescisão imediata e aplicação de multa não-compensatória de <strong>{{MULTA_RESCISAO_NUM}}</strong> (<strong>{{MULTA_RESCISAO_EXTENSO}}</strong>).
</p>

<h3 style="color: #0a3e60; font-family: Montserrat, sans-serif; font-size: 12pt; margin-top: 20px; border-bottom: 1px solid #ed7e13; padding-bottom: 4px;">
    CLÁUSULA QUINTA — DO FORO
</h3>
<p style="text-align: justify; line-height: 1.6; font-size: 11pt; font-family: ''Times New Roman'', serif;">
    5.1. Para dirimir quaisquer litígios oriundos deste contrato, as partes elegem o foro da Comarca de <strong>{{CIDADE_CELEBRACAO}}</strong>.
</p>

<p style="text-align: center; margin-top: 30px; font-family: ''Times New Roman'', serif; font-size: 11pt;">
    <strong>{{CIDADE_CELEBRACAO}}</strong>, <strong>{{DATA_CELEBRACAO_EXTENSO}}</strong>.
</p>

<table style="width: 100%; margin-top: 40px; border: none; font-family: ''Times New Roman'', serif; font-size: 11pt;">
    <tr>
        <td style="width: 48%; text-align: center; border: none; vertical-align: bottom;">
            ___________________________________________<br />
            <strong>BODY HARMONY ESTÉTICA E CURSOS LTDA</strong><br />
            PARCEIRA TITULAR
        </td>
        <td style="width: 4%;"></td>
        <td style="width: 48%; text-align: center; border: none; vertical-align: bottom;">
            ___________________________________________<br />
            <strong>{{PARCEIRA_RAZAO_SOCIAL}}</strong><br />
            PARCEIRA ASSOCIADA
        </td>
    </tr>
    <tr><td colspan="3" style="height: 35px; border: none;"></td></tr>
    <tr>
        <td style="width: 48%; text-align: center; border: none; vertical-align: bottom;">
            ___________________________________________<br />
            <strong>{{TESTEMUNHA_1_NOME}}</strong><br />
            CPF: {{TESTEMUNHA_1_CPF}}
        </td>
        <td style="width: 4%;"></td>
        <td style="width: 48%; text-align: center; border: none; vertical-align: bottom;">
            ___________________________________________<br />
            <strong>{{TESTEMUNHA_2_NOME}}</strong><br />
            CPF: {{TESTEMUNHA_2_CPF}}
        </td>
    </tr>
</table>', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    `title` = VALUES(`title`),
    `category` = VALUES(`category`),
    `description` = VALUES(`description`),
    `variables_schema` = VALUES(`variables_schema`),
    `content_html` = VALUES(`content_html`),
    `updated_at` = NOW();
