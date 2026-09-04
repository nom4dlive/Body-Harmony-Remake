# frozen_string_literal: true
# ==============================================================================
# Body Harmony Nexus V3.1 — Chatwoot Inboxes & Super Admin Seed (PLAN-152)
# ==============================================================================

require 'json'

puts '>> [Chatwoot Seed] Initializing Master Account & Inboxes...'

# 1. Setup Master Account
account = Account.find_by(name: 'Body Harmony')
unless account
  account = Account.create!(
    name: 'Body Harmony',
    locale: 'pt_BR'
  )
  puts ">> Created Master Account: #{account.name} (ID: #{account.id})"
else
  puts ">> Found Master Account: #{account.name} (ID: #{account.id})"
end

# 2. Setup Super Admin User
admin_email = 'admin@bodyharmony.com.br'
user = User.find_by(email: admin_email)
unless user
  user = User.new(
    name: 'Dra. Josi Silva / Admin',
    email: admin_email,
    password: 'BodyHarmony2026!Master',
    password_confirmation: 'BodyHarmony2026!Master',
    confirmed_at: Time.current
  )
  user.save!(validate: false)
  puts ">> Created Super Admin User: #{user.email} (ID: #{user.id})"
else
  puts ">> Found Super Admin User: #{user.email} (ID: #{user.id})"
end

# 3. Associate Super Admin with Account
AccountUser.find_or_create_by!(account: account, user: user) do |au|
  au.role = :administrator
end

# 4. Generate / Retrieve Access Token
token_record = AccessToken.find_by(owner: user) || AccessToken.create!(owner: user)
api_token = token_record.token

# 5. Helper to create API Channel Inboxes
def get_or_create_api_inbox(account, user, name)
  inbox = account.inboxes.find_by(name: name)
  if inbox
    puts ">> Found Existing Inbox: #{name} (ID: #{inbox.id})"
    return inbox
  end

  channel = Channel::Api.create!(account: account)
  inbox = account.inboxes.create!(
    name: name,
    channel: channel
  )
  InboxMember.find_or_create_by!(inbox: inbox, user: user)
  puts ">> Created API Inbox: #{name} (ID: #{inbox.id})"
  inbox
end

# 6. Helper to create Email Channel Inbox
def get_or_create_email_inbox(account, user, name, email)
  inbox = account.inboxes.find_by(name: name)
  if inbox
    puts ">> Found Existing Email Inbox: #{name} (ID: #{inbox.id})"
    return inbox
  end

  channel = Channel::Email.create!(
    account: account,
    email: email,
    forward_to_email: "crm+#{SecureRandom.hex(4)}@bodyharmony.com.br"
  )
  inbox = account.inboxes.create!(
    name: name,
    channel: channel
  )
  InboxMember.find_or_create_by!(inbox: inbox, user: user)
  puts ">> Created Email Inbox: #{name} (ID: #{inbox.id})"
  inbox
end

# 7. Create 5 Official Inboxes
inbox_juridico = get_or_create_api_inbox(account, user, '⚖️ Jurídico & Contratos')
inbox_licenciadas = get_or_create_api_inbox(account, user, '👑 Suporte Licenciadas (Dra. Josi)')
inbox_comercial = get_or_create_api_inbox(account, user, '💼 Comercial & Vendas (Karice)')
inbox_clinica = get_or_create_api_inbox(account, user, '💆 Clínica Matriz (Cibele)')
inbox_email = get_or_create_email_inbox(account, user, '✉️ E-mail Institucional', 'contato@bodyharmony.com.br')

# 8. Output Structured JSON Summary
result = {
  account_id: account.id,
  account_name: account.name,
  user_email: user.email,
  api_token: api_token,
  inboxes: {
    juridico: { id: inbox_juridico.id, name: inbox_juridico.name, identifier: inbox_juridico.channel.identifier },
    licenciadas: { id: inbox_licenciadas.id, name: inbox_licenciadas.name, identifier: inbox_licenciadas.channel.identifier },
    comercial: { id: inbox_comercial.id, name: inbox_comercial.name, identifier: inbox_comercial.channel.identifier },
    clinica: { id: inbox_clinica.id, name: inbox_clinica.name, identifier: inbox_clinica.channel.identifier },
    email: { id: inbox_email.id, name: inbox_email.name }
  }
}

puts "\n--- JSON_OUTPUT_START ---"
puts JSON.pretty_generate(result)
puts "--- JSON_OUTPUT_END ---\n"
