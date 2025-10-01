const cron = require('node-cron');
const config = require('../config');
const logger = require('../config/logger');

class CronJobManager {
  constructor() {
    this.jobs = new Map();
    this.isEnabled = config.cron.enabled;
  }

  // Add a new cron job
  addJob(name, schedule, task, options = {}) {
    if (!this.isEnabled) {
      logger.info(`Cron jobs are disabled. Skipping job: ${name}`);
      return;
    }

    if (this.jobs.has(name)) {
      logger.warn(`Cron job ${name} already exists. Replacing...`);
      this.removeJob(name);
    }

    const job = cron.schedule(schedule, async () => {
      const startTime = Date.now();
      logger.info(`Starting cron job: ${name}`);
      
      try {
        await task();
        const duration = Date.now() - startTime;
        logger.info(`Completed cron job: ${name} in ${duration}ms`);
      } catch (error) {
        logger.error(`Error in cron job ${name}:`, error);
      }
    }, {
      scheduled: false,
      timezone: config.cron.timezone,
      ...options
    });

    this.jobs.set(name, {
      job,
      schedule,
      task,
      options,
      createdAt: new Date().toISOString()
    });

    logger.info(`Added cron job: ${name} with schedule: ${schedule}`);
    return job;
  }

  // Remove a cron job
  removeJob(name) {
    if (this.jobs.has(name)) {
      const jobData = this.jobs.get(name);
      jobData.job.stop();
      jobData.job.destroy();
      this.jobs.delete(name);
      logger.info(`Removed cron job: ${name}`);
      return true;
    }
    return false;
  }

  // Start a specific job
  startJob(name) {
    if (this.jobs.has(name)) {
      const jobData = this.jobs.get(name);
      jobData.job.start();
      logger.info(`Started cron job: ${name}`);
      return true;
    }
    logger.warn(`Cron job ${name} not found`);
    return false;
  }

  // Stop a specific job
  stopJob(name) {
    if (this.jobs.has(name)) {
      const jobData = this.jobs.get(name);
      jobData.job.stop();
      logger.info(`Stopped cron job: ${name}`);
      return true;
    }
    logger.warn(`Cron job ${name} not found`);
    return false;
  }

  // Start all jobs
  startAll() {
    if (!this.isEnabled) {
      logger.info('Cron jobs are disabled');
      return;
    }

    for (const [name, jobData] of this.jobs) {
      jobData.job.start();
      logger.info(`Started cron job: ${name}`);
    }
    logger.info(`Started ${this.jobs.size} cron jobs`);
  }

  // Stop all jobs
  stopAll() {
    for (const [name, jobData] of this.jobs) {
      jobData.job.stop();
      logger.info(`Stopped cron job: ${name}`);
    }
    logger.info(`Stopped ${this.jobs.size} cron jobs`);
  }

  // Get job status
  getJobStatus(name) {
    if (this.jobs.has(name)) {
      const jobData = this.jobs.get(name);
      return {
        name,
        schedule: jobData.schedule,
        running: jobData.job.running,
        createdAt: jobData.createdAt
      };
    }
    return null;
  }

  // Get all jobs status
  getAllJobsStatus() {
    const status = [];
    for (const [name, jobData] of this.jobs) {
      status.push({
        name,
        schedule: jobData.schedule,
        running: jobData.job.running,
        createdAt: jobData.createdAt
      });
    }
    return status;
  }

  // Check if job exists
  hasJob(name) {
    return this.jobs.has(name);
  }

  // Get job count
  getJobCount() {
    return this.jobs.size;
  }

  // Validate cron expression
  isValidCronExpression(expression) {
    return cron.validate(expression);
  }

  // Enable/disable cron jobs
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (enabled) {
      this.startAll();
      logger.info('Cron jobs enabled');
    } else {
      this.stopAll();
      logger.info('Cron jobs disabled');
    }
  }
}

module.exports = new CronJobManager();