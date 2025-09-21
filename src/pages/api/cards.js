import GoogleSheetsService from '../../lib/googleSheets';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await GoogleSheetsService.readSheet('RationCards');
      res.status(200).json(data);
    } 
    else if (req.method === 'POST') {
      // ✅ FIX: Use the ID from the request body instead of creating a new one.
      const { ID, CardNumber, HeadOfFamily, DepotID } = req.body;
      
      const newCard = {
        ID, // Use the ID sent from the frontend
        CardNumber,
        HeadOfFamily,
        DepotID,
        CreatedAt: new Date().toISOString().split('T')[0]
      };
      
      const result = await GoogleSheetsService.writeSheet('RationCards', newCard);
      
      if (result.success) {
        res.status(200).json({ success: true, data: newCard });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    }
    else if (req.method === 'PUT') {
      const { id, CardNumber, HeadOfFamily, DepotID, rowIndex, CreatedAt } = req.body;
      
      const updatedCard = {
        ID: id,
        CardNumber,
        HeadOfFamily,
        DepotID,
        CreatedAt: CreatedAt,
      };
      
      const result = await GoogleSheetsService.updateSheet('RationCards', rowIndex, updatedCard);
      
      if (result.success) {
        res.status(200).json({ success: true, data: updatedCard });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    }
    else if (req.method === 'DELETE') {
      const { rowIndex } = req.body;
      
      const result = await GoogleSheetsService.deleteRow('RationCards', rowIndex);
      
      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    }
    else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Cards API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}