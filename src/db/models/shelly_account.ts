import mongoose, { Document, Schema } from "mongoose";

// Define TypeScript interfaces
interface Sys {
    available_updates: {
        stable: {
            version: string;
        };
    };
    mac: string;
    restart_required: boolean;
    time: string;
    unixtime: number;
    uptime: number;
    ram_size: number;
    ram_free: number;
    fs_size: number;
    fs_free: number;
    cfg_rev: number;
    kvs_rev: number;
    schedule_rev: number;
    webhook_rev: number;
    reset_reason: number;
}

interface DeviceStatus {
    id: string;
    _updated: string;
    serial: number;
    sys: Sys;
    cloud: {
        connected: boolean;
    };
    wifi: {
        sta_ip: string;
        status: string;
        ssid: string;
        rssi: number;
    };
    mqtt: {
        connected: boolean;
    };
    ble: any[];
    ws: {
        connected: boolean;
    };
    "switch:0": {
        id: number;
        aenergy: {
            by_minute: any[];
            minute_ts: number;
            total: number;
        };
        source: string;
        output: boolean;
        apower: number;
        voltage: number;
        current: number;
        temperature: {
            tC: number;
            tF: number;
        };
    };
    code: string;
}

interface ShellyAccount {
    walletaddress: string;
    serverUrl: string;
    deviceId: string;
    authKey: string;
    minerKey:string;
    data: {
        isok: boolean;
        device_status: DeviceStatus;
    };
    status?: string;
    metadata: {
        data_type: string;
    };
}

interface ShellyDocument extends Document, ShellyAccount {}

interface HistoricalData {
    device_status: DeviceStatus;
    timestamp: Date;
    metadata: {
        data_type: string;
        deviceId: string;
    };
}

interface HistoricalDataDocument extends Document, HistoricalData {}

// Define Mongoose schemas
const sysSchema = new Schema<Sys>({
    available_updates: {
        stable: {
            version: { type: String }
        }
    },
    mac: { type: String },
    restart_required: { type: Boolean },
    time: { type: String },
    unixtime: { type: Number },
    uptime: { type: Number },
    ram_size: { type: Number },
    ram_free: { type: Number },
    fs_size: { type: Number },
    fs_free: { type: Number },
    cfg_rev: { type: Number },
    kvs_rev: { type: Number },
    schedule_rev: { type: Number },
    webhook_rev: { type: Number },
    reset_reason: { type: Number }
});

const deviceStatusSchema = new Schema<DeviceStatus>({
    id: { type: String },
    _updated: { type: String },
    serial: { type: Number },
    sys: { type: sysSchema },
    cloud: {
        connected: { type: Boolean }
    },
    wifi: {
        sta_ip: { type: String },
        status: { type: String },
        ssid: { type: String },
        rssi: { type: Number }
    },
    mqtt: {
        connected: { type: Boolean }
    },
    ble: [Schema.Types.Mixed],
    ws: {
        connected: { type: Boolean }
    },
    "switch:0": {
        id: { type: Number },
        aenergy: {
            by_minute: [Schema.Types.Mixed],
            minute_ts: { type: Number },
            total: { type: Number }
        },
        source: { type: String },
        output: { type: Boolean },
        apower: { type: Number },
        voltage: { type: Number },
        current: { type: Number },
        temperature: {
            tC: { type: Number },
            tF: { type: Number }
        }
    },
    code: { type: String }
});

const shellyAccountSchema = new Schema<ShellyAccount>({
    walletaddress: { type: String },
    serverUrl: { type: String },
    deviceId: { type: String },
    authKey: { type: String },
    minerKey: { type: String },
    data: {
        isok: { type: Boolean },
        device_status: { type: deviceStatusSchema }
    },
    status: { type: String },
    metadata: {
        data_type: { type: String }
    }
});

const historicalDataSchema = new Schema<HistoricalData>({
    device_status: { type: deviceStatusSchema },
    timestamp: { type: Date, default: Date.now },
    metadata: {
        data_type: { type: String },
        deviceId: { type: String }
    }
});

// Create Mongoose models
const ShellyAccountModel = mongoose.model<ShellyDocument>("ShellyAccount", shellyAccountSchema);
const ShellyModel = mongoose.model<HistoricalDataDocument>("Shelly", historicalDataSchema);

export { ShellyAccountModel, ShellyModel };
