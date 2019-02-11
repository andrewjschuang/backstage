const { Router } = require('express');
const accumulatedRainService = require('../services/AccumulatedRainService');

const router = Router();

router.get('/rain', (req, res) => {
  accumulatedRainService.accumulatedRain(req.query.jwt, req.query.device_id, req.query.start_of_day, req.query.num_days)
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
