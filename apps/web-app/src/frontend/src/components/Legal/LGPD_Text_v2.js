export const LGPD_CONTENT_V2 = {
    version: 'v3.1-2026',

    // §1 Identificação + §2 Modalidades + §3 Segurança + §5 Forense + §6 Penalidades + §9 Foro
    terms: {
        title: "Termos de Uso",
        intro: "Este contrato é celebrado entre a BODY HARMONY ELETROESTIMULAÇÃO LTDA. (CNPJ nº 68.016.506/0001-22), com sede na Rua Sebastião da Silva Leite, nº 456, Vila Rosângela, CEP 19.814-370, em Assis/SP, e você, o 'Usuário'. A Plataforma opera no modelo SaaS oferecendo Ecossistema LMS, atividades de Bem-estar e IA Generativa (Doctor Harmony) para categorias de acesso específicas.",
        sections: [
            {
                heading: "2. Modalidades de Acesso e Aquisição",
                content: `
                    <p>O acesso à plataforma pode ocorrer via compra direta ou por plataformas parceiras (ex: Kiwify).</p>
                    <ul>
                        <li><strong>🌟 Acesso Completo:</strong> Inclui todas as aulas e a mentoria via IA.</li>
                        <li><strong>📚 Acesso Conteúdo:</strong> Destinado a usuárias que adquiriram cursos específicos em plataformas externas, sem acesso às ferramentas de IA.</li>
                    </ul>
                    <p><strong>💳 Sistemas de Pagamento:</strong></p>
                    <ul>
                        <li><strong>Licenciamento:</strong> Compra de acesso único/vitalício.</li>
                        <li><strong>Assinatura:</strong> Acesso recorrente mediante mensalidade ou anuidade.</li>
                    </ul>
                `
            },
            {
                heading: "3. Regras de Segurança e Acesso Único",
                content: `
                    <p>Sua licença é pessoal e intransferível.</p>
                    <ul>
                        <li><strong>🔐 Proibição de Compartilhamento:</strong> O sistema monitora o endereço IP e a geolocalização para evitar acessos simultâneos indevidos.</li>
                        <li><strong>🤖 Proteção Anti-Bot:</strong> O uso da plataforma e o consumo de créditos são monitorados para evitar ataques técnicos e garantir a estabilidade do sistema.</li>
                    </ul>
                `
            },
            {
                heading: "5. Proteção Forense e Propriedade Intelectual",
                content: `
                    <p>Utilizamos medidas técnicas para proteger o conteúdo contra pirataria e "rateio":</p>
                    <ul>
                        <li><strong>💧 Marcas d'água Dinâmicas:</strong> PDFs e vídeos exibirão seu Nome e CPF. O CPF é utilizado como identificador direto para garantir a rastreabilidade em caso de vazamento ilícito.</li>
                        <li><strong>🕵️ Fingerprinting:</strong> Injeção de metadados invisíveis (criptografia AES-256) em todos os materiais baixados.</li>
                    </ul>
                `
            },
            {
                heading: "6. Penalidades e Cláusula Penal",
                content: `
                    <p>A violação das regras de acesso ou a distribuição ilegal de materiais resultará em:</p>
                    <ul>
                        <li><strong>🚫 Bloqueio Definitivo:</strong> Suspensão da conta sem direito a qualquer reembolso.</li>
                        <li><strong>💸 Multa Contratual:</strong>
                            <ul>
                                <li><em>Para Licenciamento (Pagamento Único):</em> Multa equivalente ao valor total pago pela licença.</li>
                                <li><em>Para Assinatura (Recorrente):</em> Multa equivalente ao valor de 12 parcelas da assinatura vigente.</li>
                            </ul>
                        </li>
                        <li><strong>⚖️ Perdas e Danos:</strong> Caso o dano real supere o valor da multa (ex: pirataria em massa), a plataforma cobrará a diferença judicialmente, conforme o Art. 416 do Código Civil.</li>
                    </ul>
                `
            },
            {
                heading: "9. Disposições Finais",
                content: `<p>Este contrato segue as leis brasileiras. O foro eleito é a Comarca de Assis/SP.</p>`
            }
        ]
    },

    // §7 Privacidade + §8 Direitos
    privacy: {
        title: "Privacidade e Dados",
        intro: "Tratamos seus dados apenas para as finalidades descritas, seguindo os prazos legais.",
        sections: [
            {
                heading: "7. Política de Privacidade e Retenção de Dados",
                content: `
                    <ul>
                        <li><strong>🌐 Logs de Acesso:</strong> IP e horários de conexão são guardados por 6 meses (Marco Civil da Internet).</li>
                        <li><strong>📊 Dados de Cadastro:</strong> Mantidos por até 5 anos após o fim da relação para fins de defesa judicial e obrigações fiscais.</li>
                        <li><strong>🌍 Transferência Internacional:</strong> Seus dados são processados em servidores globais seguros. A plataforma opera em conformidade com a Resolução CD/ANPD nº 19/2024, com Cláusulas-Padrão Contratuais (SCCs) obrigatórias desde agosto de 2025.</li>
                        <li><strong>🇪🇺 Adequação Europeia:</strong> Conforme a Resolução nº 32/2026, reconhecemos a União Europeia como destino com nível de proteção adequado.</li>
                    </ul>
                `
            },
            {
                heading: "8. Seus Direitos e Canais de Suporte",
                content: `
                    <p>Você pode acessar seu painel de Configurações de Privacidade para gerenciar seus dados ou solicitar a portabilidade.</p>
                    <p><strong>📧 Suporte:</strong> Para dúvidas ou exercício de direitos (acesso, exclusão ou correção), entre em contato via: <a href="mailto:suporte@bodyharmony.com.br">suporte@bodyharmony.com.br</a>.</p>
                `
            }
        ]
    },

    // §4 IA (Doctor Harmony)
    ai_usage: {
        title: "IA: Doctor Harmony",
        content: `
            <p><em>(Cláusula aplicável apenas às usuárias com acesso à IA)</em></p>
            <p>A IA processa dados para sua mentoria personalizada. Conforme o Art. 20 da LGPD, você possui direitos garantidos:</p>
            <ul>
                <li><strong>✨ Modo Personalizado (Consentimento):</strong> A IA utiliza seu histórico para gerar dicas exclusivas.</li>
                <li><strong>👤 Modo Genérico (Autodeterminação):</strong> A IA opera sem retenção de memória entre sessões.</li>
            </ul>
            <p><em>⚖️ Revisão Humana: Você pode solicitar a revisão de qualquer decisão automatizada da IA que afete seu perfil.</em></p>
        `
    }
};
