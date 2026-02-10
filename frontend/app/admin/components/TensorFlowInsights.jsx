"use client";

import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import { Loader2 } from "lucide-react";


const TensorFlowInsights = ({ data }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let model, xs, ys, nextInput, predictionTensor;

    const runPrediction = async () => {
      if (data.length < 2) {
        setError("Need at least 2 data points for prediction.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Build simple linear model
        model = tf.sequential({
          layers: [
            tf.layers.dense({
              inputShape: [1],
              units: 1,
              activation: "linear",
            }),
          ],
        });
        model.compile({ optimizer: "sgd", loss: "meanSquaredError" });

        // Prepare tensors
        xs = tf.tensor2d(
          data.map((_, i) => [i]),
          [data.length, 1],
        );
        ys = tf.tensor2d(
          data.map((d) => [d]),
          [data.length, 1],
        );

        // Train model
        await model.fit(xs, ys, { epochs: 100 }).then(() => {
          // Predict next value
          nextInput = tf.tensor2d([[data.length]], [1, 1]);
          predictionTensor = model.predict(nextInput);
          const predValue = predictionTensor.dataSync()[0];
          setPrediction(Math.round(predValue * 100) / 100); // Round to 2 decimals
        });
      } catch (err) {
        console.error("TensorFlow prediction error:", err);
        setError("Prediction failed. Check data format.");
      } finally {
        // Cleanup tensors
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
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
      <h3 className="text-lg font-medium mb-4 text-white">
        AI Insights (TensorFlow.js)
      </h3>
      {loading ? (
        <p className="text-gray-300 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Computing prediction...
        </p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : prediction ? (
        <div className="space-y-4">
          <p className="text-gray-300">
            Trend Analysis: Linear regression on usage data.
          </p>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">
              Next Period Prediction:
            </p>
            <p className="text-2xl font-bold text-blue-400">{prediction}</p>
          </div>
          <p className="text-xs text-gray-500">
            Based on {data.length} data points. Check console for details.
          </p>
        </div>
      ) : (
        <p className="text-gray-300">No data available for prediction.</p>
      )}
    </div>
  );
};

export default TensorFlowInsights;