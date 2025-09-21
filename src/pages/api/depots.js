import GoogleSheetsService from '@/lib/googleSheets.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await GoogleSheetsService.readSheet('Depots');
      res.status(200).json(data);
    } 
    else if (req.method === 'POST') {
      // ✅ FIX: Use the ID from the request body.
      const { ID, Name, Address } = req.body;
      
      const newDepot = {
        ID, // Use the ID sent from the frontend
        Name,
        Address,
        CreatedAt: new Date().toISOString().split('T')[0],
        UpdatedAt: new Date().toISOString().split('T')[0]
      };
      
      const result = await GoogleSheetsService.writeSheet('Depots', newDepot);
      
      if (result.success) {
        res.status(200).json({ success: true, data: newDepot });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    }
    else if (req.method === 'PUT') {
      const { id, Name, Address, rowIndex, CreatedAt } = req.body;
      
      const updatedDepot = {
        ID: id,
        Name,
        Address,
        CreatedAt: CreatedAt,
        UpdatedAt: new Date().toISOString().split('T')[0]
      };
      
      const result = await GoogleSheetsService.updateSheet('Depots', rowIndex, updatedDepot);
      
      if (result.success) {
        res.status(200).json({ success: true, data: updatedDepot });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    }
    else if (req.method === 'DELETE') {
      const { rowIndex } = req.body;
      
      const result = await GoogleSheetsService.deleteRow('Depots', rowIndex);
      
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
    console.error('Depots API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}