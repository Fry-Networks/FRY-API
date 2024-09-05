import express from 'express';
import puppeteer from 'puppeteer';
import { ApiResponse, RowData } from 'types/gmcMapTypes.js';
import { GmcMapData } from '../../db/models/gmcMap_schema.js';

const router = express.Router();

const scrapeData = async (paramID: string, minerKey: string): Promise<RowData[]> => {
    console.log(`Starting scrapeData with Param_ID: ${paramID}, MinerKey: ${minerKey}`);

    const url = `https://gmcmap.com/historyData.asp?Param_ID=${paramID}`;
    console.log(`Navigating to URL: ${url}`);

    const browser = await puppeteer.launch();
    console.log('Puppeteer launched');

    const page = await browser.newPage();
    console.log('New page opened');

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        console.log('Page loaded successfully');

        const rows: RowData[] = await page.$$eval('table tbody tr', (rows: any) =>
            rows.map((row: any) => {
                const columns = row.querySelectorAll('td');
                return {
                    date: columns[0]?.textContent?.trim() || '',
                    cpm: columns[1]?.textContent?.trim() || '',
                    acpm: columns[2]?.textContent?.trim() || '',
                    usv_h: columns[3]?.textContent?.trim() || '',
                    latitude: columns[4]?.textContent?.trim() || '',
                    longitude: columns[5]?.textContent?.trim() || '',
                };
            })
        );

        console.log('Data extraction completed');

        await browser.close();
        console.log('Browser closed');

        return rows;
    } catch (error) {
        console.error('An error occurred during scraping:', error);
        await browser.close();
        console.log('Browser closed after error');

        return [];
    }
};

router.post('/api/submitGmcMap', async (req: express.Request, res: express.Response) => {
    console.log('Received request to /api/submitGmcMap');

    const { paramID, minerKey } = req.body;

    if (!paramID || !minerKey) {
        console.error('Param_ID or MinerKey is missing');
        return res.status(400).json(<ApiResponse>{
            status: 'ERROR',
            message: 'Param_ID and MinerKey are required',
        });
    }

    console.log(`Received Param_ID: ${paramID}, MinerKey: ${minerKey}`);

    try {
        const existingEntry = await GmcMapData.findOne({ paramID });
        if (existingEntry) {
            console.error('paramID already exists:', paramID);
            return res.status(409).json(<ApiResponse>{
                status: 'ERROR',
                message: 'paramID already exists in the database',
            });
        }

        const data = await scrapeData(paramID, minerKey);

        if (data.length === 0) {
            console.log('Geiger Counter Not Found or No Data Available');
            return res.status(400).json({
                status: 'ERROR',
                message: 'No data found for the provided Param_ID. Geiger Counter Not Found.',
            });
        }

        const scrapedData = new GmcMapData({
            paramID,
            minerKey,
            data: data,
            metadata: {
                data_type: "gmcMap",
            }
        });

        await scrapedData.save();
        console.log(`Saved document for Param_ID: ${paramID}, MinerKey: ${minerKey}`);

        res.status(200).json(<ApiResponse>{
            status: 'SUCCESS',
            message: 'Data retrieved and stored successfully',
            data: data,
        });

        console.log('Response sent');
    } catch (error: any) {
        console.error('Error occurred while processing:', error);

        res.status(500).json(<ApiResponse>{
            status: 'ERROR',
            message: 'Failed to retrieve and store data',
            error: error.message,
        });
    }
});


export default router;
