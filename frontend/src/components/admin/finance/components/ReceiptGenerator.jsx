"use client";
import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import API from "@/config/api";

function ReceiptCard({ ledger, payment, receiptNo, logoDataUrl, pdfMode }) {
  const { student, course } = ledger;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${String(d.getDate()).padStart(2,"0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2,"0")}:${m} ${ampm}`;
  };

  const getFeeMonth = () => {
    if (!payment) return "Statement";
    if (payment.month) return payment.month;
    if (payment.statement?.month) return payment.statement.month;
    if (payment.remarks) {
      const match = payment.remarks.match(/[A-Za-z]+ \d{4}/);
      if (match) return match[0];
    }
    return "Monthly";
  };

  const getFeeStatement = () => {
    if (!payment) return null;
    const monthName = getFeeMonth();
    if (ledger.monthlyBills) {
      return ledger.monthlyBills.find(
        (b) => b._id === payment.statement || b._id === payment.statement?._id || b.month === monthName
      );
    }
    return null;
  };

  const getPaymentModeLabel = (mode) => {
    if (!mode) return "—";
    if (mode === "Razorpay") return "Online Gateway";
    return mode;
  };

  const feeMonth = getFeeMonth();
  const statement = getFeeStatement();
  const payAmt = payment?.amount || 0;
  const mode = payment?.mode || "—";
  const modeLabel = getPaymentModeLabel(mode);

  const monthOutstanding = statement ? (statement.pendingAmount || 0) : 0;
  const totalOutstanding = (() => {
    const bills = ledger.monthlyBills || [];
    return bills.reduce((s, b) => s + (b.pendingAmount || 0), 0);
  })();

  // Sizing and typography tokens scaled for pdfMode
  const fontSizeBase = pdfMode ? "17px" : "13px";
  const fontSizeLabel = pdfMode ? "15px" : "12px";
  const fontSizeHeaderVal = pdfMode ? "17px" : "13px";
  const fontSizeHeaderLabel = pdfMode ? "11px" : "8.5px";
  const fontSizeSectionTitle = pdfMode ? "13px" : "9px";
  const fontSizeRemarks = pdfMode ? "15.5px" : "12px";

  const cardWidth = pdfMode ? "800px" : "100%";
  const cardMinHeight = pdfMode ? "1130px" : "auto";
  const cardPadding = pdfMode ? "36px 36px" : "24px 28px";
  const headerPadding = pdfMode ? "36px 36px 28px" : "28px 28px 22px";
  const amountPadding = pdfMode ? "32px 36px" : "24px 28px";
  const footerPadding = pdfMode ? "24px 36px" : "18px 28px";
  const sectionCardMargin = pdfMode ? "28px" : "20px";

  const rowHeight = pdfMode ? "56px" : "46px";
  const badgeH = pdfMode ? "38px" : "22px";
  const badgePadH = pdfMode ? "20px" : "12px";
  const badgeFontSize = pdfMode ? "13px" : "11px";

  const badgeStyle = (bgColor, textColor, borderColor, extra = {}) => {
    if (pdfMode) {
      return {
        display: "inline-block",
        boxSizing: "border-box",
        background: bgColor,
        color: textColor,
        border: borderColor ? `1px solid ${borderColor}` : "none",
        textAlign: "center",
        fontWeight: 700,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        borderRadius: "20px",
        paddingLeft: "20px",
        paddingRight: "20px",
        paddingTop: "9px",
        paddingBottom: "9px",
        fontSize: "13px",
        lineHeight: "1.2",
        verticalAlign: "middle",
        ...extra,
      };
    } else {
      return {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        background: bgColor,
        color: textColor,
        border: borderColor ? `1px solid ${borderColor}` : "none",
        textAlign: "center",
        fontWeight: 700,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        borderRadius: "20px",
        paddingLeft: badgePadH,
        paddingRight: badgePadH,
        height: badgeH,
        fontSize: badgeFontSize,
        lineHeight: 1,
        ...extra,
      };
    }
  };

  const rowValStyle = {
    fontSize: pdfMode ? "17px" : "13px",
    fontWeight: 600,
    color: "#1c2d5e",
    textAlign: "right",
    maxWidth: "100%",
    wordBreak: "break-word",
    whiteSpace: "normal",
    lineHeight: "1.4",
  };

  const PdfRow = ({ label, labelStyle, valueContent, borderBottom, background }) => {
    if (pdfMode) {
      return (
        <div style={{
          display: "table",
          width: "100%",
          borderBottom: borderBottom || "none",
          background: background || "transparent",
          boxSizing: "border-box",
        }}>
          <div style={{
            display: "table-cell",
            verticalAlign: "middle",
            boxSizing: "border-box",
            lineHeight: "1.4",
            padding: "14px 20px",
            ...labelStyle,
          }}>{label}</div>
          <div style={{
            display: "table-cell",
            textAlign: "right",
            verticalAlign: "middle",
            boxSizing: "border-box",
            lineHeight: "1.4",
            padding: "14px 20px",
          }}>{valueContent}</div>
        </div>
      );
    } else {
      return (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          borderBottom: borderBottom || "none",
          background: background || "transparent",
          boxSizing: "border-box",
          padding: "10px 16px",
          minHeight: rowHeight,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
            lineHeight: "1.4",
            ...labelStyle,
          }}>{label}</div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            textAlign: "right",
            boxSizing: "border-box",
            lineHeight: "1.4",
          }}>{valueContent}</div>
        </div>
      );
    }
  };

  return (
    <div
      className="receipt-card-container"
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        overflow: "hidden",
        width: cardWidth,
        minHeight: cardMinHeight,
        boxShadow: pdfMode ? "none" : "0 30px 80px rgba(5,12,40,0.5), 0 8px 24px rgba(5,12,40,0.3)",
        fontFamily: "Inter, Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div className="receipt-header" style={{
        background: "linear-gradient(135deg, #0a1a4a 0%, #1a3a8f 100%)",
        padding: headerPadding,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}>
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: "-70px", left: "-30px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(240,165,0,0.06)" }} />

        {pdfMode ? (
          <div style={{ display: "table", width: "100%", marginBottom: "24px", position: "relative", zIndex: 1, boxSizing: "border-box" }}>
            <div style={{ display: "table-cell", verticalAlign: "middle", width: "150px" }}>
              <div style={{
                width: "128px",
                height: "128px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
              }}>
                <img
                  src={logoDataUrl || "/logo.png"}
                  alt="Commerce Gyan"
                  style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
                />
              </div>
            </div>
            <div style={{ display: "table-cell", verticalAlign: "middle", boxSizing: "border-box" }}>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", letterSpacing: "1.5px", textTransform: "uppercase", lineHeight: 1.1 }}>Commerce Gyan</div>
              <div style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.55)", letterSpacing: "1.2px", textTransform: "uppercase", marginTop: "6px" }}>
                Premium Coaching Center · Katrasgarh, Dhanbad
              </div>
            </div>
            <div style={{ display: "table-cell", verticalAlign: "middle", textAlign: "right", width: "250px" }}>
              <div style={{
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "10px",
                padding: "12px 24px",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                minWidth: "230px",
              }}>
                <div style={{ fontSize: fontSizeHeaderLabel, fontWeight: 600, letterSpacing: "1.5px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", lineHeight: "16px" }}>Receipt No.</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginTop: "4px", whiteSpace: "nowrap", lineHeight: "22px" }}>{receiptNo}</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
            position: "relative",
            zIndex: 1,
            boxSizing: "border-box",
            gap: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{
                width: "100px",
                height: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
              }}>
                <img
                  src={logoDataUrl || "/logo.png"}
                  alt="Commerce Gyan"
                  style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
                />
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", letterSpacing: "1.5px", textTransform: "uppercase", lineHeight: 1.1 }}>Commerce Gyan</div>
                <div style={{ fontSize: "9.5px", fontWeight: 500, color: "rgba(255,255,255,0.55)", letterSpacing: "1.2px", textTransform: "uppercase", marginTop: "6px" }}>
                  Premium Coaching Center · Katrasgarh, Dhanbad
                </div>
              </div>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: "10px",
              padding: "8px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
              minWidth: "150px",
            }}>
              <div style={{ fontSize: fontSizeHeaderLabel, fontWeight: 600, letterSpacing: "1.5px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", lineHeight: "12px" }}>Receipt No.</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff", marginTop: "4px", whiteSpace: "nowrap", lineHeight: "16px" }}>{receiptNo}</div>
            </div>
          </div>
        )}

        <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: pdfMode ? "0 0 22px" : "0 0 16px", position: "relative", zIndex: 1 }} />

        {pdfMode ? (
          <div style={{ display: "table", width: "100%", position: "relative", zIndex: 1, boxSizing: "border-box" }}>
            <div style={{ display: "table-cell", textAlign: "left", width: "33.3%" }}>
              <div style={{ fontSize: fontSizeHeaderLabel, fontWeight: 600, letterSpacing: "1.3px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Payment Date</div>
              <div style={{ fontSize: fontSizeHeaderVal, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginTop: "3px" }}>{formatDate(payment?.date || new Date())}</div>
            </div>
            <div style={{ display: "table-cell", textAlign: "center", width: "33.4%" }}>
              <div style={{ fontSize: fontSizeHeaderLabel, fontWeight: 600, letterSpacing: "1.3px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Payment Time</div>
              <div style={{ fontSize: fontSizeHeaderVal, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginTop: "3px" }}>{formatTime(payment?.date || new Date())}</div>
            </div>
            <div style={{ display: "table-cell", textAlign: "right", width: "33.3%" }}>
              <div style={{ fontSize: fontSizeHeaderLabel, fontWeight: 600, letterSpacing: "1.3px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Issued To</div>
              <div style={{ fontSize: fontSizeHeaderVal, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginTop: "3px" }}>{student?.name?.split(" ")[0] || "Student"}</div>
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
            boxSizing: "border-box",
          }}>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: fontSizeHeaderLabel, fontWeight: 600, letterSpacing: "1.3px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Payment Date</div>
              <div style={{ fontSize: fontSizeHeaderVal, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginTop: "3px" }}>{formatDate(payment?.date || new Date())}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: fontSizeHeaderLabel, fontWeight: 600, letterSpacing: "1.3px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Payment Time</div>
              <div style={{ fontSize: fontSizeHeaderVal, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginTop: "3px" }}>{formatTime(payment?.date || new Date())}</div>
            </div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{ fontSize: fontSizeHeaderLabel, fontWeight: 600, letterSpacing: "1.3px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Issued To</div>
              <div style={{ fontSize: fontSizeHeaderVal, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginTop: "3px" }}>{student?.name?.split(" ")[0] || "Student"}</div>
            </div>
          </div>
        )}
      </div>

      {pdfMode ? (
        <div className="receipt-amount-strip" style={{
          background: "linear-gradient(135deg, #f6f9ff 0%, #edf2ff 100%)",
          padding: amountPadding,
          width: "100%",
          display: "table",
          borderBottom: "1px solid #dde6f5",
          boxSizing: "border-box",
        }}>
          <div style={{ display: "table-cell", verticalAlign: "middle" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1.6px", color: "#6879a8", textTransform: "uppercase" }}>Amount Paid</div>
            <div style={{ fontSize: "15px", color: "#99aacb", marginTop: "5px", fontWeight: 500 }}>
              For {feeMonth} · {modeLabel}
            </div>
          </div>
          <div style={{ display: "table-cell", verticalAlign: "middle", textAlign: "right" }}>
            <div style={{
              fontSize: "42px",
              fontWeight: 800,
              color: "#0d2057",
              letterSpacing: "-1px",
              lineHeight: "1",
              whiteSpace: "nowrap",
            }}>
              ₹{payAmt.toLocaleString("en-IN")}
            </div>
            <div style={{ marginTop: "8px" }}>
              <span style={badgeStyle("#e5f9ee", "#1a7a46", "#aee8c8")}>✓ Paid in Full</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="receipt-amount-strip" style={{
          background: "linear-gradient(135deg, #f6f9ff 0%, #edf2ff 100%)",
          padding: amountPadding,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #dde6f5",
          boxSizing: "border-box",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.6px", color: "#6879a8", textTransform: "uppercase" }}>Amount Paid</div>
            <div style={{ fontSize: "12px", color: "#99aacb", fontWeight: 500 }}>
              For {feeMonth} · {modeLabel}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", textAlign: "right" }}>
            <div style={{
              fontSize: "42px",
              fontWeight: 800,
              color: "#0d2057",
              letterSpacing: "-1px",
              lineHeight: "1",
              whiteSpace: "nowrap",
            }}>
              ₹{payAmt.toLocaleString("en-IN")}
            </div>
            <span style={badgeStyle("#e5f9ee", "#1a7a46", "#aee8c8")}>✓ Paid in Full</span>
          </div>
        </div>
      )}

      <div className="receipt-body" style={{ padding: cardPadding, boxSizing: "border-box" }}>

        {/* Student Information */}
        <div className="receipt-section">
          <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: "12px", boxSizing: "border-box" }}>
            <span style={{ fontSize: fontSizeSectionTitle, fontWeight: 700, letterSpacing: "2px", color: "#99aacb", textTransform: "uppercase", paddingRight: "10px", whiteSpace: "nowrap" }}>Student Information</span>
            <div style={{ flex: 1, height: "1px", background: "#e4eaf6" }} />
          </div>

          <div className="receipt-section-card" style={{ border: "1px solid #dde6f5", borderRadius: "12px", overflow: "hidden", marginBottom: sectionCardMargin, boxSizing: "border-box" }}>
            {[
              { k: "Student Name", v: student?.name || "—", type: "normal" },
              { k: "Registration No.", v: student?.registrationNumber || "—", type: "mono" },
              { k: "Class / Stream", v: student?.className ? `${student.className} (${student.stream || "School"})` : "Commerce (School)", type: "normal" },
              { k: "Enrolled Course", v: course?.title || "—", type: "normal" },
              { k: "Fee Month", v: feeMonth, type: "pill" },
            ].map(({ k, v, type }, i, arr) => {
              return (
                <PdfRow
                  key={k}
                  label={k}
                  labelStyle={{ fontSize: fontSizeLabel, fontWeight: 500, color: "#7a8db5" }}
                  borderBottom={i < arr.length - 1 ? "1px solid #edf2fb" : "none"}
                  valueContent={
                    type === "pill" ? (
                      <span style={badgeStyle("#eef3ff", "#1a3a8f")}>{v}</span>
                    ) : type === "mono" ? (
                      <span style={badgeStyle("#f2f5fb", "#5a6f9a", null, { fontFamily: "Consolas, Monaco, monospace", borderRadius: "6px" })}>{v}</span>
                    ) : (
                      <span style={rowValStyle}>{v}</span>
                    )
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Payment Details */}
        <div className="receipt-section">
          <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: "12px", boxSizing: "border-box" }}>
            <span style={{ fontSize: fontSizeSectionTitle, fontWeight: 700, letterSpacing: "2px", color: "#99aacb", textTransform: "uppercase", paddingRight: "10px", whiteSpace: "nowrap" }}>Payment Details</span>
            <div style={{ flex: 1, height: "1px", background: "#e4eaf6" }} />
          </div>

          <div className="receipt-section-card" style={{ background: "#f8faff", border: "1px solid #dde6f5", borderRadius: "12px", overflow: "hidden", marginBottom: sectionCardMargin, boxSizing: "border-box" }}>
            {[
              { k: "Payment Date", v: formatDate(payment?.date || new Date()), type: "normal" },
              { k: "Payment Time", v: formatTime(payment?.date || new Date()), type: "normal" },
              { k: "Payment Mode", v: modeLabel, type: mode === "Cash" ? "cash" : "normal" },
              { k: "Reference Number", v: mode === "Cash" ? "N/A" : (payment?.reference || payment?.remarks || "N/A"), type: mode === "Cash" ? "na" : "normal" },
            ].map(({ k, v, type }, i, arr) => {
              return (
                <PdfRow
                  key={k}
                  label={k}
                  labelStyle={{ fontSize: fontSizeLabel, fontWeight: 500, color: "#7a8db5" }}
                  borderBottom={i < arr.length - 1 ? "1px dashed #dce7f7" : "none"}
                  valueContent={
                    type === "cash" ? (
                      <span style={badgeStyle("#fff5e0", "#b87000", "#f5d88a")}>{v}</span>
                    ) : type === "na" ? (
                      <span style={{ color: "#b0bdd8", fontStyle: "italic", fontSize: pdfMode ? "16.5px" : "12.5px", fontWeight: 600 }}>{v}</span>
                    ) : (
                      <span style={rowValStyle}>{v}</span>
                    )
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Remarks */}
        {payment?.remarks && (
          <div className="receipt-section">
            <div className="receipt-section-card" style={{
              background: "#fffcf0", border: "1px solid #f5e4a0",
              borderRadius: "10px", padding: pdfMode ? "20px 24px" : "12px 16px",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              width: "100%",
              marginBottom: sectionCardMargin,
              boxSizing: "border-box",
            }}>
              <div style={{ fontSize: pdfMode ? "20px" : "15px", lineHeight: 1 }}>📋</div>
              <div style={{ fontSize: fontSizeRemarks, color: "#7a6412", fontWeight: 500, lineHeight: 1.55 }}>
                <strong style={{ color: "#5a4a00" }}>Remarks:</strong> {payment.remarks}
              </div>
            </div>
          </div>
        )}

        {/* Balance Summary */}
        <div className="receipt-section">
          <div style={{ display: "flex", alignItems: "center", width: "100%", marginBottom: "12px", boxSizing: "border-box" }}>
            <span style={{ fontSize: fontSizeSectionTitle, fontWeight: 700, letterSpacing: "2px", color: "#99aacb", textTransform: "uppercase", paddingRight: "10px", whiteSpace: "nowrap" }}>Balance Summary</span>
            <div style={{ flex: 1, height: "1px", background: "#e4eaf6" }} />
          </div>

          <div className="receipt-section-card" style={{ border: "1px solid #dde6f5", borderRadius: "12px", overflow: "hidden", boxSizing: "border-box" }}>
            {statement && (
              <PdfRow
                label={`Outstanding (${statement.month})`}
                labelStyle={{ fontSize: pdfMode ? "14.5px" : "11.5px", fontWeight: 600, color: "#5a6f9a", textTransform: "uppercase", letterSpacing: "0.5px" }}
                borderBottom="1px solid #edf2fb"
                valueContent={
                  <span style={badgeStyle(
                    monthOutstanding > 0 ? "#fff5f5" : "#e5f9ee",
                    monthOutstanding > 0 ? "#c53030" : "#1a7a46",
                    monthOutstanding > 0 ? "#fca5a5" : "#aee8c8"
                  )}>₹{monthOutstanding.toLocaleString("en-IN")}</span>
                }
              />
            )}
            <PdfRow
              label="Total Outstanding Balance"
              labelStyle={{ fontSize: pdfMode ? "14.5px" : "11.5px", fontWeight: 600, color: "#5a6f9a", textTransform: "uppercase", letterSpacing: "0.5px" }}
              background="#f5f8ff"
              valueContent={
                <span style={badgeStyle(
                  totalOutstanding > 0 ? "#fff5f5" : "#e5f9ee",
                  totalOutstanding > 0 ? "#c53030" : "#1a7a46",
                  totalOutstanding > 0 ? "#fca5a5" : "#aee8c8"
                )}>₹{totalOutstanding.toLocaleString("en-IN")}</span>
              }
            />
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      {pdfMode ? (
        <div className="receipt-footer" style={{
          background: "linear-gradient(135deg, #0a1a4a 0%, #0d2057 100%)",
          padding: footerPadding,
          display: "table",
          width: "100%",
          boxSizing: "border-box",
        }}>
          <div style={{
            display: "table-cell",
            verticalAlign: "middle",
            textAlign: "left",
            fontSize: "13px",
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.7
          }}>
            <strong style={{ display: "block", color: "rgba(255,255,255,0.8)", fontSize: "14px", marginBottom: "2px" }}>Commerce Gyan</strong>
            Katrasgarh, Dhanbad, Jharkhand
            <span style={{ display: "block", color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "2px" }}>
              This is a computer-generated receipt · No signature required
            </span>
          </div>
          <div style={{
            display: "table-cell",
            verticalAlign: "middle",
            textAlign: "right",
            width: "80px",
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              border: "2px solid rgba(255,255,255,0.18)",
              borderRadius: "50%",
              display: "table",
              boxSizing: "border-box",
            }}>
              <div style={{
                display: "table-cell",
                verticalAlign: "middle",
                textAlign: "center",
                fontSize: "9.5px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                lineHeight: 1.3,
              }}>
                Official<br />Receipt
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="receipt-footer" style={{
          background: "linear-gradient(135deg, #0a1a4a 0%, #0d2057 100%)",
          padding: footerPadding,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          boxSizing: "border-box",
        }}>
          <div style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.7
          }}>
            <strong style={{ display: "block", color: "rgba(255,255,255,0.8)", fontSize: "12px", marginBottom: "2px" }}>Commerce Gyan</strong>
            Katrasgarh, Dhanbad, Jharkhand
            <span style={{ display: "block", color: "rgba(255,255,255,0.35)", fontSize: "10px", marginTop: "2px" }}>
              This is a computer-generated receipt · No signature required
            </span>
          </div>
          <div style={{
            width: "52px",
            height: "52px",
            border: "2px solid rgba(255,255,255,0.18)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
          }}>
            <div style={{
              fontSize: "7.5px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              lineHeight: 1.3,
              textAlign: "center",
            }}>
              Official<br />Receipt
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReceiptGenerator({ ledger, payment, token, onClose }) {
  if (!ledger) return null;

  const receiptRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [dbReceipt, setDbReceipt] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/logo.png")
      .then((r) => r.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => setLogoDataUrl(reader.result);
        reader.readAsDataURL(blob);
      })
      .catch(() => {});
  }, []);

  // Fetch sequential receipt details from database
  useEffect(() => {
    if (payment && payment._id && token) {
      fetch(`${API}/api/fees/receipts/${payment._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Receipt not found");
        })
        .then((data) => setDbReceipt(data))
        .catch((err) => console.log("Error loading sequential receipt:", err));
    }
  }, [payment, token]);

  const receiptNo = dbReceipt?.receiptNo || (payment
    ? `CG-REC-${new Date(payment.date).getFullYear()}-${(payment._id || ledger._id || "XXXXXX").slice(-6).toUpperCase()}`
    : `CG-STMT-${new Date().getFullYear()}-${(ledger._id || "XXXXXX").slice(-6).toUpperCase()}`);

  const handleDownloadPDF = async () => {
    if (!payment?._id || downloading) return;
    setDownloading(true);

    try {
      const response = await fetch(`${API}/api/fees/receipts/${payment._id}/pdf`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Receipt-${receiptNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[PDF] generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      id="cg-receipt-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,12,40,0.85)",
        backdropFilter: "blur(6px)",
        zIndex: 100,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 0 !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
          }
          body > *:not(#cg-receipt-overlay) {
            display: none !important;
          }
          #cg-receipt-overlay {
            position: absolute !important;
            inset: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            background: #ffffff !important;
            backdrop-filter: none !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: auto !important;
          }
          #cg-action-bar {
            display: none !important;
          }
          #cg-receipt-pdf-capture {
            display: none !important;
          }
          #cg-receipt-print-wrapper {
            display: block !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            zoom: 0.94 !important; /* Slightly zoomed out to ensure edge printer safety */
          }
          .receipt-card-container {
            width: 100% !important;
            height: 100% !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
          }
          .receipt-header {
            padding: 18px 22px 14px !important;
          }
          .receipt-amount-strip {
            padding: 14px 22px !important;
          }
          .receipt-body {
            padding: 16px 22px !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
          }
          .receipt-section {
            margin-bottom: 10px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
          }
          .receipt-section-card {
            margin-bottom: 10px !important;
          }
          .receipt-payment-details-card {
            padding: 8px 12px !important;
            margin-bottom: 10px !important;
          }
          .receipt-row {
            padding: 8px 12px !important;
          }
          .receipt-payment-details-card .receipt-row {
            padding: 5px 0 !important;
          }
          .receipt-footer {
            padding: 12px 22px !important;
            margin-top: auto !important;
          }
        }
      `}} />

      {/* ── STICKY ACTION BAR ── */}
      <div
        id="cg-action-bar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(5,12,40,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        {/* Back button */}
        <button
          onClick={onClose}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "8px 16px", borderRadius: "9px",
            background: "rgba(255,255,255,0.10)",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.18)",
            fontSize: "13px", fontWeight: 600,
            cursor: "pointer", letterSpacing: "0.2px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>

        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>
          Fee Receipt
        </span>

        {/* Download PDF button */}
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "8px 18px", borderRadius: "9px", border: "none",
            background: downloading ? "#c98d00" : "#f0a500",
            color: "#1a1a1a",
            fontSize: "13px", fontWeight: 600,
            cursor: downloading ? "not-allowed" : "pointer",
            letterSpacing: "0.2px",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 4px 14px rgba(240,165,0,0.35)",
            opacity: downloading ? 0.8 : 1,
            transition: "all 0.2s",
          }}
        >
          {downloading ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10" style={{ animation: "spin 1s linear infinite" }}/>
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* ── RECEIPT WRAPPER FOR ON-SCREEN PREVIEW ── */}
      <div
        id="cg-receipt-print-wrapper"
        style={{
          width: "100%",
          maxWidth: "560px",
          margin: "24px auto",
          padding: "0 16px 40px",
        }}
      >
        <div ref={receiptRef}>
          <ReceiptCard
            ledger={ledger}
            payment={payment}
            receiptNo={receiptNo}
            logoDataUrl={logoDataUrl}
            pdfMode={false}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
