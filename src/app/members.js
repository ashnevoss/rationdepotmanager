import GoogleSheetsService from './lib/googleSheets.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const data = await GoogleSheetsService.readSheet('Members');
      res.status(200).json(data);
    } 
    else if (req.method === 'POST') {
      const { 
        ID,
        CardID, 
        Name, 
        DOB, 
        Gender, 
        MaritalStatus, 
        Phone, 
        Aadhar, 
        KYCVerified, 
        KYCReason, 
        Relation 
      } = req.body;
      
      const newMember = {
        ID,
        CardID,
        Name,
        DOB,
        Gender,
        MaritalStatus,
        Phone: Phone || '',
        Aadhar,
        KYCVerified,
        KYCReason: KYCReason || '',
        Relation,
        CreatedAt: new Date().toISOString().split('T')[0]
      };
      
      const result = await GoogleSheetsService.writeSheet('Members', newMember);
      
      if (result.success) {
        res.status(200).json({ success: true, data: newMember });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    }
    else if (req.method === 'PUT') {
      const { 
        id,
        CardID, 
        Name, 
        DOB, 
        Gender, 
        MaritalStatus, 
        Phone, 
        Aadhar, 
        KYCVerified, 
        KYCReason, 
        Relation,
        rowIndex,
        CreatedAt
      } = req.body;
      
      const updatedMember = {
        ID: id,
        CardID,
        Name,
        DOB,
        Gender,
        MaritalStatus,
        Phone: Phone || '',
        Aadhar,
        KYCVerified,
        KYCReason: KYCReason || '',
        Relation,
        CreatedAt: CreatedAt
      };
      
      const result = await GoogleSheetsService.updateSheet('Members', rowIndex, updatedMember);
      
      if (result.success) {
        res.status(200).json({ success: true, data: updatedMember });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    }
    else if (req.method === 'DELETE') {
      const { rowIndex } = req.body;
      
      const result = await GoogleSheetsService.deleteRow('Members', rowIndex);
      
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
    console.error('Members API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}