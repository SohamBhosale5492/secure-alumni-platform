const express = require("express");
const SecurityLog = require("../models/SecurityLog");
const SecurityAlert = require("../models/SecurityAlert");
const BlockedIP = require("../models/BlockedIP");
const { unblockIp } = require("../detection-engine/ipBlocking");
const { createAlert } = require("../alert-system/alertService");

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function securityDashboardRoutes(options = {}) {
  const router = express.Router();
  const UserModel = options.userModel;

  router.get("/stats", async (req, res, next) => {
    try {
      const sinceToday = startOfDay();

      const [
        totalUsers,
        failedLogins,
        blockedIps,
        activeThreats,
        totalAlerts,
        dangerousUploads
      ] = await Promise.all([
        UserModel ? UserModel.countDocuments() : Promise.resolve(0),
        SecurityLog.countDocuments({ status: "FAILED_LOGIN", createdAt: { $gte: sinceToday } }),
        BlockedIP.countDocuments({ blockedUntil: { $gt: new Date() } }),
        SecurityAlert.countDocuments({
          acknowledged: false,
          severity: { $in: ["High", "Severe", "Critical"] }
        }),
        SecurityAlert.countDocuments(),
        SecurityLog.countDocuments({ status: "DANGEROUS_UPLOAD", createdAt: { $gte: sinceToday } })
      ]);

      res.json({
        totalUsers,
        failedLogins,
        blockedIps,
        activeThreats,
        totalAlerts,
        dangerousUploads
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/logs", async (req, res, next) => {
    try {
      const logs = await SecurityLog.find()
        .sort({ createdAt: -1 })
        .limit(Number(req.query.limit) || 100)
        .lean();

      res.json(logs);
    } catch (error) {
      next(error);
    }
  });

  router.get("/alerts", async (req, res, next) => {
    try {
      const alerts = await SecurityAlert.find()
        .sort({ createdAt: -1 })
        .limit(Number(req.query.limit) || 100)
        .lean();

      res.json(alerts);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/alerts/:id/acknowledge", async (req, res, next) => {
    try {
      const alert = await SecurityAlert.findByIdAndUpdate(
        req.params.id,
        { acknowledged: true },
        { new: true }
      );

      res.json(alert);
    } catch (error) {
      next(error);
    }
  });

  router.get("/blocked-ips", async (req, res, next) => {
    try {
      const blockedIps = await BlockedIP.find()
        .sort({ blockedUntil: -1 })
        .limit(Number(req.query.limit) || 100)
        .lean();

      res.json(blockedIps);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/blocked-ips/:ip", async (req, res, next) => {
    try {
      await unblockIp(req.params.ip);
      res.json({ message: "IP unblocked." });
    } catch (error) {
      next(error);
    }
  });

  router.get("/charts/threats", async (req, res, next) => {
    try {
      const trends = await SecurityLog.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              status: "$status"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.day": 1 } }
      ]);

      const distribution = await SecurityAlert.aggregate([
        {
          $group: {
            _id: "$severity",
            count: { $sum: 1 }
          }
        }
      ]);

      const requestFrequency = await SecurityLog.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              minute: { $dateToString: { format: "%H:%M", date: "$createdAt" } }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.minute": 1 } }
      ]);

      res.json({
        trends,
        distribution,
        requestFrequency
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/simulate-alert", async (req, res, next) => {
    try {
      const alert = await createAlert({
        type: req.body.type || "Brute Force Attack",
        severity: req.body.severity || "High",
        message: req.body.message || "Demo suspicious activity generated from dashboard.",
        actionTaken: req.body.actionTaken || "Logged and monitored",
        ip: req.body.ip || "127.0.0.1",
        metadata: {
          simulated: true
        }
      });

      res.status(201).json(alert);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  securityDashboardRoutes
};
