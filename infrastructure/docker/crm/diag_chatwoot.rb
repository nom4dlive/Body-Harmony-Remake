# frozen_string_literal: true

puts "SuperAdmin count: #{defined?(SuperAdmin) ? SuperAdmin.count : 'not defined'}"
puts "Users: #{User.all.map { |u| [u.id, u.email, u.type, u.custom_attributes].inspect }}"
puts "GlobalConfig: #{defined?(GlobalConfig) ? GlobalConfig.all.map { |g| [g.name, g.value].inspect } : 'not defined'}"
puts "InstallationConfig: #{InstallationConfig.all.map { |c| [c.name, c.serialized_value].inspect }}"
