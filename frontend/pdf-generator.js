function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPercent(value) {
  if (value === null || value === undefined || value === '') return '';
  const text = String(value).trim();
  return text.endsWith('%') ? text : `${text}%`;
}

function buildFullAddress(data) {
  const parts = [
    data.address,
    data.district ? `District: ${data.district}` : '',
    data.state ? `State: ${data.state}` : '',
    data.pincode ? `Pincode: ${data.pincode}` : '',
    data.landmark ? `Landmark: ${data.landmark}` : '',
  ].filter(Boolean);

  return parts.join(', ');
}

function buildAssessmentFormHtml(data) {
  const courseTitle = `${escapeHtml(data.course || 'BCA')} 2026-29`;
  const photoSource = data.photoDataUrl || data.photoUrl || '';
  const photoHtml = photoSource
    ? `<img src="${photoSource}" alt="Student Photo" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;display:block;" />`
    : 'Photo';
  const cmToPx = 37.8;
  const columnWidths = [3 * cmToPx, 4 * cmToPx, 6 * cmToPx, 6 * cmToPx];
  const rowHeight = 33;
  const tableWidth = columnWidths.reduce((total, width) => total + width, 0);

  const sessionalCellHtml = (height, isHeader = false) => `
    <div style="display:flex;flex-direction:column;width:100%;height:${height}px;box-sizing:border-box;overflow:hidden;">
      <div style="height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:#000;box-sizing:border-box;${isHeader ? 'background:#f5f5f5;' : ''}">
        ${isHeader ? 'Sessional Performance' : ''}
      </div>
      <div style="flex:1;display:flex;flex-direction:column;height:calc(100% - 18px);">
         <div style="flex:1;border-bottom:1px solid #000;box-sizing:border-box;"></div>
        <div style="flex:1;border-bottom:1px solid #000;box-sizing:border-box;"></div>
         <div style="flex:1;box-sizing:border-box;"></div>
      </div>
    </div>
  `;

  const tableRows = Array.from({ length: 12 }, (_, index) => {
    if (index === 0) {
      return `
        <tr>
          <td style="border:1px solid #000;padding:2px;width:${columnWidths[0]}px;height:${rowHeight}px;font-size:10px;color:#000;box-sizing:border-box;"></td>
          <td style="border:1px solid #000;padding:2px;width:${columnWidths[1]}px;height:${rowHeight}px;font-size:10px;color:#000;box-sizing:border-box;"></td>
          <td style="border:1px solid #000;padding:2px;width:${columnWidths[2]}px;height:${rowHeight}px;font-size:10px;color:#000;box-sizing:border-box;"></td>
          <td rowspan="12" style="border:1px solid #000;padding:0;width:${columnWidths[3]}px;height:${rowHeight * 12}px;font-size:10px;color:#000;vertical-align:top;box-sizing:border-box;">
            ${sessionalCellHtml(rowHeight * 12, false)}
          </td>
        </tr>`;
    }

    return `
      <tr>
        <td style="border:1px solid #000;padding:2px;width:${columnWidths[0]}px;height:${rowHeight}px;font-size:10px;color:#000;box-sizing:border-box;"></td>
        <td style="border:1px solid #000;padding:2px;width:${columnWidths[1]}px;height:${rowHeight}px;font-size:10px;color:#000;box-sizing:border-box;"></td>
        <td style="border:1px solid #000;padding:2px;width:${columnWidths[2]}px;height:${rowHeight}px;font-size:10px;color:#000;box-sizing:border-box;"></td>
        <td style="border:1px solid #000;padding:0;width:${columnWidths[3]}px;height:${rowHeight}px;font-size:10px;color:#000;box-sizing:border-box;">
          ${sessionalCellHtml(rowHeight, false)}
        </td>
      </tr>`;
  }).join('');

  const improvementBoxes = Array.from({ length: 4 }, () => `
    <div style="border:1px solid #000;padding:15px 5px;text-align:center;background:#fff;min-height:70px;"></div>
  `).join('');

  return `
    <div id="assessment-form-root" style="
      width:760px;
      min-height:1000px;
      padding:24px;
      background:#fff;
      color:#000;
      font-family:Arial,Helvetica,sans-serif;
      font-size:11px;
      line-height:1.3;
      box-sizing:border-box;
    ">
      <div style="text-align:center;margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid #000;">
        <h1 style="font-size:18px;font-weight:bold;color:#000;margin:0 0 4px 0;letter-spacing:0.3px;">
          BBS INSTITUTE OF PROFESSIONAL STUDIES
        </h1>
        <div style="font-size:16px;color:#000;font-weight:bold;margin-bottom:4px;">${courseTitle}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:10px;align-items:end;">
        <div>
          <label style="display:block;font-size:12px;color:#000;font-weight:bold;margin-bottom:3px;">Name:</label>
          <div style="border-bottom:1px solid #000;padding:2px 5px;font-size:12px;color:#000;min-height:18px;">
            ${escapeHtml(data.name)}
          </div>
        </div>
        <div>
          <label style="display:block;font-size:12px;color:#000;font-weight:bold;margin-bottom:3px;">Mobile:</label>
          <div style="border-bottom:1px solid #000;padding:2px 5px;font-size:12px;color:#000;min-height:18px;">
            ${escapeHtml(data.mobile)}
          </div>
        </div>
        <div>
          <label style="display:block;font-size:12px;color:#000;font-weight:bold;">Admission Year: 2026</label>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 130px;gap:12px;margin-bottom:12px;">
        <div style="border:1px solid #000;padding:10px;">
          <div style="font-weight:bold;font-size:12px;color:#000;margin-bottom:8px;border-bottom:1px solid #000;padding-bottom:4px;">
            PERSONAL INFORMATION
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px;">
            <div>
              <label style="display:block;font-size:11px;color:#000;font-weight:bold;margin-bottom:2px;">BBS Registration No.</label>
              <div style="border-bottom:1px solid #000;padding:2px 3px;font-size:12px;color:#000;min-height:18px;">
                ${escapeHtml(data.registrationId)}
              </div>
            </div>
            <div>
              <label style="display:block;font-size:11px;color:#000;font-weight:bold;margin-bottom:2px;">University Roll No.</label>
              <div style="border-bottom:1px solid #000;padding:2px 3px;font-size:12px;color:#000;min-height:18px;"></div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px;">
            <div>
              <label style="display:block;font-size:11px;color:#000;font-weight:bold;margin-bottom:2px;">Father's Name</label>
              <div style="border-bottom:1px solid #000;padding:2px 3px;font-size:12px;color:#000;min-height:18px;">
                ${escapeHtml(data.fatherName)}
              </div>
            </div>
            <div>
              <label style="display:block;font-size:11px;color:#000;font-weight:bold;margin-bottom:2px;">Father's Mobile</label>
              <div style="border-bottom:1px solid #000;padding:2px 3px;font-size:12px;color:#000;min-height:18px;">
                ${escapeHtml(data.fatherMobile)}
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px;">
            <div>
              <label style="display:block;font-size:11px;color:#000;font-weight:bold;margin-bottom:2px;">12th Board</label>
              <div style="border-bottom:1px solid #000;padding:2px 3px;font-size:12px;color:#000;min-height:18px;">
                ${escapeHtml(data.board)}
              </div>
            </div>
            <div>
              <label style="display:block;font-size:11px;color:#000;font-weight:bold;margin-bottom:2px;">12th Percent</label>
              <div style="border-bottom:1px solid #000;padding:2px 3px;font-size:12px;color:#000;min-height:18px;">
                ${escapeHtml(formatPercent(data.percentage))}
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px;">
            <div>
              <label style="display:block;font-size:11px;color:#000;font-weight:bold;margin-bottom:2px;">Hostel</label>
              <div style="border-bottom:1px solid #000;padding:2px 3px;font-size:12px;color:#000;min-height:18px;">
                ${escapeHtml(data.hostel)}
              </div>
            </div>
            <div>
              <label style="display:block;font-size:11px;color:#000;font-weight:bold;margin-bottom:2px;">Bus</label>
              <div style="border-bottom:1px solid #000;padding:2px 3px;font-size:12px;color:#000;min-height:18px;">${escapeHtml(data.bus || 'No')}</div>
            </div>
          </div>

          <div>
            <label style="display:block;font-size:11px;color:#000;font-weight:bold;margin-bottom:2px;">Address</label>
            <div style="border-bottom:1px solid #000;padding:2px 3px;font-size:12px;color:#000;min-height:36px;">
              ${escapeHtml(buildFullAddress(data))}
            </div>
          </div>
        </div>

        <div style="border:1px solid #000;width:120px;height:140px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:11px;color:#000;font-weight:bold;overflow:hidden;background:#fff;">
          ${photoHtml}
        </div>
      </div>

      <div style="margin:10px 0;">
        <div style="font-weight:bold;font-size:13px;margin-bottom:6px;color:#000;text-align:center;">FIRST ASSESSMENT</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px;">
          <div style="border:1px solid #000;padding:2px;text-align:center;min-height:60px;display:flex;align-items:flex-start;justify-content:center;font-weight:bold;font-size:11px;color:#000;">Maths Ability</div>
          <div style="border:1px solid #000;padding:2px;text-align:center;min-height:60px;display:flex;align-items:flex-start;justify-content:center;font-weight:bold;font-size:11px;color:#000;">English Writing Skills</div>
          <div style="border:1px solid #000;padding:2px;text-align:center;min-height:60px;display:flex;align-items:flex-start;justify-content:center;font-weight:bold;font-size:11px;color:#000;">Spoken Skills</div>
        </div>
      </div>

      <div style="margin:12px 0;">
        <table style="width:${tableWidth}px;border-collapse:collapse;margin-bottom:12px;table-layout:fixed;">
          <thead>
            <tr>
              <th style="background:#f5f5f5;border:1px solid #000;padding:3px;font-size:10px;font-weight:bold;color:#000;text-align:center;width:${columnWidths[0]}px;height:18px;box-sizing:border-box;">Date</th>
              <th style="background:#f5f5f5;border:1px solid #000;padding:3px;font-size:10px;font-weight:bold;color:#000;text-align:center;width:${columnWidths[1]}px;height:18px;box-sizing:border-box;">Purpose</th>
              <th style="background:#f5f5f5;border:1px solid #000;padding:3px;font-size:10px;font-weight:bold;color:#000;text-align:center;width:${columnWidths[2]}px;height:18px;box-sizing:border-box;">Remarks</th>
              <th style="background:#f5f5f5;border:1px solid #000;padding:0;font-size:10px;font-weight:bold;color:#000;text-align:center;width:${columnWidths[3]}px;height:18px;box-sizing:border-box;">
                ${sessionalCellHtml(18, true)}
              </th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>

      <div style="margin-top:12px;">
        <div style="font-weight:bold;font-size:13px;margin-bottom:8px;color:#000;">Improvement Observed</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
          ${improvementBoxes}
        </div>
      </div>
    </div>
  `;
}

async function renderAssessmentFormElement(data) {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.background = '#ffffff';
  wrapper.innerHTML = buildAssessmentFormHtml(data);
  document.body.appendChild(wrapper);

  const element = wrapper.querySelector('#assessment-form-root');
  await new Promise((resolve) => requestAnimationFrame(resolve));

  if (data.photoDataUrl || data.photoUrl) {
    const image = element.querySelector('img');
    if (image && !image.complete) {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });
    }
  }

  return { wrapper, element };
}

async function generateAssessmentPdf(data, fileName) {
  if (!window.html2canvas || !window.jspdf?.jsPDF) {
    throw new Error('PDF libraries are not loaded.');
  }

  const { wrapper, element } = await renderAssessmentFormElement(data);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;
    const scale = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
    const imgWidth = canvas.width * scale;
    const imgHeight = canvas.height * scale;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save(fileName);
  } finally {
    document.body.removeChild(wrapper);
  }
}

function studentToFormData(student) {
  return {
    name: student.name || '',
    mobile: student.mobile || '',
    fatherName: student.fatherName || '',
    fatherMobile: student.fatherMobile || '',
    state: student.state || '',
    pincode: student.pincode || '',
    district: student.district || '',
    landmark: student.landmark || '',
    address: student.address || '',
    board: student.board || '',
    board10: student.board10 || '',
    percentage10: student.percentage10 || '',
    percentage: student.percentage || '',
    hostel: student.hostel || '',
    bus: student.bus || '',
    course: student.course || '',
    registrationId: student.id || student.registrationId || '',
    photoDataUrl: student.photoDataUrl || student.photoUrl || '',
  };
}

window.PdfGenerator = {
  buildAssessmentFormHtml,
  generateAssessmentPdf,
  studentToFormData,
};
