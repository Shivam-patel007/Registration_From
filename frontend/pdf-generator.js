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

function resolveJoinedDateValue(data) {
  const values = [data?.joinedDate, data?.joined_date, data?.createdAt, data?.joinedAt, data?.date, data?.year, data?.joinedYear];
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    return value;
  }
  return '';
}

function getAdmissionYear(value) {
  if (!value) return '';

  const text = String(value).trim();
  if (!text) return '';

  const parsedDate = new Date(text);
  if (!Number.isNaN(parsedDate.getTime())) {
    return String(parsedDate.getFullYear());
  }

  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : '';
}

function fieldBlock(label, value, options = {}) {
  const { fullWidth = false } = options;
  return `
    <div style="grid-column:${fullWidth ? '1 / -1' : 'auto'};">
      <div style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#5b6b8a;margin-bottom:4px;">
        ${escapeHtml(label)}
      </div>
      <div style="background:#f7f9fc;border:1px solid #dbe3ef;border-radius:8px;padding:4px 5px;font-size:12px;font-weight:600;color:#1a2332;min-height:20px;line-height:1.35;">
        ${escapeHtml(value)}
      </div>
    </div>
  `;
}

function skillCard(title, accent) {
  return `
    <div style="border:1px solid #dbe3ef;border-radius:10px;overflow:hidden;background:#fff;min-height:58px;box-shadow:0 3px 10px rgba(30,58,95,0.05);">
      <div style="height:5px;background:${accent};"></div>
      <div style="padding:10px 8px;text-align:center;font-size:10px;font-weight:700;color:#1e3a5f;letter-spacing:0.02em;">
        ${escapeHtml(title)}
      </div>
    </div>
  `;
}

function buildAssessmentFormHtml(data) {
  const joinedDateValue = resolveJoinedDateValue(data);
  const admissionYear = getAdmissionYear(joinedDateValue);
  const sessionLabel = admissionYear ? `${admissionYear}-${Number(admissionYear) + 3}` : '';
  const courseTitle = `${escapeHtml(data.course || 'BCA')} Programme`;
  const photoSource = data.photoDataUrl || data.photoUrl || '';
  const photoHtml = photoSource
    ? `<img src="${photoSource}" alt="Student Photo" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;display:block;" />`
    : `<div style="font-size:10px;color:#94a3b8;font-weight:700;letter-spacing:0.08em;">PHOTO</div>`;

  const cmToPx = 37.8;
  const columnWidths = [3 * cmToPx, 4 * cmToPx, 6 * cmToPx, 6 * cmToPx];
  const rowHeight = 24;
  const tableWidth = columnWidths.reduce((total, width) => total + width, 0);

  const sessionalCellHtml = (height, isHeader = false) => `
    <div style="display:flex;flex-direction:column;width:100%;height:${height}px;box-sizing:border-box;overflow:hidden;">
      <div style="height:16px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1e3a5f;box-sizing:border-box;${isHeader ? 'background:#eef3fa;' : ''}">
        ${isHeader ? 'Sessional Performance' : ''}
      </div>
      <div style="flex:1;display:flex;flex-direction:column;height:calc(100% - 18px);">
        <div style="flex:1;border-bottom:1px solid #c8d4e6;box-sizing:border-box;"></div>
        <div style="flex:1;border-bottom:1px solid #c8d4e6;box-sizing:border-box;"></div>
        <div style="flex:1;box-sizing:border-box;"></div>
      </div>
    </div>
  `;

  const tableRows = Array.from({ length: 12 }, (_, index) => {
    if (index === 0) {
      return `
        <tr>
          <td style="border:1px solid #c8d4e6;padding:4px;width:${columnWidths[0]}px;height:${rowHeight}px;font-size:10px;color:#1a2332;box-sizing:border-box;background:#fff;"></td>
          <td style="border:1px solid #c8d4e6;padding:4px;width:${columnWidths[1]}px;height:${rowHeight}px;font-size:10px;color:#1a2332;box-sizing:border-box;background:#fff;"></td>
          <td style="border:1px solid #c8d4e6;padding:4px;width:${columnWidths[2]}px;height:${rowHeight}px;font-size:10px;color:#1a2332;box-sizing:border-box;background:#fff;"></td>
          <td rowspan="12" style="border:1px solid #c8d4e6;padding:0;width:${columnWidths[3]}px;height:${rowHeight * 12}px;font-size:10px;color:#1a2332;vertical-align:top;box-sizing:border-box;background:#fff;">
            ${sessionalCellHtml(rowHeight * 12, false)}
          </td>
        </tr>`;
    }

    return `
      <tr>
        <td style="border:1px solid #c8d4e6;padding:4px;width:${columnWidths[0]}px;height:${rowHeight}px;font-size:10px;color:#1a2332;box-sizing:border-box;background:#fff;"></td>
        <td style="border:1px solid #c8d4e6;padding:4px;width:${columnWidths[1]}px;height:${rowHeight}px;font-size:10px;color:#1a2332;box-sizing:border-box;background:#fff;"></td>
        <td style="border:1px solid #c8d4e6;padding:4px;width:${columnWidths[2]}px;height:${rowHeight}px;font-size:10px;color:#1a2332;box-sizing:border-box;background:#fff;"></td>
        <td style="border:1px solid #c8d4e6;padding:0;width:${columnWidths[3]}px;height:${rowHeight}px;font-size:10px;color:#1a2332;box-sizing:border-box;background:#fff;">
          ${sessionalCellHtml(rowHeight, false)}
        </td>
      </tr>`;
  }).join('');

  const improvementBoxes = Array.from({ length: 4 }, (_, index) => `
    <div style="border:1px solid #dbe3ef;border-radius:10px;padding:4px 8px;text-align:center;background:linear-gradient(180deg,#ffffff 0%,#f8fafc 100%);min-height:55px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#1e3a5f,#2563eb,#c9a227);"></div>
      <div style="font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#94a3b8;margin-top:6px;">Week ${index + 1}</div>
    </div>
  `).join('');

  return `
    <div id="assessment-form-root" style="
      width:100%;
      max-width:720px;
      padding:0;
      background:#ffffff;
      color:#1a2332;
      font-family:'Segoe UI',Arial,Helvetica,sans-serif;
      font-size:10px;
      line-height:1.25;
      box-sizing:border-box;
      overflow:hidden;
      border-radius:12px;
      border:1px solid #dbe3ef;
      margin:0px;
    ">
      <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2c5282 55%,#1e3a5f 100%);padding:16px 18px 14px;color:#fff;position:relative;">
        <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#c9a227,#f0d78c,#c9a227);"></div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <div>
            <h1 style="font-size:18px;font-weight:800;margin:0 0 4px 0;letter-spacing:0.02em;line-height:1.15;">
              BBS Institute of Professional Studies
            </h1>
            <div style="font-size:11px;font-weight:600;opacity:0.95;">${courseTitle}${sessionLabel ? ` · Session ${escapeHtml(sessionLabel)}` : ''}</div>
          </div>
          <div style="text-align:right;min-width:110px;">
            <div style="margin-top:10px;font-size:15px;opacity:0.88;">Admission Year <strong style="color:#f0d78c;">${escapeHtml(admissionYear)}</strong></div>
          </div>
        </div>
      </div>

      <div style="padding:14px 16px 8px;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px;">
          ${fieldBlock('Student Name', data.name)}
          ${fieldBlock('Mobile Number', data.mobile)}
          ${fieldBlock('Registration ID', data.registrationId)}
        </div>

        <div style="display:grid;grid-template-columns:1fr 122px;gap:10px;margin-bottom:12px;">
          <div style="border:1px solid #dbe3ef;border-radius:12px;padding:12px;background:linear-gradient(180deg,#ffffff 0%,#f8fafc 100%);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid #e8eef6;">
              <div style="width:7px;height:20px;border-radius:999px;background:linear-gradient(180deg,#c9a227,#f0d78c);"></div>
              <div style="font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#1e3a5f;">
                Personal Information
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              ${fieldBlock('Father\'s Name', data.fatherName)}
              ${fieldBlock('Father\'s Mobile', data.fatherMobile)}
              ${fieldBlock('10th Board', data.board10)}
              ${fieldBlock('10th Percentage', formatPercent(data.percentage10))}
              ${fieldBlock('12th Board', data.board)}
              ${fieldBlock('12th Percentage', formatPercent(data.percentage))}
              ${fieldBlock('Hostel Required', data.hostel)}
              ${fieldBlock('Bus Facility', data.bus || 'No')}
              ${fieldBlock('Full Address', buildFullAddress(data), { fullWidth: true })}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#5b6b8a;margin-bottom:8px;width:100%;text-align:center;">
              Student Photograph
            </div>
            <div style="width:112px;height:138px;border-radius:12px;overflow:hidden;border:2px solid #1e3a5f;background:#f8fafc;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(30,58,95,0.14);">
              ${photoHtml}
            </div>
            <div style="margin-top:8px;width:100%;padding:6px 8px;border-radius:8px;background:#eef3fa;border:1px solid #dbe3ef;text-align:center;">
              <div style="font-size:8px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#5b6b8a;">University Roll No.</div>
              <div style="font-size:10px;font-weight:700;color:#1e3a5f;margin-top:2px;min-height:14px;"></div>
            </div>
          </div>
        </div>

        <div style="margin:12px 0 8px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:#eef3fa;border:1px solid #dbe3ef;">
            <div style="width:20px;height:2px;background:linear-gradient(90deg,#1e3a5f,#2563eb);"></div>
            <div style="font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#1e3a5f;">
              Aptitude Assessment Areas
            </div>
            <div style="width:20px;height:2px;background:linear-gradient(90deg,#2563eb,#c9a227);"></div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
          ${skillCard('Maths Ability', 'linear-gradient(90deg,#1e3a5f,#2c5282)')}
          ${skillCard('English Writing Skills', 'linear-gradient(90deg,#2563eb,#3b82f6)')}
          ${skillCard('Spoken Skills', 'linear-gradient(90deg,#c9a227,#f0d78c)')}
        </div>

        <div style="border:1px solid #dbe3ef;border-radius:12px;overflow:hidden;margin-bottom:10px;">
          <div style="background:#1e3a5f;color:#fff;padding:8px 10px;font-size:9px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">
            Counselling & Performance Record
          </div>
          <div style="padding:8px;background:#fff;overflow-x:hidden;">
            <table style="width:${tableWidth}px;border-collapse:collapse;table-layout:fixed;">
              <thead>
                <tr>
                  <th style="background:#eef3fa;border:1px solid #c8d4e6;padding:6px 4px;font-size:9px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#1e3a5f;text-align:center;width:${columnWidths[0]}px;height:22px;box-sizing:border-box;">Date</th>
                  <th style="background:#eef3fa;border:1px solid #c8d4e6;padding:6px 4px;font-size:9px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#1e3a5f;text-align:center;width:${columnWidths[1]}px;height:22px;box-sizing:border-box;">Purpose</th>
                  <th style="background:#eef3fa;border:1px solid #c8d4e6;padding:6px 4px;font-size:9px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#1e3a5f;text-align:center;width:${columnWidths[2]}px;height:22px;box-sizing:border-box;">Remarks</th>
                  <th style="background:#eef3fa;border:1px solid #c8d4e6;padding:0;font-size:9px;font-weight:800;color:#1e3a5f;text-align:center;width:${columnWidths[3]}px;height:22px;box-sizing:border-box;">
                    ${sessionalCellHtml(22, true)}
                  </th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
        </div>

        <div style="margin-top:8px;">
          <div style="font-size:9px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#1e3a5f;margin-bottom:6px;">
            Improvement Observed
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
            ${improvementBoxes}
          </div>
        </div>
      </div>
  `;
}

async function waitForFormImages(element) {
  const image = element.querySelector('img');
  if (!image) return;

  if (!image.complete) {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });
  }
}

async function renderAssessmentFormElement(data) {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.width = '760px';
  wrapper.style.background = '#ffffff';
  wrapper.style.overflow = 'hidden';
  wrapper.innerHTML = buildAssessmentFormHtml(data);
  document.body.appendChild(wrapper);

  const element = wrapper.querySelector('#assessment-form-root');
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await waitForFormImages(element);

  return { wrapper, element };
}

async function captureFormCanvas(element) {
  await waitForFormImages(element);

  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.offsetWidth,
    height: element.offsetHeight,
    windowWidth: element.offsetWidth,
    windowHeight: element.offsetHeight,
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    onclone: (doc) => {
      const clonedForm = doc.getElementById('assessment-form-root');
      if (!clonedForm) return;

      clonedForm.style.boxShadow = 'none';
      clonedForm.style.margin = '0';
      clonedForm.style.minHeight = 'auto';
      clonedForm.style.borderRadius = '0';
    },
  });
}

function addCanvasToPdf(pdf, canvas, margin = 8) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
  const scaledWidth = imgWidth * ratio;
  const scaledHeight = imgHeight * ratio;
  const imgData = canvas.toDataURL('image/png', 1.0);

  pdf.addImage(imgData, 'PNG', (pageWidth - scaledWidth) / 2, (pageHeight - scaledHeight) / 2, scaledWidth, scaledHeight);
}

async function generateAssessmentPdf(data, fileName, options = {}) {
  if (!window.html2canvas || !window.jspdf?.jsPDF) {
    throw new Error('PDF libraries are not loaded.');
  }

  const sourceElement = options.sourceElement || null;
  let wrapper = null;
  let element = sourceElement;

  if (!element) {
    const rendered = await renderAssessmentFormElement(data);
    wrapper = rendered.wrapper;
    element = rendered.element;
  }

  try {
    const canvas = await captureFormCanvas(element);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    addCanvasToPdf(pdf, canvas);
    pdf.save(fileName);
  } finally {
    if (wrapper) {
      document.body.removeChild(wrapper);
    }
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
    joinedDate: student.joinedDate || student.joined_date || student.createdAt || student.joinedAt || student.date || student.year || student.joinedYear || '',
    joined_date: student.joinedDate || student.joined_date || student.createdAt || student.joinedAt || student.date || student.year || student.joinedYear || '',
    createdAt: student.createdAt || student.joinedDate || student.joined_date || student.joinedAt || student.date || student.year || student.joinedYear || ''
  };
}

window.PdfGenerator = {
  buildAssessmentFormHtml,
  generateAssessmentPdf,
  studentToFormData,
};
