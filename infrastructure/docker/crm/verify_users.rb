# frozen_string_literal: true

test_credentials = {
  'admin@bodyharmony.com.br' => 'BodyHarmony2026!Master',
  'comercial@bodyharmony.com.br' => 'y4f6XPmr*L:7',
  'giovanna@bodyharmony.com.br' => 'Gi010203*',
  'cibele@bodyharmony.com.br' => 'Ci010203*',
  'guilherme@bodyharmony.com.br' => 'Gui010203*',
  'eliadynne@bodyharmony.com.br' => 'Li010203*',
  'juridico@bodyharmony.com.br' => 'Jur010203*',
  'kaprice@bodyharmony.com.br' => 'Ka010203*'
}

puts "\n==============================================================="
puts "          VALIDAÇÃO DE USUÁRIOS NO CHATWOOT (RAILS)            "
puts "===============================================================\n"

all_ok = true

test_credentials.each do |email, pass|
  user = User.find_by(email: email)
  if user.nil?
    puts "❌ [NÃO ENCONTRADO] #{email}"
    all_ok = false
    next
  end

  valid_pw = user.valid_password?(pass)
  confirmed = user.confirmed_at.present?
  account_user = AccountUser.find_by(user: user)
  role = account_user&.role || 'NONE'
  inboxes_count = InboxMember.where(user: user).count

  if valid_pw && confirmed && role != 'NONE'
    puts "✅ [OK] ID: #{user.id} | #{email} | #{user.name} | Role: #{role} | Confirmed: #{confirmed} | Inboxes: #{inboxes_count} | Senha Válida: #{valid_pw}"
  else
    puts "❌ [FAIL] ID: #{user.id} | #{email} | Valid PW: #{valid_pw} | Confirmed: #{confirmed} | Role: #{role}"
    all_ok = false
  end
end

puts "\n==============================================================="
puts all_ok ? "🎉 100% DOS USUÁRIOS E SENHAS VALIDADOS NO CHATWOOT!" : "⚠️ FALHA NA VALIDAÇÃO DE ALGUNS USUÁRIOS"
puts "===============================================================\n"
