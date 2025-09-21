import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

const GoogleSheetsService = {
  async readSheet(sheetName) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
      });
      
      const rows = response.data.values || [];
      if (rows.length === 0) return [];
      
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
      
      return data;
    } catch (error) {
      console.error(`Error reading ${sheetName}:`, error);
      return [];
    }
  },

  async writeSheet(sheetName, data) {
    try {
      const values = Object.values(data);
      
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [values],
        },
      });
      
      return { success: true };
    } catch (error) {
      console.error(`Error writing to ${sheetName}:`, error);
      return { success: false, error };
    }
  },

  async updateSheet(sheetName, rowIndex, data) {
    try {
      const headersResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!1:1`,
      });
      const headers = headersResponse.data.values[0];
      if (!headers) throw new Error('Could not retrieve headers from the sheet.');
      
      const values = headers.map(header => {
        return data[header] !== undefined ? data[header] : '';
      });
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [values],
        },
      });
      
      return { success: true };
    } catch (error) {
      console.error(`Error updating ${sheetName}:`, error);
      return { success: false, error };
    }
  },

  async deleteRow(sheetName, rowIndex) {
    try {
      const sheetInfo = await sheets.spreadsheets.get({
        spreadsheetId,
      });
      
      const sheet = sheetInfo.data.sheets.find(s => s.properties.title === sheetName);
      const sheetId = sheet.properties.sheetId;
      
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex - 1,
                endIndex: rowIndex,
              },
            },
          }],
        },
      });
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting from ${sheetName}:`, error);
      return { success: false, error };
    }
  },
};

export default GoogleSheetsService;