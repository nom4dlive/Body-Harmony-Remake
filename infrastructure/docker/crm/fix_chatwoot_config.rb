# frozen_string_literal: true

puts ">> Checking Chatwoot Installation Config..."

# 1. Set INSTALLATION_COMPLETED = { value: true }
config = InstallationConfig.find_or_initialize_by(name: 'INSTALLATION_COMPLETED')
config.serialized_value = { 'value' => true }.with_indifferent_access
config.save!
puts ">> Set INSTALLATION_COMPLETED = true"

# 2. Check all current config values
InstallationConfig.all.each do |c|
  puts "   - #{c.name}: #{c.serialized_value.inspect}"
end

puts ">> Chatwoot Installation Config OK!"
