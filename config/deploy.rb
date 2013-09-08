set :stages, ['production', 'dev']
set :default_stage, "dev"
require 'capistrano/ext/multistage'
require 'capistrano_colors'

set :application, "steveshaddick.com"

set :scm, :git
set :repository,  "https://github.com/steveshaddick/steveshaddick.com.git"


set :deploy_via, :remote_cache
set :use_sudo, false
set :keep_releases, 2
set :normalize_asset_timestamps, false

ssh_options[:paranoid] = false
default_run_options[:pty] = true

after "deploy:update", "deploy:cleanup"
after "deploy:restart", "env:update"


namespace :deploy do
	task :cold do
		update
		env:set_all
		data:set_all
	end

	task :restart do
	end

	task :start do
	end

end


namespace :env do

	task :set_all do
		set_php
		set_robots
		update
	end

	task :update do
		run "ln -sfn #{env_dir}/robots.txt #{current_path}/www/robots.txt"
	end

	task :set_php do
		run "mkdir -p #{env_dir}"
		run "echo \"<?php\" > #{env_file}"
		run "echo \"define('ENVIRONMENT', '#{stage}');\" >> #{env_file}"
		run "echo \"define('HOME_PATH', '#{home_path}');\" >> #{env_file}"
		run "echo \"define('VIDEO_PATH', '#{video_path}');\" >> #{env_file}"
		run "echo \"define('MAIN_DB_HOST', '#{db_host}');\" >> #{env_file}"
		run "echo \"define('MAIN_DB_NAME', '#{db_name}');\" >> #{env_file}"
		run "echo \"define('DB_USERNAME', '#{db_user}');\" >> #{env_file}"
		run "echo \"define('DB_PASSWORD', '#{db_password}');\" >> #{env_file}"
		run "echo \"define('SENDGRID_USER', '#{sendgrid_user}');\" >> #{env_file}"
		run "echo \"define('SENDGRID_PASS', '#{sendgrid_password}');\" >> #{env_file}"
		run "echo \"define('GOOGLE_ANALYTICS_UA', '#{google_ua}');\" >> #{env_file}"
		run "echo \"?>\" >> #{env_file}"
	end

	task :set_robots do
		upload("#{local_env_dir}/robots.txt", "#{env_dir}/robots.txt")
	end
end


namespace :data do

	task :set_all do
		backup
		set_schema
		set_data
	end

	task :reset do
		run "mysql -u #{db_user} -p #{db_name} < #{data_dir}/schema.sql" do |channel,stream,data|
			channel.send_data "#{db_password}\n"
		end
	end

	task :update do
		backup
		upload("#{local_data_dir}/data.sql", "#{data_dir}/data.sql")
		#set site on maintenance
		run "mysql -u #{db_user} -p #{db_name} < #{data_dir}/data.sql" do |channel,stream,data|
			channel.send_data "#{db_password}\n"
		end
		run "rm #{data_dir}/data.sql"
		clean_backups
	end

	task :set_schema do
		run "mkdir -p #{data_dir}"
		upload("#{local_data_dir}/schema.sql", "#{data_dir}/schema.sql")
		#set site on maintenance
		run "mysql -u #{db_user} -p #{db_name} < #{data_dir}/schema.sql" do |channel,stream,data|
			channel.send_data "#{db_password}\n"
		end
	end

	task :set_data do
		upload("#{local_data_dir}/data.sql", "#{data_dir}/data.sql")
		#set site on maintenance
		run "mysql -u #{db_user} -p #{db_name} < #{data_dir}/data.sql" do |channel,stream,data|
			channel.send_data "#{db_password}\n"
		end
		run "rm #{data_dir}/data.sql"
	end

	task :backup do
		t = Time.new
		run "mkdir -p #{data_dir}/bu"
		run "mysqldump -u #{db_user} -p#{db_password} #{db_name} > #{data_dir}/bu/"+ t.strftime("%Y%m%d_%H%M%S") + "_#{db_name}.sql"
		download("#{data_dir}/bu/"+ t.strftime("%Y%m%d_%H%M%S") + "_#{db_name}.sql", "#{local_data_dir}/"+ t.strftime("%Y%m%d_%H%M%S") + "_#{db_name}.sql")
	end


	task :clean_backups do
		run "find #{data_dir}/bu/ -type f -mtime +3 -exec rm {} \\;"
	end
end