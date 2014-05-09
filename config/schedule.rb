# Use this file to easily define all of your cron jobs.
#
# Example:
#
# set :output, "/path/to/my/cron_log.log"
#
# every 2.hours do
#   command "/usr/bin/some_great_command"
#   runner "MyModel.some_method"
#   rake "some:great:rake:task"
# end
#
#
# every 4.days do
#   runner "AnotherModel.prune_old_records"
# end

# Learn more: http://github.com/javan/whenever

every 1.minutes do
  command "cd /project/qtd/myfork/ && bundle exec rake searchkick:reindex CLASS='Quest'"
  command "cd /project/qtd/myfork/ && bundle exec rake searchkick:reindex CLASS='Record'"
  command "cd /project/qtd/myfork/ && bundle exec rake searchkick:reindex CLASS='User'"
end