// Centralized Translation System for Nexus
// Sistema de Traduções Centralizado para o Nexus
// Approach: Hybrid Object-based (Zero dependencies)

export const pt = {
    common: {
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        edit: 'Editar',
        loading: 'Carregando...',
        error: 'Erro',
        success: 'Sucesso',
        close: 'Fechar',
        confirm: 'Confirmar',
        search: 'Buscar',
        filter: 'Filtrar',
        refresh: 'Atualizar'
    },

    navigation: {
        watchtower: 'Watchtower',
        warRoom: 'War Room',
        signalTower: 'Signal Tower',
        vault: 'The Vault',
        barracks: 'Barracks',
        engineRoom: 'Engine Room',
        logout: 'Sair'
    },

    nexus: {
        barracks: {
            title: 'Nexus Barracks',
            subtitle: 'Gerenciamento de Licenciadas',

            tabs: {
                students: 'Licenciadas',
                admins: 'Administradores'
            },

            status: {
                active: 'ATIVA',
                banned: 'BLOQUEADA'
            },

            actions: {
                createStudent: 'Criar Licenciada',
                createAdmin: 'Criar Admin',
                ban: 'Bloquear Acesso',
                unban: 'Liberar Acesso',
                clearDevices: 'Resetar Devices',
                diagnostic: 'Diagnóstico',
                resetPassword: 'Resetar Senha',
                delete: 'Excluir',
                refresh: 'Atualizar',
                impersonate: 'Modo Fantasma'
            },

            table: {
                status: 'Status',
                name: 'Nome',
                contact: 'Contato',
                devices: 'Devices',
                lastSeen: 'Última Atividade',
                actions: 'Ações',
                username: 'Usuário',
                role: 'Função',
                createdAt: 'Criado em',
                user: 'Usuário',
                ipAddress: 'Endereço IP',
                action: 'Ação',
                time: 'Horário'
            },

            modal: {
                createStudentTitle: 'Criar Nova Licenciada',
                createAdminTitle: 'Criar Novo Administrador',
                resetPasswordTitle: 'Resetar Senha',
                name: 'Nome',
                whatsapp: 'WhatsApp',
                instagram: 'Instagram',
                password: 'Senha',
                username: 'Nome de Usuário',
                role: 'Função',
                admin: 'Admin',
                superadmin: 'Superadmin',
                newPassword: 'Nova Senha'
            },
            fields: {
                name: 'Nome',
                contact: 'Contato',
                whatsapp: 'WhatsApp',
                instagram: 'Instagram',
                role: 'Função',
                status: 'Status'
            },
            messages: {
                studentCreated: 'Licenciada criada com sucesso',
                adminCreated: 'Administrador criado com sucesso',
                passwordReset: 'Senha resetada com sucesso',
                userDeleted: 'Usuário excluído com sucesso',
                actionSuccess: 'Ação realizada com sucesso',
                confirmDelete: 'Tem certeza que deseja excluir?',
                loading: 'Carregando dados...',
                noData: 'Nenhum registro encontrado'
            },

            deviceCount: (count) => `Resetar Devices (${count}/3)`
        },

        watchtower: {
            title: 'Watchtower // Surveillance',
            subtitle: 'Monitor de Sessões Ativas',
            activeUsers: 'Usuários Ativos (15m)',
            securityAlerts: 'Alertas de Segurança',
            threatDetected: '⚠️ AMEAÇA DETECTADA: COMPARTILHAMENTO DE CREDENCIAIS',
            liveFeed: 'Feed ao Vivo',
            banUser: 'BLOQUEAR USUÁRIO',
            table: {
                user: 'Usuário',
                distinctIPs: 'IPs Distintos',
                ipList: 'Lista de IPs',
                action: 'Ação',
                ipAddress: 'Endereço IP',
                time: 'Horário'
            },
            guest: 'Visitante'
        },

        engineRoom: {
            title: 'Engine Room // System Diagnostics',
            subtitle: 'Status do Sistema',
            logs: 'Logs do Sistema',
            health: 'Saúde do Sistema',
            systemLogs: 'Logs do Sistema',
            viewLogs: 'Visualizar Logs',
            refresh: 'Atualizar',
            lines: 'linhas'
        },

        signalTower: {
            title: 'Signal Tower',
            subtitle: 'Console de Broadcasts'
        }
    },

    errors: {
        title: 'Erro na Operação',
        technicalDetails: 'Detalhes Técnicos:',

        // Error types from NexusErrorHandler
        EMPTY_REQUEST_BODY: 'Corpo da requisição vazio. Certifique-se de enviar dados JSON.',
        INVALID_JSON: 'Formato JSON inválido na requisição.',
        MISSING_ACTION: 'Parâmetro de ação não foi fornecido.',
        INVALID_ACTION: 'Ação desconhecida. Verifique os parâmetros enviados.',
        MISSING_PARAMETER: 'Parâmetro obrigatório ausente.',
        UNAUTHORIZED: 'Não autorizado. Faça login novamente.',
        FORBIDDEN: 'Acesso negado. Você não tem permissão para esta operação.',
        NOT_FOUND: 'Recurso não encontrado no banco de dados.',
        DATABASE_ERROR: 'Erro na operação do banco de dados. Tente novamente.',
        VALIDATION_ERROR: 'Erro de validação. Verifique os dados enviados.',
        UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.'
    }
};

// Helper function for safe access with fallback
// Função auxiliar para acesso seguro com fallback
export const t = (key, fallback = key) => {
    const keys = key.split('.');
    let value = pt;

    for (const k of keys) {
        value = value?.[k];
        if (value === undefined) return fallback;
    }

    return value;
};

// Export default for convenience
export default pt;
