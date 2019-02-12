const { Router } = require('express');
const accumulatedRainService = require('../services/AccumulatedRainService');

const router = Router();

router.get('/rain', (req, res) => {
  let jwt = req.query.jwt;
  let device_id = req.query.device_id;
  let beginning_hour = Number(req.query.beginning_hour);
  let num_days = Number(req.query.num_days);

  accumulatedRainService.accumulatedRain(jwt, device_id, beginning_hour, num_days)
    .then((data) => {
      let result = {
        accumulatedRain: data
      }
      res.send(result);
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

module.exports = router;
