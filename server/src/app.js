import express from 'express';
import { InvalidChartInput } from './chart.js';
import { createReadingService } from './reading.js';

export function createApp({ generate = null, logger = console } = {}) {
  const app = express();
  app.use(express.json({ limit: '32kb' }));

  const getReading = createReadingService({ generate, logger });

  app.get('/health', (_req, res) => {
    res.json({ ok: true, llmConfigured: Boolean(generate) });
  });

  app.post('/reading', async (req, res) => {
    try {
      const { reading, chart, source, fallbackReason } = await getReading(req.body || {});
      res.json({
        reading,
        source,
        fallbackReason,
        chart: {
          eightCharacters: chart.eightCharacters,
          pillars: chart.pillars,
          elements: chart.elements,
          dayMaster: chart.dayMaster,
          zodiac: chart.zodiac,
          input: chart.input,
          calculationNotes: chart.calculationNotes,
        },
      });
    } catch (err) {
      if (err instanceof InvalidChartInput) {
        return res.status(400).json({ error: err.message, failedStep: err.failedStep });
      }
      logger.error?.('[reading] unexpected error', err);
      res.status(500).json({ error: 'Internal error generating reading.' });
    }
  });

  return app;
}
