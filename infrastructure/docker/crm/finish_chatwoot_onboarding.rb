# frozen_string_literal: true
# ==============================================================================
# Body Harmony Nexus V3.1 — Finalização Definitiva de Onboarding Chatwoot
# ==============================================================================

puts ">> Finalizando Onboarding do Chatwoot..."

# 1. Deletar chave do Redis que forçava o redirecionamento
::Redis::Alfred.delete(::Redis::Alfred::CHATWOOT_INSTALLATION_ONBOARDING)
puts ">> Deletada chave Redis: #{::Redis::Alfred::CHATWOOT_INSTALLATION_ONBOARDING}"

# 2. Assegurar SuperAdmin
admin_user = User.find_by(email: 'admin@bodyharmony.com.br')
if admin_user
  admin_user.update_columns(type: 'SuperAdmin')
  puts ">> SuperAdmin confirmado: #{admin_user.email} (ID: #{admin_user.id})"
end

# 3. Assegurar Configurações de Instalação Concluída
cfg = InstallationConfig.find_or_initialize_by(name: 'INSTALLATION_COMPLETED')
cfg.serialized_value = { 'value' => true }.with_indifferent_access
cfg.save!
puts ">> Gravado INSTALLATION_COMPLETED = true"

# 4. Validar que a chave Redis foi zerada
redis_val = ::Redis::Alfred.get(::Redis::Alfred::CHATWOOT_INSTALLATION_ONBOARDING)
puts ">> Status Redis CHATWOOT_INSTALLATION_ONBOARDING: #{redis_val.inspect} (Deve ser nil)"

if redis_val.nil?
  puts "\n🎉 ONBOARDING FINALIZADO COM SUCESSO! Chatwoot agora abre diretamente na tela de login."
else
  puts "\n⚠️ Atenção: Chave Redis ainda presente: #{redis_val}"
end
