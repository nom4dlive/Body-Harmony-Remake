# frozen_string_literal: true

admin_user = User.find_by(email: 'admin@bodyharmony.com.br')
if admin_user
  admin_user.update_columns(type: 'SuperAdmin')
  puts ">> Updated existing User to SuperAdmin: #{admin_user.email} (ID: #{admin_user.id})"
else
  super_admin = SuperAdmin.new(
    name: 'Dra. Josi Silva / Admin',
    email: 'admin@bodyharmony.com.br',
    password: 'BodyHarmony2026!Master',
    password_confirmation: 'BodyHarmony2026!Master',
    confirmed_at: Time.current
  )
  super_admin.save!(validate: false)
  puts ">> Created new SuperAdmin: #{super_admin.email}"
end

puts "SuperAdmin count now: #{SuperAdmin.count}"
