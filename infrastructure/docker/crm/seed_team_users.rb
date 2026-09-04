# frozen_string_literal: true
# ==============================================================================
# Body Harmony Nexus V3.1 — Chatwoot Team Users Provisioning (PLAN-157)
# ==============================================================================

require 'json'

puts '>> [Chatwoot Team Seed] Initializing Team User Accounts...'

# 1. Retrieve Master Account
account = Account.find_by(name: 'Body Harmony') || Account.first
unless account
  account = Account.create!(
    name: 'Body Harmony',
    locale: 'pt_BR'
  )
  puts ">> Created Master Account: #{account.name} (ID: #{account.id})"
else
  puts ">> Found Master Account: #{account.name} (ID: #{account.id})"
end

# 2. Retrieve All Account Inboxes
inboxes = account.inboxes.to_a
puts ">> Found #{inboxes.count} Inboxes in Account ##{account.id}:"
inboxes.each { |ib| puts "   - [ID: #{ib.id}] #{ib.name}" }

# 3. Define Team Users
team_users_data = [
  {
    email: 'comercial@bodyharmony.com.br',
    name: 'Comercial / Vendas',
    password: 'y4f6XPmr*L:7',
    role: :agent
  },
  {
    email: 'giovanna@bodyharmony.com.br',
    name: 'Giovanna',
    password: 'Gi010203*',
    role: :agent
  },
  {
    email: 'cibele@bodyharmony.com.br',
    name: 'Cibele',
    password: 'Ci010203*',
    role: :agent
  },
  {
    email: 'guilherme@bodyharmony.com.br',
    name: 'Guilherme',
    password: 'Gui010203*',
    role: :agent
  },
  {
    email: 'eliadynne@bodyharmony.com.br',
    name: 'Eliadynne',
    password: 'Li010203*',
    role: :agent
  },
  {
    email: 'juridico@bodyharmony.com.br',
    name: 'Jurídico & Contratos',
    password: 'Jur010203*',
    role: :agent
  },
  {
    email: 'kaprice@bodyharmony.com.br',
    name: 'Karice / Expansão',
    password: 'Ka010203*',
    role: :administrator
  }
]

created_users = []

# 4. Provision Each User
team_users_data.each do |user_def|
  user = User.find_by(email: user_def[:email])
  status = 'ACTIVE'

  if user.nil?
    user = User.new(
      name: user_def[:name],
      email: user_def[:email],
      password: user_def[:password],
      password_confirmation: user_def[:password],
      confirmed_at: Time.current
    )
    user.save!(validate: false)
    status = 'CREATED'
    puts ">> [NEW] Created User: #{user.email} (ID: #{user.id})"
  else
    user.name = user_def[:name]
    user.password = user_def[:password]
    user.password_confirmation = user_def[:password]
    user.confirmed_at = Time.current if user.confirmed_at.nil?
    user.save!(validate: false)
    status = 'UPDATED'
    puts ">> [UPDATE] Updated User: #{user.email} (ID: #{user.id})"
  end

  # Associate with Account
  account_user = AccountUser.find_by(account: account, user: user)
  if account_user.nil?
    account_user = AccountUser.create!(
      account: account,
      user: user,
      role: user_def[:role]
    )
  else
    account_user.update!(role: user_def[:role])
  end

  # Assign to All Inboxes
  assigned_inboxes = []
  inboxes.each do |inbox|
    InboxMember.find_or_create_by!(inbox: inbox, user: user)
    assigned_inboxes << inbox.name
  end

  created_users << {
    email: user.email,
    name: user.name,
    role: user_def[:role].to_s,
    status: status,
    chatwoot_user_id: user.id,
    inboxes_assigned: assigned_inboxes
  }
end

# 4b. Clear Onboarding Redis key & ensure SuperAdmin
::Redis::Alfred.delete(::Redis::Alfred::CHATWOOT_INSTALLATION_ONBOARDING)
admin_rec = User.find_by(email: 'admin@bodyharmony.com.br')
admin_rec&.update_columns(type: 'SuperAdmin')
cfg = InstallationConfig.find_or_initialize_by(name: 'INSTALLATION_COMPLETED')
cfg.serialized_value = { 'value' => true }.with_indifferent_access
cfg.save!

# 5. Output JSON Result
summary = {
  success: true,
  account_id: account.id,
  account_name: account.name,
  users_count: created_users.count,
  users: created_users
}

puts "\n--- JSON_OUTPUT_START ---"
puts JSON.pretty_generate(summary)
puts "--- JSON_OUTPUT_END ---\n"
