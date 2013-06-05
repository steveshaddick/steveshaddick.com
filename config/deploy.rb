set :stages, ['production', 'dev']
set :default_stage, "dev"
require 'capistrano/ext/multistage'
# require 'capistrano_colors'

set :application, "steveshaddick.com"

set :scm, :git
set :repository,  "https://github.com/steveshaddick/steveshaddick.com.git"


set :deploy_via, :remote_cache
set :use_sudo, false

ssh_options[:paranoid] = false
default_run_options[:pty] = true

after "deploy:restart", "env:update"


namespace :deploy do
	task :cold do
		update
		env:set_all
	end

	task :restart do
	end

	task :start do
	end

end

namespace :env do
	
	task :set_all do
		set_php
		set_htaccess
		set_robots
		update
	end

	task :update do
		run "ln -sfn #{env_dir}/.htaccess #{current_path}/www/.htaccess"
		run "ln -sfn #{env_dir}/robots.txt #{current_path}/www/robots.txt"
	end

	task :set_php do
		run "mkdir -p #{env_dir}"
		run "echo \"<?php\" > #{env_file}"
		run "echo \"define('MAIN_DB_HOST', '#{db_host}');\" >> #{env_file}"
		run "echo \"define('MAIN_DB_NAME', '#{db_name}');\" >> #{env_file}"
		run "echo \"define('DB_USERNAME', '#{db_user}');\" >> #{env_file}"
		run "echo \"define('DB_PASSWORD', '#{db_password}');\" >> #{env_file}"
		run "echo \"define('SENDGRID_USER', '#{sendgrid_user}');\" >> #{env_file}"
		run "echo \"define('SENDGRID_PASS', '#{sendgrid_password}');\" >> #{env_file}"
		run "echo \"define('GOOGLE_ANALYTICS_UA', '#{google_ua}');\" >> #{env_file}"
		run "echo \"?>\" >> #{env_file}"
	end

	task :set_htaccess do
		upload("#{local_env_dir}/.htaccess", "#{env_dir}/.htaccess")
		if stage == 'dev'
			upload("#{local_env_dir}/.htpasswd", "#{env_dir}/.htpasswd")
		end
	end

	task :set_robots do
		upload("#{local_env_dir}/robots.txt", "#{env_dir}/robots.txt")
	end
end