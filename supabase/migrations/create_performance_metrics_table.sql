-- Create performance metrics table for Core Web Vitals tracking
-- This table stores Real User Monitoring (RUM) data

CREATE TABLE IF NOT EXISTS performance_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_name VARCHAR(50) NOT NULL,
  value NUMERIC NOT NULL,
  rating VARCHAR(20) CHECK (rating IN ('good', 'needs-improvement', 'poor', 'unknown')),
  url TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id VARCHAR(100),
  user_agent TEXT,
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_url ON performance_metrics(url);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_rating ON performance_metrics(rating);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session ON performance_metrics(session_id);

-- Create composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_performance_metrics_composite 
  ON performance_metrics(metric_name, url, timestamp DESC);

-- Add comments for documentation
COMMENT ON TABLE performance_metrics IS 'Stores Core Web Vitals and performance metrics for Real User Monitoring';
COMMENT ON COLUMN performance_metrics.metric_name IS 'Type of metric: LCP, FID, CLS, TTFB, PageLoad, etc.';
COMMENT ON COLUMN performance_metrics.value IS 'Metric value in milliseconds or ratio';
COMMENT ON COLUMN performance_metrics.rating IS 'Performance rating based on Google thresholds';
COMMENT ON COLUMN performance_metrics.url IS 'Page URL where metric was measured';
COMMENT ON COLUMN performance_metrics.session_id IS 'Unique session identifier for grouping user experience';
COMMENT ON COLUMN performance_metrics.additional_data IS 'Extra metric data like navigation type, connection type, etc.';

-- Create a view for easy performance analytics
CREATE OR REPLACE VIEW performance_summary AS
SELECT 
  metric_name,
  url,
  COUNT(*) as measurement_count,
  AVG(value) as avg_value,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median_value,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75_value,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95_value,
  COUNT(CASE WHEN rating = 'good' THEN 1 END) * 100.0 / COUNT(*) as good_percentage,
  COUNT(CASE WHEN rating = 'needs-improvement' THEN 1 END) * 100.0 / COUNT(*) as needs_improvement_percentage,
  COUNT(CASE WHEN rating = 'poor' THEN 1 END) * 100.0 / COUNT(*) as poor_percentage,
  MIN(timestamp) as first_measurement,
  MAX(timestamp) as last_measurement
FROM performance_metrics
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY metric_name, url
ORDER BY metric_name, avg_value DESC;

COMMENT ON VIEW performance_summary IS 'Performance metrics summary for the last 30 days with key statistics';

-- Optional: Create RLS (Row Level Security) policies if needed
-- ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create a function to clean up old performance data (optional)
CREATE OR REPLACE FUNCTION cleanup_old_performance_metrics()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete metrics older than 90 days
  DELETE FROM performance_metrics 
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_performance_metrics() IS 'Cleans up performance metrics older than 90 days. Returns count of deleted records.';

-- You can set up a cron job to run this function periodically:
-- SELECT cron.schedule('cleanup-performance-metrics', '0 2 * * 0', 'SELECT cleanup_old_performance_metrics();');