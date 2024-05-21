import mongoose from "mongoose";

export const iopoolAccountScheme = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  timestamp: Date,
  api_key: String,
  title: String,
  iopool_id: String,
  app_key: String,
  minerKey: String,
  latestMeasure: {
    temperature: Number,
    ph: Number,
    orp: Number,
    mode: String,
    isValid: Boolean,
    ecoId: String,
    measuredAt: String,
  },
  metadata: {
    data_type: String,
  },
});

// Define a schema for storing historical data
export const measurementTimeSeriesSchema = new mongoose.Schema({
    temperature: Number,
    ph: Number,
    orp: Number,
    mode: String,
    isValid: Boolean,
    ecoId: String,
    measuredAt: String,
    metadata: {
      data_type: String,
      iopool_id: String,
    },
  timestamp: { type: Date, default: Date.now }
});

export interface iopoolAccount extends mongoose.Document {
  user_id: mongoose.Schema.Types.ObjectId | String;
  timestamp: Date;
  api_key: String;
  title: String;
  iopool_id: String;
  app_key: String;
  latestMeasure: {
    temperature: Number;
    ph: Number;
    orp: Number;
    mode: String;
    isValid: Boolean;
    ecoId: String;
    measuredAt: String;
  };
  metadata: {
    data_type: string;
  }
}

// Define the model for current data
export const IopoolAccountModel = mongoose.model<iopoolAccount>(
  "iopool_accounts",
  iopoolAccountScheme
);

// Define the model for historical data
export const MeasurementTimeSeriesModel = mongoose.model(
  "water",
  measurementTimeSeriesSchema
);
