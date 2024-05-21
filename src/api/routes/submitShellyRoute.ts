import axios from "axios";
import express from "express";
import { minerKeyRegex } from "../../constant/const.js";
import { ShellyAccountModel, ShellyModel } from "../../db/models/shelly_account.js";

const router = express.Router();

const fetchDataAndUpdate = async () => {
    try {
        const shellyAccounts = await ShellyAccountModel.find();

        for (const account of shellyAccounts) {
            const { serverUrl, deviceId, authKey, walletaddress } = account;

            const formData = {
                id: deviceId,
                auth_key: authKey
            };

            const response = await axios.post(`${serverUrl}/device/status`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (!response.data.isok && response.data.errors && response.data.errors.no_permissions) {
                console.error(`Error fetching data for device ${deviceId}: ${response.data.errors.no_permissions}`);
                continue; // Skip to the next device if there's an error
            }

            const responseData = response.data.data;
            const { device_status } = responseData;

            // Update the latest data in ShellyAccount (overwrite if exists)
            const shellyAccountData = {
                walletaddress,
                serverUrl,
                deviceId: device_status.id,
                authKey,
                data: {
                    isok: responseData.isok,
                    device_status,
                },
                metadata: {
                    data_type: "shelly"
                }
            };

            await ShellyAccountModel.findOneAndUpdate(
                { deviceId: device_status.id },
                shellyAccountData,
                { upsert: true }
            );

            // Save historical data in Shelly collection
            const historicalData = new ShellyModel({
                device_status,
                timestamp: new Date(),
                metadata: {
                    data_type: "shelly",
                    deviceId: device_status.id
                }
            });

            await historicalData.save();
        }

        console.log("Data fetch and update completed.");
    } catch (error) {
        console.error("Error fetching or updating data:", error);
    }
};

fetchDataAndUpdate();
setInterval(fetchDataAndUpdate, 10 * 60 * 1000); // Run every 10 minutes

function extractErrorMessage(errors: any) {
    if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
        const firstErrorKey = Object.keys(errors)[0];
        return errors[firstErrorKey];
    }
    return "An error occurred";
}

router.post("/api/submitShellykey", async (req, res) => {
    const { serverUrl, deviceId, authKey, address, minerKey } = req.body;
    const existingKey = await ShellyAccountModel.exists({ deviceId });

    if (existingKey) {
        return res.status(409).send({
            message: "API Key already exists in the database.",
            status: "ERROR",
        });
    }

    if (!minerKeyRegex.test(minerKey)) {
        return void res.status(400).send({
            message: "Miner Key is invalid. (Didn't pass check)",
            status: "ERROR",
            });
        }

    try {
        const formData = {
            id: deviceId,
            auth_key: authKey
        };

        const response = await axios.post(`${serverUrl}/device/status`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        if (!response.data.isok && response.data.errors && response.data.errors.no_permissions) {
            res.status(403).send({
                message: response.data.errors.no_permissions,
                status: "ERROR",
            });
            return;
        }

        const responseData = response.data.data;
        const { device_status } = responseData;

        // Save latest data in ShellyAccount
        const shellyAccountData = {
            deviceId,
            authKey,
            serverUrl,
            address,
            minerKey,
            data: {
                isok: responseData.isok,
                device_status,
            },
            metadata: {
                data_type: "shelly"
            }
        };

        await ShellyAccountModel.create(shellyAccountData);

        // Save historical data in Shelly collection
        const historicalData = new ShellyModel({
            device_status,
            metadata: {
                data_type: "shelly",
                deviceId
            }
        });

        await historicalData.save();

        res.status(200).send({
            message: "Shelly API successful.",
            data: responseData,
            status: "SUCCESS",
        });
    } catch (error: any) {
        console.error("Error:", error);
        console.error("Message:", error.message);
        res.status(500).send({
            message: extractErrorMessage(error?.response?.data?.errors),
            status: "ERROR",
        });
    }
});

export default router;
