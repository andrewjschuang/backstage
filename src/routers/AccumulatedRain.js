const { Router } = require('express');
const accumulatedRainService = require('../services/AccumulatedRainService');

const router = Router();

router.get('/rain', (req, res) => {
  accumulatedRainService.accumulatedRain(req.query.jwt, req.query.device_id, req.query.dateFrom, req.query.dateTo)
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
