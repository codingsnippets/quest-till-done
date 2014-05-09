# Controller for the group page
class GroupsController < ApplicationController
  power :crud => :groups

  include JsonGenerator::TimelineModule
  include RoundHelper

  # Display a list of all groups for the current user
  def index
    @member_groups = @user.groups_where_member
    @admin_groups = @user.groups_where_admin
  end

  # Display the group page for the specified group, presuming the user has
  # access rights granted to them.
  def show
    @group = Group.find(params[:id])
    redirect_to groups_path, :flash => {:warning => "Permission Denied"}\
    unless current_power.group? @group
  end

  def group_params
    params.require(:group).permit(:id, :name)
  end

  def new
    @group = Group.new()
  end

  def create
    @group = Group.new(group_params)
    respond_to do |format|
      if @group.save
        @group.admins.push @user
        @group.users.push @user
        format.html { redirect_to group_path(@group), notice: 'Group was successfully created.' }
        format.json { render action: 'show', status: :created, location: @quest.campaign }
        # send notification
        @user.send_message(@user, 'You created a new group! Start adding members from your group page!', 'New Group Created')
      else
        format.html { render action: 'new' }
        format.json { render json: @group.errors, status: :unprocessable_entity }
      end
    end
  end

  def leave
    @group = Group.find(params[:id])
    @group.leave @user
    respond_to do |format|
      format.html { redirect_to groups_path, :flash => {:success => "Left group #{@group.name}"} }
      # send notification
      # send to user
      @user.send_message(@user, "You left from group #{@group.name}!", "You left group #{@group.name}")
      # send to group admin
      @group.admins.each do |admin_user|
        @user.send_message(admin_user, "Your group member #{@user.username} with email #{@user.email} has left your group, please reassign their tasks", 'You Left A Group')
      end
    end

  end

  def kick
    @group = Group.find(params[:id])
    @target = User.find(params[:user_id])
    @group.leave @target unless @group.admins.include? @target
    respond_to do |format|
      format.html { redirect_to group_path(@group), :flash => {:success => "Removed member #{@target.username}"} }
      # send notification
      @user.send(@target, "You have been kick from group #{@group.name}. <br> You no longer have access to #{@group.name}", 'You Have Been Kicked')
    end
  end

  def promote
    @group = Group.find(params[:id])
    @target = User.find(params[:user_id])
    @target.promote_in_group @group
    respond_to do |format|
      format.html { redirect_to group_path(@group), :flash => {:success => "Promoted member #{@target.username}"} }
      @user.send_message(@target, "You have been promoted in group #{@group.name}. Check you new privileges at group #{@group.name}", 'You Have Been Promoted')
    end
  end

  def demote
    @group = Group.find(params[:id])
    @target = User.find(params[:user_id])
    @group.demote @target
    respond_to do |format|
      format.html { redirect_to group_path(@group), :flash => {:success => "Demoted member #{@target.username}"} }
      @user.send_message(@target, "You have been demoted from group: #{@group.name}. Your privileges have been demoted by yourself", 'You Have Been Demoted')
    end
  end

  def join
    #NOTIFICATION NEEDED
  end

  def invite_user
    @group = Group.find(params[:id])
    user = User.find(params[:user_id])


    unless !!Groupinvitations.where("user_id=? AND group_id=?", user.id, group.id)
      invitation = Groupinvitations.create({
                                               group_id: @group.id,
                                               user_id: user.id,
                                               accept: false,
                                               created_at: Time.now,
                                               expired: false
                                           })

      #notification
      @user.send_message(user, "You are asked to join the group #{@group.name}, are you willing to join? <br> <a href='#{::Rails.root/group_path}'>Accept</a> <a href='#'>Reject</a> ", 'Group Invitation')

      respond_to do |format|
        format.html { redirect_to group_path(@group), :flash => {:success => 'Member invitation has been sent successfully, wait for user to response.'} }
      end
    else
      respond_to do |format|
        format.html { redirect_to group_path(@group), :flash => {:failure => 'You have already sent invitation please wait till user respond.'} }
      end
    end


    #no direct add member anymore
    # if ! @group.users.include? user
    #   @group.users.push user
    # end

  end

  def accept_user
    #NOTIFICATION NEEDED
  end

  def timeline
    @group = Group.find(params[:id])
    render :text => generateTimeline(@group.rounds.limit(100))
  end

  def confirm_invite
    Groupinvitations.find_by_user_id(params[:user_id]).where("expired = ? AND group_id = ?", false, params[:group_id])
  end

  private

  def group
    @group ||= Group.find(params[:id])
  end


end
