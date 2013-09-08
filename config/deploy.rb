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
after "deploy:restart", "deploy:save_build"
before "deploy:restart", "env:link"


namespace :deploy do
	task :cold do
		setup
		update
		env:upload
	end

	task :static do
	end

	task :restart do
		sudo "uwsgi --reload #{pidfile}"
	end

	task :start do
		sudo "uwsgi --reload #{pidfile}"
	end

	task :save_build do
		top.upload("config/", "#{project_dir}bu/build/config/", { :recursive=>true, :via=>:scp } )
		top.upload("Capfile", "#{project_dir}bu/build/Capfile", { :via=>:scp } )
		top.upload("Gruntfile.js", "#{project_dir}bu/build/Gruntfile.js", { :via=>:scp } )
		top.upload("package.json", "#{project_dir}bu/build/package.json", { :via=>:scp } )
	end

end

namespace :env do
	
	task :reset do
		upload
		link
	end

	task :write do
		text = File.read("#{settings_template}")
		output = text.gsub(/_ENVIRONMENT_/, "#{stage}")
		output = output.gsub(/_DEBUG_/, "#{is_debug}")
		output = output.gsub(/_ALLOWED_HOST_/, "#{host}")
		output = output.gsub(/_DB_ENGINE_/, "#{db_engine}")
		output = output.gsub(/_DB_NAME_/, "#{db_name}")
		output = output.gsub(/_DB_USER_/, "#{db_user}")
		output = output.gsub(/_DB_PASSWORD_/, "#{db_password}")
		output = output.gsub(/_SENDGRID_USER_/, "#{sendgrid_user}")
		output = output.gsub(/_SENDGRID_PASSWORD_/, "#{sendgrid_password}")
		output = output.gsub(/_GOOGLE_UA_/, "#{google_ua}")
		output = output.gsub(/_SECRET_KEY_/, "#{django_secret_key}")
		File.open("#{settings_file}", "w") {|file| file.puts output}
	end

	task :upload do
		top.upload("#{settings_file}", "#{shared_path}/settings/env.py")
	end

	task :link do
		run "ln -nfs #{shared_path}/settings/env.py #{current_path}/#{local_settings_dir}/env.py"
	end

end



namespace :data do

	task :reset do
		backup
		upload("#{local_data_dir}/data.sql", "#{data_dir}/data.sql")
		#set site on maintenance
		run "mysql -u #{db_user} -p #{db_name} < #{data_dir}/data.sql" do |channel,stream,data|
			channel.send_data "#{db_password}\n"
		end
		run "rm #{data_dir}/data.sql"
		clean_backups
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