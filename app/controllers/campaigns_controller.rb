# Controller for Campaign
class CampaignsController < ApplicationController

  require 'json_generator'
  include JsonGenerator::QuestModule
  include JsonGenerator::EncounterModule
  include RoundHelper

  helper_method :campaign_timeline_path

  # Show all of user's campaigns
  # @return [Html] the index page for all campaign
  def index
    @campaigns = Campaign.where( :user_id =>  current_user.id)
  end

  # Show the detail of a campaign
  # @param id [Integer] Campaign's id
  # @return [Html] the campaign detail with that id
  def show
    @campaign = Campaign.friendly.find(params[:id])
    #reverse history but direct to new

    if request.path != campaign_path(@campaign)
      redirect_to @campaign, status: :moved_permanently
    end
  end
  # Create new campaign
  # @return [Html] New campaign page
  def new
    @campaign = Campaign.new()
  end

  # Get Json for generating tree view
  # @param id [Integer] Campaign's id
  # @return [JSON] campaign's information in JSON format
  def getTree
    campaign = Campaign.find(params[:id])
    render :text => generateCampaignTree(campaign)
  end

  # Save new campaign
  # @param campaign_params [campaign_params] field input from creation page
  # @return [Html] redirect back to the new campaign page
  def create
    @campaign = Campaign.new(campaign_params)
    @campaign.user = current_user

    respond_to do |format|
      if @campaign.save
        create_round(@campaign, action_name, @campaign)
        format.html { redirect_to @campaign, notice: 'Campaign was successfully started.', location: campaigns_path(@campaign) }
        format.json { render action: 'show', status: :created, location: @campaign }
      else
        format.html { render action: 'new'}
        format.json { render json: @campaign.errors, status: :unprocessable_entity }
      end
    end
  end

  # Edit existing campaign
  # @param id [Integer] Campaign's id
  # @return [Html] Campaign editing page
  def edit
    @campaign = Campaign.friendly.find(params[:id])
  end

  # Update campaign changes and save the changes
  # @param campaign_params [campaign_params] field input from creation page
  # @return [Html] redirect back to campaigns index page
  def update
    @campaign = Campaign.friendly.find(params[:id])
    respond_to do |format|
      if @campaign.update(campaign_params)
        create_round(@campaign, action_name, @campaign)
        format.html { redirect_to @campaign, notice: 'Campaign was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render campaign: 'edit' }
        format.json { render json: @campaign.errors, status: :unprocessable_entity }
      end
    end
  end

  # Delete campaigns and all the quests and records it associated with
  # @param id [Integer] Campaign's id
  # @return [Html] redirect back to campaigns index page
  def destroy
    @campaign = Campaign.friendly.find{ params[:id]}
    create_round(@campaign, action_name, @campaign)
    @campaign.destroy
    respond_to do |format|
      format.html { redirect_to campaigns_path }
      format.json { head :no_content }
    end
  end

  # View timeline
  # @param id [Integer] Campaign'id to be viewed
  # @return [Html] partial view of the timeline
  def timeline
    @campaign = Campaign.friendly.find(params[:id])
  end

  # Get the current timeline for the campaign
  # @param campaign [Campaign] Campaign
  # @return [JSON] JSON of the timeline details
  def get_campaign_timeline
    @encounters = Encounter.where(:user_id => current_user.id)
    render :text => generateTree(@encounters, params[:id])
  end

  # Import a QTD specific format Campaign to generate a campaign
  # @param path [String] file path
  def import
    encounter = Encounter.new
    encounter.rounds = Encounter.where(:user_id => current_user.id, :campaign_id => params[:id])

  end

  # Export a Campaign to a QTD specific format
  # @param id [Integer] Campaign's id
  # @param type [String] File format to be exported
  # @return [File] downloadable file
  def export

  end

  # custom helper path for timeline
  # @param id [Integer] Campaign
  def campaign_timeline_path(campaign)
    "/campaigns/timeline?id=#{campaign.id}"
  end

  # Define allowed parameter for a Campaign model
  # @param description [String] Campaign's description
  # @param name [String] Campaign's name
  def campaign_params
    params.require(:campaign).permit(:description, :name)
  end
end
