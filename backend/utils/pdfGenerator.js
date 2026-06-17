const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// Helper to format Date on server side
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

// Helper to format Time on server side
const formatTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
};

// Helper to convert logo image to Base64 data URI
const getLogoDataUrl = () => {
  try {
    const logoPath = path.resolve(__dirname, "../../frontend/public/logo.png");
    if (fs.existsSync(logoPath)) {
      const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
      return `data:image/png;base64,${logoBase64}`;
    }
  } catch (err) {
    console.error("[PDF Generator] Failed to read logo base64:", err);
  }
  return "";
};

async function generateReceiptPDF(receipt, ledger, payment) {
  const student = receipt.student || {};
  const course = receipt.course || {};
  const logoDataUrl = getLogoDataUrl();

  const feeMonth = receipt.month || "Monthly";
  const payAmt = receipt.amountPaid || 0;
  const modeLabel = receipt.paymentMode === "Razorpay" ? "Online Gateway" : (receipt.paymentMode || "—");

  const totalOutstanding = receipt.remainingBalance || 0;
  const monthOutstanding = ledger.monthlyBills 
    ? (ledger.monthlyBills.find(b => b.month === feeMonth)?.pendingAmount || 0)
    : 0;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Fee Receipt - ${receipt.receiptNo}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', Arial, sans-serif;
          background-color: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .receipt-card-container {
          width: 560px;
          background: #ffffff;
          box-sizing: border-box;
          overflow: hidden;
          margin: 0 auto;
        }
        
        /* ── HEADER ── */
        .receipt-header {
          background: linear-gradient(135deg, #0a1a4a 0%, #1a3a8f 100%);
          padding: 36px 36px 28px;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }
        .receipt-header::before {
          content: '';
          position: absolute;
          top: -50px;
          right: -50px;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
        }
        .receipt-header::after {
          content: '';
          position: absolute;
          bottom: -70px;
          left: -30px;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: rgba(240, 165, 0, 0.06);
        }
        .header-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }
        .logo-and-name {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .logo-wrapper {
          width: 128px;
          height: 128px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        .logo-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .brand-name {
          font-size: 26px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          line-height: 1.1;
        }
        .brand-sub {
          font-size: 12px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.55);
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-top: 6px;
        }
        .receipt-badge {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 10px;
          padding: 12px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 230px;
          box-sizing: border-box;
        }
        .receipt-badge-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          line-height: 16px;
        }
        .receipt-badge-no {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          margin-top: 4px;
          white-space: nowrap;
          line-height: 22px;
        }
        .divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0 0 22px;
          position: relative;
          z-index: 1;
        }
        .header-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .meta-col {
          flex: 1;
        }
        .meta-col.left { text-align: left; }
        .meta-col.center { text-align: center; }
        .meta-col.right { text-align: right; }
        
        .meta-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.3px;
          color: rgba(255, 255, 255, 0.45);
          text-transform: uppercase;
        }
        .meta-val {
          font-size: 17px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          margin-top: 3px;
        }

        /* ── AMOUNT STRIP ── */
        .receipt-amount-strip {
          background: linear-gradient(135deg, #f6f9ff 0%, #edf2ff 100%);
          padding: 32px 36px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #dde6f5;
          box-sizing: border-box;
        }
        .amount-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .amount-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: #6879a8;
          text-transform: uppercase;
        }
        .amount-sub {
          font-size: 15px;
          color: #99aacb;
          font-weight: 500;
        }
        .amount-val-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          text-align: right;
        }
        .amount-val {
          font-size: 42px;
          font-weight: 800;
          color: #0d2057;
          letter-spacing: -1px;
          line-height: 1;
          white-space: nowrap;
        }
        
        /* ── BADGES ── */
        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          font-weight: 700;
          text-transform: uppercase;
          white-space: nowrap;
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 12px;
          line-height: 1;
        }
        .badge-paid-in-full {
          background-color: #e5f9ee;
          color: #1a7a46;
          border: 1px solid #aee8c8;
        }
        .badge-blue {
          background-color: #eef3ff;
          color: #1a3a8f;
        }
        .badge-mono {
          background-color: #f2f5fb;
          color: #5a6f9a;
          font-family: Consolas, Monaco, monospace;
          border-radius: 6px;
        }
        .badge-cash {
          background-color: #fff5e0;
          color: #b87000;
          border: 1px solid #f5d88a;
        }
        .badge-green {
          background-color: #e5f9ee;
          color: #1a7a46;
          border: 1px solid #aee8c8;
        }
        .badge-red {
          background-color: #fff5f5;
          color: #c53030;
          border: 1px solid #fca5a5;
        }

        /* ── BODY ── */
        .receipt-body {
          padding: 36px 36px;
          box-sizing: border-box;
        }
        .receipt-section {
          margin-bottom: 28px;
        }
        .section-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          box-sizing: border-box;
        }
        .section-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #99aacb;
          text-transform: uppercase;
          padding-right: 10px;
          white-space: nowrap;
        }
        .section-line {
          flex: 1;
          height: 1px;
          background: #e4eaf6;
        }
        .section-card {
          border: 1px solid #dde6f5;
          border-radius: 12px;
          overflow: hidden;
          box-sizing: border-box;
        }
        .section-card.payment {
          background: #f8faff;
        }
        
        /* ── ROWS ── */
        .pdf-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
          padding: 14px 20px;
        }
        .pdf-row.border-bottom {
          border-bottom: 1px solid #edf2fb;
        }
        .pdf-row.dashed-bottom {
          border-bottom: 1px dashed #dce7f7;
        }
        .pdf-row.bg-light {
          background-color: #f5f8ff;
        }
        .row-label {
          font-size: 15px;
          font-weight: 500;
          color: #7a8db5;
          line-height: 1.4;
        }
        .row-label.balance {
          font-size: 14.5px;
          font-weight: 600;
          color: #5a6f9a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .row-val {
          font-size: 17px;
          font-weight: 600;
          color: #1c2d5e;
          text-align: right;
          max-width: 70%;
          word-break: break-word;
          line-height: 1.4;
        }

        /* Remarks card */
        .remarks-card {
          background: #fffcf0;
          border: 1px solid #f5e4a0;
          border-radius: 10px;
          padding: 20px 24px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 28px;
        }
        .remarks-icon {
          font-size: 20px;
          line-height: 1;
        }
        .remarks-text {
          font-size: 15.5px;
          color: #7a6412;
          font-weight: 500;
          line-height: 1.55;
        }

        /* ── FOOTER ── */
        .receipt-footer {
          background: linear-gradient(135deg, #0a1a4a 0%, #0d2057 100%);
          padding: 24px 36px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }
        .footer-left {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.45);
          line-height: 1.7;
        }
        .footer-brand {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          margin-bottom: 2px;
          font-weight: 700;
        }
        .footer-note {
          display: block;
          color: rgba(255, 255, 255, 0.35);
          font-size: 11px;
          margin-top: 2px;
        }
        .seal-wrapper {
          width: 64px;
          height: 64px;
          border: 2px solid rgba(255, 255, 255, 0.18);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        .seal-text {
          font-size: 9.5px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.35);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          line-height: 1.3;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="receipt-card-container">
        
        <!-- HEADER -->
        <div class="receipt-header">
          <div class="header-top-row">
            <div class="logo-and-name">
              <div class="logo-wrapper">
                <img src="${logoDataUrl || 'https://commerce-gyan.vercel.app/logo.png'}" alt="Commerce Gyan" />
              </div>
              <div>
                <div class="brand-name">Commerce Gyan</div>
                <div class="brand-sub">Premium Coaching Center &middot; Katrasgarh, Dhanbad</div>
              </div>
            </div>
            <div class="receipt-badge">
              <div class="receipt-badge-title">Receipt No.</div>
              <div class="receipt-badge-no">${receipt.receiptNo}</div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="header-meta-row">
            <div class="meta-col left">
              <div class="meta-label">Payment Date</div>
              <div class="meta-val">${formatDate(payment ? payment.date : receipt.date)}</div>
            </div>
            <div class="meta-col center">
              <div class="meta-label">Payment Time</div>
              <div class="meta-val">${formatTime(payment ? payment.date : receipt.date)}</div>
            </div>
            <div class="meta-col right">
              <div class="meta-label">Issued To</div>
              <div class="meta-val">${student.name ? student.name.split(" ")[0] : "Student"}</div>
            </div>
          </div>
        </div>

        <!-- AMOUNT STRIP -->
        <div class="receipt-amount-strip">
          <div class="amount-info">
            <div class="amount-label">Amount Paid</div>
            <div class="amount-sub">For ${feeMonth} &middot; ${modeLabel}</div>
          </div>
          <div class="amount-val-container">
            <div class="amount-val">₹${payAmt.toLocaleString("en-IN")}</div>
            <span class="badge badge-paid-in-full">✓ Paid in Full</span>
          </div>
        </div>

        <!-- BODY -->
        <div class="receipt-body">
          
          <!-- Student Information -->
          <div class="receipt-section">
            <div class="section-header">
              <span class="section-title">Student Information</span>
              <div class="section-line"></div>
            </div>
            <div class="section-card">
              <div class="pdf-row border-bottom">
                <span class="row-label">Student Name</span>
                <span class="row-val">${student.name || "—"}</span>
              </div>
              <div class="pdf-row border-bottom">
                <span class="row-label">Registration No.</span>
                <span class="badge badge-mono">${student.registrationNumber || "—"}</span>
              </div>
              <div class="pdf-row border-bottom">
                <span class="row-label">Class / Stream</span>
                <span class="row-val">${student.className ? `${student.className} (${student.stream || "School"})` : "Commerce (School)"}</span>
              </div>
              <div class="pdf-row border-bottom">
                <span class="row-label">Enrolled Course</span>
                <span class="row-val">${course.title || "—"}</span>
              </div>
              <div class="pdf-row">
                <span class="row-label">Fee Month</span>
                <span class="badge badge-blue">${feeMonth}</span>
              </div>
            </div>
          </div>

          <!-- Payment Details -->
          <div class="receipt-section">
            <div class="section-header">
              <span class="section-title">Payment Details</span>
              <div class="section-line"></div>
            </div>
            <div class="section-card payment">
              <div class="pdf-row dashed-bottom">
                <span class="row-label">Payment Date</span>
                <span class="row-val">${formatDate(payment ? payment.date : receipt.date)}</span>
              </div>
              <div class="pdf-row dashed-bottom">
                <span class="row-label">Payment Time</span>
                <span class="row-val">${formatTime(payment ? payment.date : receipt.date)}</span>
              </div>
              <div class="pdf-row dashed-bottom">
                <span class="row-label">Payment Mode</span>
                <span class="badge badge-cash">${modeLabel}</span>
              </div>
              <div class="pdf-row">
                <span class="row-label">Reference Number</span>
                <span class="row-val" style="${receipt.referenceNumber ? '' : 'color: #b0bdd8; font-style: italic;'}">${receipt.referenceNumber || "N/A"}</span>
              </div>
            </div>
          </div>

          <!-- Remarks -->
          ${payment && payment.remarks ? `
            <div class="remarks-card">
              <span class="remarks-icon">📋</span>
              <div class="remarks-text"><strong>Remarks:</strong> ${payment.remarks}</div>
            </div>
          ` : ""}

          <!-- Balance Summary -->
          <div class="receipt-section">
            <div class="section-header">
              <span class="section-title">Balance Summary</span>
              <div class="section-line"></div>
            </div>
            <div class="section-card">
              <div class="pdf-row border-bottom">
                <span class="row-label balance">Outstanding (${feeMonth})</span>
                <span class="badge ${monthOutstanding > 0 ? 'badge-red' : 'badge-green'}">₹${monthOutstanding.toLocaleString("en-IN")}</span>
              </div>
              <div class="pdf-row bg-light">
                <span class="row-label balance">Total Outstanding Balance</span>
                <span class="badge ${totalOutstanding > 0 ? 'badge-red' : 'badge-green'}">₹${totalOutstanding.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- FOOTER -->
        <div class="receipt-footer">
          <div class="footer-left">
            <strong class="footer-brand">Commerce Gyan</strong>
            Katrasgarh, Dhanbad, Jharkhand
            <span class="footer-note">This is a computer-generated receipt &middot; No signature required</span>
          </div>
          <div class="seal-wrapper">
            <div class="seal-text">Official<br />Receipt</div>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;

  // Launch Puppeteer browser instance
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set page content directly on server side
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Wait for the Inter Google font to load in Puppeteer browser
    await page.evaluateHandle("document.fonts.ready");

    // Measure the exact layout height of the element
    const layoutHeight = await page.evaluate(() => {
      const container = document.querySelector(".receipt-card-container");
      return container ? container.getBoundingClientRect().height : 800;
    });

    // Generate the PDF from the element with identical dimensions
    const pdfBuffer = await page.pdf({
      width: "560px",
      height: `${layoutHeight}px`,
      printBackground: true,
      margin: {
        top: "0px",
        bottom: "0px",
        left: "0px",
        right: "0px"
      }
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = {
  generateReceiptPDF
};
