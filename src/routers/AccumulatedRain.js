const { Router } = require('express');
const accumulatedRainService = require('../services/AccumulatedRainService');

const router = Router();

router.get('/rain', (req, res) => {
  let device_id = req.query.device_id;
  let beginning_hour = Number(req.query.beginning_hour);
  let n_days_before_daily = Number(req.query.n_days_before_daily);
  let n_days_before_hourly = Number(req.query.n_days_before_hourly);

  let dojot_host = req.query.dojot_host;
  let jwt = req.query.authorization || req.query.Authorization || req.get('authorization');

  accumulatedRainService.accumulatedRain(dojot_host, jwt, device_id, beginning_hour, n_days_before_daily, n_days_before_hourly)
    .then((data) => {
      let result = {
        accumulatedRain: data
      }
      res.send(result);
    })
    .catch((err) => {
      res.status(400).send({ message: err.response.data });
    });
});

module.exports = router;
