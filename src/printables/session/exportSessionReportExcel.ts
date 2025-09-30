// src/utils/exportSessionReportExcel.js

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { MOHIMAGELOG } from 'src/assets/imageBytes.ts';

export async function exportSessionReportExcel({ total, internos, externos }) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Relatório de Sessões');

  const imageId = workbook.addImage({
    base64: MOHIMAGELOG,
    extension: 'png',
  });

  sheet.addImage(imageId, {
    tl: { col: 0, row: 0 },
    ext: { width: 120, height: 60 },
  });

  sheet.mergeCells('B1:E1');
  sheet.getCell('B1').value = 'Relatório de Sessões de Mentoria';
  sheet.getCell('B1').font = { bold: true, size: 16 };
  sheet.getCell('B1').alignment = { horizontal: 'center', vertical: 'middle' };

  sheet.mergeCells('B2:E2');
  sheet.getCell('B2').value = 'Ministério da Saúde - Moçambique';
  sheet.getCell('B2').font = { italic: true, size: 12 };
  sheet.getCell('B2').alignment = { horizontal: 'center' };

  sheet.mergeCells('B3:E3');
  const dateStr = new Date().toLocaleDateString('pt-PT');
  sheet.getCell('B3').value = `Data de Geração: ${dateStr}`;
  sheet.getCell('B3').font = { size: 11, color: { argb: 'FF555555' } };
  sheet.getCell('B3').alignment = { horizontal: 'center' };

  sheet.addRow([]);

  const header = ['Descrição', 'Valor'];
  const headerRow = sheet.addRow(header);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFCCCCCC' },
  };
  headerRow.alignment = { horizontal: 'center' };

  const rows = [
    ['Total de Sessões Realizadas', total],
    ['Sessões por Mentores Internos', internos],
    ['Sessões por Mentores Externos', externos],
  ];

  rows.forEach((row) => {
    const newRow = sheet.addRow(row);
    newRow.alignment = { vertical: 'middle' };
  });

  sheet.columns = [{ width: 40 }, { width: 20 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, 'Relatorio_Sessoes_Mentoria.xlsx');
}
