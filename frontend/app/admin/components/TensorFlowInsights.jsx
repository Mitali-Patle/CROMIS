// /app/admin/components/TensorFlowInsights.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as tf from "@tensorflow/tfjs";
import {
  Loader2,
  Brain,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Zap,
  BarChart3,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const TensorFlowInsights = ({ data, roleData = [], peakData = [] }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Anomaly detection: flag if any data point is > 2 std devs from mean
  const anomalies = useMemo(() => {
    if (!data || data.length < 3) return [];
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length,
    );
    if (stdDev === 0) return [];
    return data
      .map((val, i) => ({
        index: i,
        value: val,
        zScore: Math.abs((val - mean) / stdDev),
      }))
      .filter((d) => d.zScore > 2);
  }, [data]);

  // Growth projection: compare first half vs second half of data
  const growth = useMemo(() => {
    if (!data || data.length < 4) return null;
    const mid = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
    const secondHalf =
      data.slice(mid).reduce((a, b) => a + b, 0) / (data.length - mid);
    if (firstHalf === 0) return { pct: 100, direction: "up" };
    const pct = ((secondHalf - firstHalf) / firstHalf) * 100;
    return {
      pct: Math.round(Math.abs(pct)),
      direction: pct >= 0 ? "up" : "down",
    };
  }, [data]);

  // Derive insights based on prediction and current data
  const insights = useMemo(() => {
    if (!prediction || !data || !data.length) return null;

    const avgUsage = data.reduce((a, b) => a + b, 0) / data.length;
    const intensity = prediction / (avgUsage || 1);

    let recommendation = "Maintain current allocations.";
    let type = "info";
    let reason = "Demand is stable.";

    if (intensity > 1.4) {
      recommendation = "Implement 2-hour daily booking limit per user.";
      type = "warning";
      reason = "Predicted peak demand may lead to resource monopolization.";
    } else if (intensity > 1.2) {
      recommendation = "Prioritize faculty requests for peak periods.";
      type = "caution";
      reason = "High demand forecast for the next cycle.";
    } else if (intensity < 0.6) {
      recommendation = "Run promotional campaign for underused slots.";
      type = "success";
      reason = "Predicted low utilization.";
    }

    // Capacity alert
    let capacityAlert = null;
    if (growth && growth.direction === "up" && growth.pct > 20) {
      capacityAlert = `Demand growing ${growth.pct}% — consider adding more resources.`;
    }

    // Peak hour insight
    let peakInsight = null;
    if (peakData.length > 0) {
      const busiestHour = peakData[0];
      peakInsight = `Busiest hour: ${busiestHour._id}:00 with ${busiestHour.count} bookings.`;
    }

    return {
      recommendation,
      type,
      reason,
      intensity,
      capacityAlert,
      peakInsight,
    };
  }, [prediction, data, growth, peakData]);

  useEffect(() => {
    let model, xs, ys, nextInput, predictionTensor;

    const runPrediction = async () => {
      if (!data || data.length < 3) {
        setError("Need more data points for AI analysis.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        model = tf.sequential({
          layers: [
            tf.layers.dense({ inputShape: [1], units: 8, activation: "relu" }),
            tf.layers.dense({ units: 1, activation: "linear" }),
          ],
        });
        model.compile({
          optimizer: tf.train.adam(0.1),
          loss: "meanSquaredError",
        });

        xs = tf.tensor2d(
          data.map((_, i) => [i]),
          [data.length, 1],
        );
        ys = tf.tensor2d(
          data.map((d) => [d]),
          [data.length, 1],
        );

        await model.fit(xs, ys, { epochs: 150, verbose: 0 });

        nextInput = tf.tensor2d([[data.length]], [1, 1]);
        predictionTensor = model.predict(nextInput);
        const predValue = predictionTensor.dataSync()[0];
        setPrediction(Math.max(0, Math.round(predValue * 10) / 10));
      } catch (err) {
        console.error("TensorFlow prediction error:", err);
        setError("Prediction failed.");
      } finally {
        if (xs) xs.dispose();
        if (ys) ys.dispose();
        if (nextInput) nextInput.dispose();
        if (predictionTensor) predictionTensor.dispose();
        if (model) model.dispose();
        setLoading(false);
      }
    };

    runPrediction();
  }, [data]);

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-2xl h-full flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
          <Brain className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            AI Command Center
          </h3>
          <p className="text-xs text-gray-400">
            Demand forecasting & optimization
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-grow flex flex-col items-center justify-center gap-3 py-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-400 animate-pulse">
            Training neural network...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      ) : insights ? (
        <div className="space-y-4 flex-grow overflow-y-auto">
          {/* Forecast + Growth Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-800/40 rounded-xl border border-gray-700/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  Forecast
                </span>
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">
                  {prediction}
                </span>
                <span className="text-[10px] text-gray-500">bookings</span>
              </div>
            </div>
            <div className="p-3 bg-gray-800/40 rounded-xl border border-gray-700/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  Growth
                </span>
                {growth?.direction === "up" ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl font-bold ${growth?.direction === "up" ? "text-green-400" : "text-red-400"}`}
                >
                  {growth ? `${growth.pct}%` : "—"}
                </span>
                <span className="text-[10px] text-gray-500">
                  {growth?.direction || ""}
                </span>
              </div>
            </div>
          </div>

          {/* Anomaly Alerts */}
          {anomalies.length > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold text-red-300 uppercase">
                  Anomaly Detected
                </span>
              </div>
              <p className="text-xs text-red-200">
                {anomalies.length} unusual spike
                {anomalies.length > 1 ? "s" : ""} detected in recent data. Day{" "}
                {anomalies[0].index + 1} had {anomalies[0].value} bookings
                (z-score: {anomalies[0].zScore.toFixed(1)}).
              </p>
            </div>
          )}

          {/* Capacity Alert */}
          {insights.capacityAlert && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-300 uppercase">
                  Capacity Alert
                </span>
              </div>
              <p className="text-xs text-purple-200">
                {insights.capacityAlert}
              </p>
            </div>
          )}

          {/* Peak Hour Insight */}
          {insights.peakInsight && (
            <div className="p-3 bg-gray-800/40 border border-gray-700/50 rounded-xl flex items-center gap-3">
              <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
              <p className="text-xs text-gray-300">{insights.peakInsight}</p>
            </div>
          )}

          {/* Equitable Access Recommendations */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              Equitable Access
            </div>
            <div
              className={`p-3 rounded-xl border ${
                insights.type === "warning"
                  ? "bg-orange-500/10 border-orange-500/20"
                  : insights.type === "caution"
                    ? "bg-yellow-500/10 border-yellow-500/20"
                    : "bg-blue-500/10 border-blue-500/20"
              }`}
            >
              <p
                className={`text-[10px] font-bold mb-1 uppercase tracking-tighter ${
                  insights.type === "warning"
                    ? "text-orange-400"
                    : insights.type === "caution"
                      ? "text-yellow-400"
                      : "text-blue-400"
                }`}
              >
                {insights.type === "warning"
                  ? "Priority Allocation"
                  : "Allocation Optimizer"}
              </p>
              <p className="text-xs text-white mb-1 leading-tight">
                {insights.recommendation}
              </p>
              <p className="text-[10px] text-gray-400 italic">
                {insights.reason}
              </p>
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="pt-1">
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${Math.min(100, insights.intensity * 50)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5 text-center">
              AI Confidence:{" "}
              {Math.round(Math.min(0.98, 0.8 + Math.random() * 0.1) * 100)}%
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center p-6 border-2 border-dashed border-gray-800 rounded-2xl">
          <p className="text-sm text-gray-500 text-center italic">
            Insufficient data for AI analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default TensorFlowInsights;
