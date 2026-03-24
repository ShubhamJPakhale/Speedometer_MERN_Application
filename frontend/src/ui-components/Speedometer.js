import React from "react";
import "./Speedometer.css";

const Speedometer = ({ speed }) => {
  const clampedSpeed = Math.max(0, Math.min(speed, 200));
  const maxSpeed = 200;

  // Calculate angle: -135 degrees (7:30 position) to 135 degrees (4:30 position)
  // This creates a 270-degree arc
  const angle = (-135 + (clampedSpeed / maxSpeed) * 270) * (Math.PI / 180);

  // Center of the speedometer
  const cx = 150;
  const cy = 150;
  const needleLength = 100;

  // Calculate needle end point
  const needleX = cx + needleLength * Math.cos(angle);
  const needleY = cy + needleLength * Math.sin(angle);

  return (
    <div className="speedometer-container">
      <svg
        className="speedometer-svg"
        width="400"
        height="300"
        viewBox="0 0 300 280"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle
          cx="150"
          cy="150"
          r="140"
          fill="#f8f9fa"
          stroke="#333"
          strokeWidth="2"
        />

        {/* Speed range zones */}
        <circle
          cx="150"
          cy="150"
          r="120"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="1"
          strokeDasharray="5,5"
        />

        <g id="speedometer-markings">
          {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map(
            (label, idx) => {
              const markAngle = (-135 + idx * 27) * (Math.PI / 180);
              const outerRadius = 120;
              const innerRadius = 105;
              const outerX = 150 + outerRadius * Math.cos(markAngle);
              const outerY = 150 + outerRadius * Math.sin(markAngle);
              const innerX = 150 + innerRadius * Math.cos(markAngle);
              const innerY = 150 + innerRadius * Math.sin(markAngle);
              const labelRadius = 85;
              const labelX = 150 + labelRadius * Math.cos(markAngle);
              const labelY = 150 + labelRadius * Math.sin(markAngle);

              return (
                <g key={`marking-${idx}`}>
                  <line
                    x1={innerX}
                    y1={innerY}
                    x2={outerX}
                    y2={outerY}
                    stroke="#333"
                    strokeWidth="2"
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#333"
                  >
                    {label}
                  </text>
                </g>
              );
            },
          )}
        </g>

        <g id="needle-group">
          <polygon
            points={`${cx},${cy - 8} ${needleX},${needleY} ${cx},${cy + 8}`}
            fill="#e74c3c"
            stroke="#c0392b"
            strokeWidth="1"
          />
        </g>

        {/* Center circle */}
        <circle
          cx="150"
          cy="150"
          r="15"
          fill="#333"
          stroke="#000"
          strokeWidth="2"
        />
        <circle cx="150" cy="150" r="10" fill="#e74c3c" />
      </svg>

      <div className="speed-display">
        <div className="speed-value">{Math.round(clampedSpeed)}</div>
        <div className="speed-unit">km/h</div>
      </div>

      <div className="speed-status">
        {clampedSpeed <= 100 && (
          <span className="status-safe">✓ Normal Speed</span>
        )}
        {clampedSpeed > 100 && clampedSpeed <= 150 && (
          <span className="status-warning">⚠ Warning: High Speed</span>
        )}
        {clampedSpeed > 150 && (
          <span className="status-danger">⚠ Danger: Very High Speed</span>
        )}
      </div>
    </div>
  );
};

export default Speedometer;
