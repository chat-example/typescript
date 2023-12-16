import channelGroupService from "../services/channelGroup.service";
import logger from "../../utils/logger";

class ChannelGroupController {
  logger;
  channelGroupService;

  constructor({ channelGroupService,logger }) {
    this.channelGroupService = channelGroupService;
    this.logger = logger
  }

  async list(req, res, next) {
    try {
      this.logger.info(`[channel group / list] list start`);
      const { serverId } = req.params;
      const channelGroups = await this.channelGroupService.list({ serverId });

      res.status(StatusCodes.OK).json(channelGroups);
    } catch (error) {
      this.logger.error(error);
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.logger.info(`[channel group / create] create start]`);
      const { serverId } = req.params;
      const channelGroup = await this.channelGroupService.create({ serverId, channelGroup: req.body });

      res.status(StatusCodes.CREATED).json(channelGroup);
    } catch (error) {
      this.logger.error(error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      this.logger.info(`[channel group / update] update start`);
      const { serverId } = req.params;
      const channelGroup = await this.channelGroupService.update({ serverId, channelGroup: req.body });

      res.status(StatusCodes.OK).json(channelGroup);
    } catch (error) {
      this.logger.error(error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.logger.info(`[channel group / delete] delete start`);
      const { channelId } = req.params;
      await this.channelGroupService.delete({ channelGroup: {id: channelId} });

      res.status(StatusCodes.NO_CONTENT).send(ReasonPhrases.NO_CONTENT);
    } catch (error) {
      this.logger.error(error);
      next(error);
    }
  }
}

const channelGroupController = new ChannelGroupController({
  channelGroupService,
  logger,
});

export default channelGroupController;