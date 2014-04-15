# Controller for the group page
class GroupsController < ApplicationController
  power :crud => :groups

  # Display a list of all groups for the current user
  def index
    @member_groups = @user.groups_where_member
    @admin_groups = @user.groups_where_admin
  end

  # Display the group page for the specified group, presuming the user has
  # access rights granted to them.
  def show
    @group = Group.find(params[:id])
    redirect_to groups_path, :flash => { :warning =>"Permission Denied"}\
      unless current_power.group? @group
  end

  def new
    @group = Group.new()
  end

  def leave
    @group = Group.find(params[:id])
    @group.leave
  end

  def join
    #NOTIFICATION NEEDED
  end

  def invite_user
    @group = Group.find(params[:id])
    user = User.find( params[:user_id] )
    if ! @group.users.include? user
      @group.users.push user
    end
    respond_to do |format|
      format.html { redirect_to group_path(@group), :flash => { :success =>'Member added successfully.' }}
    end
  end

  def accept_user
    #NOTIFICATION NEEDED
  end

  private

  def group
    @group ||= Group.find(params[:id])
  end
end
