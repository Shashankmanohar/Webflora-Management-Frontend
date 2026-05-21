import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import { formatDate } from "./dateUtils";

// =========================================================================
// GLOBAL PREMIUM BRAND STYLING UTILITIES
// =========================================================================

// Primary Brand Accent: Brand Orange (#ff3c00) -> RGB (255, 60, 0)
const BRAND_ORANGE_RGB = [255, 60, 0];
const SLATE_900_RGB = [15, 23, 42];
const SLATE_600_RGB = [71, 85, 105];
const SLATE_400_RGB = [148, 163, 184];
const SLATE_200_RGB = [226, 232, 240];
const SLATE_100_RGB = [241, 245, 249];
const SLATE_50_RGB = [248, 250, 252];
const ORANGE_50_RGB = [255, 247, 237]; // Soft Warm Cream

// Helper for Indian Rupees currency formatting
const formatCurrency = (amount: number) => {
    return "Rs. " + new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

// Helper to strip leading numbers from clause titles (prevents "1. 1. Intellectual Property")
const getCleanClauseTitle = (title: string) => {
    if (!title) return "";
    return title.replace(/^\d+[\.\s\d\.]*/, "").trim();
};

// Draws a premium corporate double-lined border with L-shaped brand corner ticks
const drawPageBorder = (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12; // Elegant uniform 12mm boundary

    doc.saveGraphicsState();

    // 1. Outer Frame (Thin Slate line)
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.setLineWidth(0.35);
    doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin, "S");

    // 2. Inner Frame (Faint Slate line)
    doc.setDrawColor(SLATE_100_RGB[0], SLATE_100_RGB[1], SLATE_100_RGB[2]);
    doc.setLineWidth(0.15);
    doc.rect(margin + 0.8, margin + 0.8, pageWidth - 2 * margin - 1.6, pageHeight - 2 * margin - 1.6, "S");

    // 3. Brand Orange L-shaped Corner Tick Accents
    doc.setDrawColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.setLineWidth(0.9);
    const tickLen = 4.5; // 4.5mm ticks

    // Top-Left
    doc.line(margin, margin, margin + tickLen, margin);
    doc.line(margin, margin, margin, margin + tickLen);

    // Top-Right
    doc.line(pageWidth - margin, margin, pageWidth - margin - tickLen, margin);
    doc.line(pageWidth - margin, margin, pageWidth - margin, margin + tickLen);

    // Bottom-Left
    doc.line(margin, pageHeight - margin, margin + tickLen, pageHeight - margin);
    doc.line(margin, pageHeight - margin, margin, pageHeight - margin - tickLen);

    // Bottom-Right
    doc.line(pageWidth - margin, pageHeight - margin, pageWidth - margin - tickLen, pageHeight - margin);
    doc.line(pageWidth - margin, pageHeight - margin, pageWidth - margin, pageHeight - margin - tickLen);

    doc.restoreGraphicsState();
};

// Renders an extremely subtle rotated diagonal security background watermark
const drawSecurityWatermark = (doc: jsPDF, text = "SECURED WEBFLORA DIGITAL ARCHIVE") => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.saveGraphicsState();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    // Extemely light grey - perfectly faint to avoid distracting from body text
    doc.setTextColor(244, 245, 247); 

    doc.text(text, pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: 42
    });
    doc.restoreGraphicsState();
};

// Renders a modern corporate header branding with absolute fallback stability
const drawCorporateHeaderLogo = (doc: jsPDF, x: number, y: number) => {
    const logoUrl = "/Blacktextlogo.jpeg";
    const msmeLogoUrl = "/msme-logo.png";
    
    try {
        doc.addImage(logoUrl, "JPEG", x, y, 45, 12);
    } catch (e) {
        // High-end vector fallback brand logo
        doc.saveGraphicsState();
        doc.setFillColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
        doc.rect(x, y, 3.5, 3.5, "F");
        doc.rect(x + 4.5, y, 3.5, 3.5, "F");
        doc.rect(x, y + 4.5, 3.5, 3.5, "F");
        doc.rect(x + 4.5, y + 4.5, 3.5, 3.5, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
        doc.text("WEBFLORA", x + 11, y + 4.5);
        doc.setFontSize(8.5);
        doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
        doc.text("TECHNOLOGIES", x + 11, y + 9);
        doc.restoreGraphicsState();
    }

    try {
        // Render MSME logo next to corporate logo with preserved 5:4 aspect ratio (15mm x 12mm) and aligned vertically
        doc.addImage(msmeLogoUrl, "PNG", x + 48, y, 15, 12);
    } catch (e) {
        console.error("Failed to load MSME logo in PDF generator", e);
    }
};

// Renders a section header with an elegant orange solid rectangle bullet
const drawSectionHeader = (doc: jsPDF, title: string, x: number, y: number, fontSize = 9.5) => {
    doc.saveGraphicsState();
    
    // Brand Orange Indicator Bullet
    doc.setFillColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.rect(x, y - 3.2, 2.2, 3.6, "F");

    // Header Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text(title, x + 4, y);

    // Subtle horizontal divider line
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.setLineWidth(0.4);
    doc.line(x, y + 2.5, doc.internal.pageSize.getWidth() - x, y + 2.5);

    doc.restoreGraphicsState();
};

// Real scannable QR Code generation handled via qrcode library dynamically.


// =========================================================================
// 1. GENERATE INVOICE PDF
// =========================================================================
export const generateInvoicePDF = (invoice: any) => {
    if (!invoice) return;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background watermarks and outer border frame
    drawSecurityWatermark(doc, "SECURED WEBFLORA INVOICE");
    drawPageBorder(doc);

    // 1. Branding Header
    drawCorporateHeaderLogo(doc, 20, 18);

    // Company Registry details (Right aligned, Elegant Slate Text)
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text("Webflora Technologies Private Limited", pageWidth - 20, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    doc.text([
        "IOC Colony, Kumhrar, Patna, Bihar, 800026",
        "Email: hello.webflora@gmail.com",
        "Website: www.webfloratechnologies.com"
    ], pageWidth - 20, 24, { align: "right", lineHeightFactor: 1.3 });

    // Divider Line (Subtle Slate Accent)
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.setLineWidth(0.4);
    doc.line(20, 40, pageWidth - 20, 40);

    // 2. Document Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text("INVOICE", 20, 52);

    // Document Meta Block (Side-by-side with Bill To)
    const metaY = 60;
    doc.setFillColor(SLATE_50_RGB[0], SLATE_50_RGB[1], SLATE_50_RGB[2]);
    doc.rect(20, metaY, 80, 28, "F");
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.setLineWidth(0.35);
    doc.rect(20, metaY, 80, 28, "S");

    doc.setFontSize(8.5);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE DETAILS", 24, metaY + 6);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    doc.text(`Invoice No :  ${invoice.number || "WF-INV-N/A"}`, 24, metaY + 12);
    doc.text(`Issue Date :  ${formatDate(invoice.date)}`, 24, metaY + 17);

    const statusText = (invoice.status || "PAID").toUpperCase();
    doc.text("Payment Status :", 24, metaY + 22);
    doc.setFont("helvetica", "bold");
    if (statusText === "PAID") {
        doc.setTextColor(22, 163, 74); // Green 600
        doc.text("PAID", 49, metaY + 22);
    } else {
        doc.setTextColor(220, 38, 38); // Red 600
        doc.text("DUE", 49, metaY + 22);
    }

    // 3. Billing Info (Right Card, symmetrical to Meta)
    doc.setFillColor(SLATE_50_RGB[0], SLATE_50_RGB[1], SLATE_50_RGB[2]);
    doc.rect(pageWidth - 100, metaY, 80, 28, "F");
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.rect(pageWidth - 100, metaY, 80, 28, "S");

    doc.setFontSize(8.5);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO CLIENT", pageWidth - 96, metaY + 6);

    doc.setFontSize(9);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    const clientNameText = (invoice.clientName || "Valued Client").substring(0, 38);
    doc.text(clientNameText, pageWidth - 96, metaY + 12);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    const projectSub = (invoice.projectName || "IT Development Project").substring(0, 42);
    doc.text(projectSub, pageWidth - 96, metaY + 17);

    // Wrapped address logic to ensure it doesn't overflow client card boundaries
    const clientAddrStr = invoice.address || "Tax Registrant Client Partner";
    const splitClientAddr = doc.splitTextToSize(clientAddrStr, 72);
    doc.text(splitClientAddr[0] || "", pageWidth - 96, metaY + 22);

    // 4. Items Table
    let tableColumn: string[] = [];
    const tableRows: any[] = [];
    const previousDue = Number(invoice.previousDue) || 0;
    const breakdown = invoice.dueBreakdown || [];
    const projectTotal = Number(invoice.projectTotal || invoice.amount || 0);
    const hasItems = invoice.items && invoice.items.length > 0;

    let colStyles: any = {};

    if (hasItems) {
        tableColumn = ["Service Description", "Units", "Amount (INR)"];
        invoice.items.forEach((item: any) => {
            tableRows.push([
                item.service || "Technical Support Services",
                item.units || "1",
                formatCurrency(item.price || 0)
            ]);
        });

        if (breakdown.length > 0) {
            breakdown.forEach((item: any) => {
                const itemName = `Outstanding Balance of ${item.projectName}`;
                if (!invoice.items.some((i: any) => i.service === itemName || i.service === item.projectName)) {
                    tableRows.push([
                        itemName,
                        "1",
                        formatCurrency(item.amount || 0)
                    ]);
                }
            });
        }
        
        colStyles = {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 35, halign: 'center' },
            2: { cellWidth: 40, halign: 'right' },
        };
    } else {
        tableColumn = ["Sl", "Service Description", "Qty", "Unit Price", "Total Amount"];
        let sl = 1;
        tableRows.push([
            (sl++).toString(),
            invoice.projectName || invoice.description || "Custom IT Application Development",
            "1",
            formatCurrency(projectTotal),
            formatCurrency(projectTotal),
        ]);

        if (breakdown.length > 0) {
            breakdown.forEach((item: any) => {
                tableRows.push([
                    (sl++).toString(),
                    `Outstanding Balance of ${item.projectName || "Previous Services"}`,
                    "1",
                    formatCurrency(item.amount || 0),
                    formatCurrency(item.amount || 0)
                ]);
            });
        } else if (previousDue > 0) {
            tableRows.push([
                (sl++).toString(),
                "Previous Outstanding Dues",
                "1",
                formatCurrency(previousDue),
                formatCurrency(previousDue)
            ]);
        }
        
        colStyles = {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 35, halign: 'right' },
            4: { cellWidth: 35, halign: 'right' },
        };
    }

    autoTable(doc, {
        startY: 96,
        head: [tableColumn],
        body: tableRows,
        theme: "plain",
        styles: {
            fontSize: 8,
            cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
            textColor: [71, 85, 105],
            valign: 'middle'
        },
        columnStyles: colStyles,
        headStyles: {
            fillColor: [30, 41, 59], // Navy Slate
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        margin: { left: 20, right: 20 },
    });

    // 5. Financial Summary Box (Right) & Payment Info (Left)
    const finalY = (doc as any).lastAutoTable?.finalY || 130;
    const currentInvoiceAmount = Number(invoice.amount || 0);
    const grandTotal = invoice.grandTotal !== undefined ? Number(invoice.grandTotal) : (currentInvoiceAmount + previousDue);

    let paidAmount = statusText === 'PAID' ? grandTotal : 0;
    let dueAmount = grandTotal - paidAmount;

    const boxHeight = 34;
    const boxY = finalY + 10;

    // soft orange-cream financial summary card
    doc.setFillColor(ORANGE_50_RGB[0], ORANGE_50_RGB[1], ORANGE_50_RGB[2]);
    doc.rect(pageWidth - 85, boxY, 65, boxHeight, "F");
    doc.setDrawColor(254, 215, 170); // Orange 200
    doc.setLineWidth(0.35);
    doc.rect(pageWidth - 85, boxY, 65, boxHeight, "S");

    let currentY = boxY + 7;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");

    // Total Invoice
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    doc.text("Invoice Total :", pageWidth - 80, currentY);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text(formatCurrency(grandTotal), pageWidth - 25, currentY, { align: "right" });

    currentY += 6.5;

    // Amount Paid
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    doc.text("Disbursement :", pageWidth - 80, currentY);
    doc.setTextColor(22, 163, 74); // Green
    doc.text(formatCurrency(paidAmount), pageWidth - 25, currentY, { align: "right" });

    // Accent line
    currentY += 3.5;
    doc.setDrawColor(254, 215, 170);
    doc.setLineWidth(0.35);
    doc.line(pageWidth - 80, currentY, pageWidth - 25, currentY);
    currentY += 6.5;

    // Remaining Balance
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.setFontSize(8.5);
    doc.text("Balance Due :", pageWidth - 80, currentY);
    doc.setTextColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.text(formatCurrency(dueAmount), pageWidth - 25, currentY, { align: "right" });

    // Payment Info Frame or Certified stamp (Left side)
    if (dueAmount > 0 || statusText === 'DUE') {
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
        doc.text("PAYMENT SETTLEMENT METHOD", 20, boxY + 5);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
        doc.setFontSize(8);
        doc.text([
            "UPI Transfer Network or Electronic Wire Settlement",
            "Secured Corporate UPI :  8540814729@upi",
            "Wire Account Registry :  Webflora Technologies"
        ], 20, boxY + 11, { lineHeightFactor: 1.4 });
    } else {
        // Certified stamp
        doc.setDrawColor(22, 163, 74);
        doc.setLineWidth(0.5);
        doc.rect(20, boxY + 4, 55, 24, "S");
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 163, 74);
        doc.text("TRANSACTION CERTIFIED", 47.5, boxY + 13, { align: "center" });
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text("ELECTRONIC ASSENT REGISTERED", 47.5, boxY + 20, { align: "center" });
    }

    // 6. Professional Footer
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.setLineWidth(0.4);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_400_RGB[0], SLATE_400_RGB[1], SLATE_400_RGB[2]);
    doc.text("This is an electronically generated secured tax document. No handwritten signature is required.", pageWidth / 2, pageHeight - 14, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.text("Thank you for partnering with Webflora Technologies!", pageWidth / 2, pageHeight - 9, { align: "center" });

    doc.save(`Invoice_${invoice.number || '000'}.pdf`);
};

// =========================================================================
// 2. GENERATE QUOTATION PDF
// =========================================================================
export const generateQuotationPDF = (quotation: any) => {
    if (!quotation) return;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background watermarks and outer border frame
    drawSecurityWatermark(doc, "SECURED WEBFLORA ESTIMATION");
    drawPageBorder(doc);

    // 1. Branding Header
    drawCorporateHeaderLogo(doc, 20, 18);

    // Company details (Right aligned, Elegant Slate Text)
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text("Webflora Technologies Private Limited", pageWidth - 20, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    doc.text([
        "IOC Colony, Kumhrar, Patna, Bihar, 800026",
        "Email: hello.webflora@gmail.com",
        "Website: www.webfloratechnologies.com"
    ], pageWidth - 20, 24, { align: "right", lineHeightFactor: 1.3 });

    // Divider Line
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.setLineWidth(0.4);
    doc.line(20, 40, pageWidth - 20, 40);

    // 2. Document Title & Key Meta
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text("QUOTATION", 20, 52);

    // Document Meta Block (Side-by-side with Lead Info)
    const metaY = 60;
    doc.setFillColor(SLATE_50_RGB[0], SLATE_50_RGB[1], SLATE_50_RGB[2]);
    doc.rect(20, metaY, 80, 28, "F");
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.setLineWidth(0.35);
    doc.rect(20, metaY, 80, 28, "S");

    doc.setFontSize(8.5);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.setFont("helvetica", "bold");
    doc.text("QUOTATION DETAILS", 24, metaY + 6);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    doc.text(`Quotation No :  ${quotation.quotationNo || "WF-QT-N/A"}`, 24, metaY + 12);
    doc.text(`Created Date :  ${formatDate(quotation.date)}`, 24, metaY + 17);
    if (quotation.validUntil) {
        doc.text(`Valid Dues  :  ${formatDate(quotation.validUntil)}`, 24, metaY + 22);
    } else {
        doc.text("Validity Period:  30 Days from date", 24, metaY + 22);
    }

    // 3. Lead Info (Client Address block)
    doc.setFillColor(SLATE_50_RGB[0], SLATE_50_RGB[1], SLATE_50_RGB[2]);
    doc.rect(pageWidth - 100, metaY, 80, 28, "F");
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.rect(pageWidth - 100, metaY, 80, 28, "S");

    doc.setFontSize(8.5);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.setFont("helvetica", "bold");
    doc.text("QUOTED TO PARTNER", pageWidth - 96, metaY + 6);

    doc.setFontSize(9);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    const leadName = quotation.leadId?.leadName || "Valued Customer Partner";
    doc.text(leadName.substring(0, 38), pageWidth - 96, metaY + 12);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    if (quotation.leadId?.email) {
        doc.text(quotation.leadId.email.substring(0, 42), pageWidth - 96, metaY + 17);
    } else {
        doc.text("Corporate Technical Lead Client", pageWidth - 96, metaY + 17);
    }
    if (quotation.leadId?.contactNumber) {
        doc.text(`Contact: ${quotation.leadId.contactNumber}`, pageWidth - 96, metaY + 22);
    } else {
        doc.text("Verified Identity Dues Record", pageWidth - 96, metaY + 22);
    }

    // 4. Items Table
    const tableColumn = ["Service Stage", "Description / Modules", "Qty", "Unit Cost", "Subtotal (INR)"];
    const tableRows = quotation.items.map((item: any) => [
        item.service || "IT Service Solution",
        item.description || "Standard platform architecture sprints implementation.",
        item.quantity || "1",
        formatCurrency(item.price || 0),
        formatCurrency(item.amount || 0)
    ]);

    autoTable(doc, {
        startY: 96,
        head: [tableColumn],
        body: tableRows,
        theme: "plain",
        styles: {
            fontSize: 8,
            cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
            textColor: [71, 85, 105],
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 32, halign: 'right' },
            4: { cellWidth: 32, halign: 'right' },
        },
        headStyles: {
            fillColor: [30, 41, 59], // Slate 800 Navy
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        margin: { left: 20, right: 20 },
    });

    // 5. Financial Summary & Notes
    const finalY = (doc as any).lastAutoTable?.finalY || 130;
    const totalAmount = Number(quotation.totalAmount || 0);

    const boxY = finalY + 10;

    doc.setFillColor(ORANGE_50_RGB[0], ORANGE_50_RGB[1], ORANGE_50_RGB[2]);
    doc.rect(pageWidth - 85, boxY, 65, 16, "F");
    doc.setDrawColor(254, 215, 170);
    doc.rect(pageWidth - 85, boxY, 65, 16, "S");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text("Estimated Dues :", pageWidth - 80, boxY + 10);
    doc.setTextColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.text(formatCurrency(totalAmount), pageWidth - 25, boxY + 10, { align: "right" });

    // Terms / Protocols (graceful fallback)
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    doc.text("OFFER TERMS & PROTOCOLS", 20, boxY + 5);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    doc.setFontSize(8);
    
    if (quotation.notes && quotation.notes.trim()) {
        const splitNotes = doc.splitTextToSize(quotation.notes, 95);
        doc.text(splitNotes, 20, boxY + 11, { lineHeightFactor: 1.4 });
    } else {
        doc.text([
            "1. Standard payment split: 50% advance mobilization deposit, 50% on completion.",
            "2. Development commences immediately on receiving final approved graphic layouts.",
            "3. Ongoing support services run under separate visual SLA retainer agreements."
        ], 20, boxY + 11, { lineHeightFactor: 1.4 });
    }

    // 6. Professional Footer
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.setLineWidth(0.4);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_400_RGB[0], SLATE_400_RGB[1], SLATE_400_RGB[2]);
    doc.text("This estimation is a formal draft proposal valid under the specified date guidelines.", pageWidth / 2, pageHeight - 14, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.text("Looking forward to building a premium digital environment with you!", pageWidth / 2, pageHeight - 9, { align: "center" });

    doc.save(`Quotation_${quotation.quotationNo || '000'}.pdf`);
};

// =========================================================================
// 3. GENERATE AGREEMENT PDF (Redesigned with Layout Budget & Auto-Compactor)
// =========================================================================
export const generateAgreementPDF = async (agreement: any) => {
    if (!agreement) return;

    // Generate real scannable QR code
    let qrDataUrl = "";
    try {
        qrDataUrl = await QRCode.toDataURL(`https://webfloratechnologies.com/?verify=${agreement.agreementId || "WT-AGR-N/A"}`, {
            margin: 1,
            color: {
                dark: "#0f172a", // Slate 900
                light: "#ffffff" // White
            }
        });
    } catch (err) {
        console.error("Failed to generate real QR code", err);
    }

    // Initialize portrait A4 document
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });
    const pageWidth = doc.internal.pageSize.getWidth(); // 210
    const pageHeight = doc.internal.pageSize.getHeight(); // 297

    // Helper to format date cleanly with a fallback
    const formatDateToText = (dateInput: any, defaultText: string) => {
        if (!dateInput) return defaultText;
        try {
            return formatDate(dateInput);
        } catch (e) {
            return defaultText;
        }
    };

    // -------------------------------------------------------------
    // LEGALLY-SOUND WEBFLORA BRANDING FALLBACKS FOR BLANK FIELDS
    // -------------------------------------------------------------
    const companyName = agreement.companyInfo?.companyName?.trim() || "Webflora Technologies Private Limited";
    const companyAuthRep = agreement.companyInfo?.authPersonName?.trim() || "Shashank Manohar";
    const companyAuthDesig = agreement.companyInfo?.authPersonDesignation?.trim() || "Managing Director";
    
    const companyAddress = agreement.companyInfo?.companyAddress?.trim() || "IOC Colony, Kumhrar";
    const companyCity = agreement.companyInfo?.city?.trim() || "Patna";
    const companyState = agreement.companyInfo?.state?.trim() || "Bihar";
    const companyZip = agreement.companyInfo?.zip?.trim() || "800026";
    
    const cleanAddressParts = (parts: string[]) => {
        const unique: string[] = [];
        parts.forEach((p) => {
            const trimmed = p.trim();
            if (trimmed && !unique.some(u => u.toLowerCase().includes(trimmed.toLowerCase()) || trimmed.toLowerCase().includes(u.toLowerCase()))) {
                unique.push(trimmed);
            }
        });
        return unique.join(", ");
    };

    const companyAddrParts = [companyAddress, companyCity, companyState, companyZip].filter(Boolean);
    const companyFullAddress = cleanAddressParts(companyAddrParts) || "IOC Colony, Kumhrar, Patna, Bihar - 800026";

    const clientCompanyName = agreement.clientInfo?.companyName?.trim() || agreement.clientInfo?.clientName?.trim() || "Valued Enterprise Client";
    const clientName = agreement.clientInfo?.clientName?.trim() || "Authorized Representative";
    const clientDesig = agreement.clientInfo?.clientDesignation?.trim() || "Director";
    
    const clientAddress = agreement.clientInfo?.address?.trim() || "";
    const clientCity = agreement.clientInfo?.city?.trim() || "Corporate Base";
    const clientState = agreement.clientInfo?.state?.trim() || "";
    const clientZip = agreement.clientInfo?.zipCode?.trim() || "";
    
    const clientAddrParts = [clientAddress, clientCity, clientState, clientZip].filter(Boolean);
    const clientFullAddress = cleanAddressParts(clientAddrParts) || "Corporate Base (Client Operational Site)";

    const projectTitle = agreement.projectInfo?.title?.trim() || "Custom Enterprise Software Engineering Services";
    
    const providerName = companyName;
    const receiverName = clientCompanyName;

    // Construct Clauses dynamically with beautiful spacing and alignment
    const scopeText = agreement.projectInfo?.description?.trim()
        ? `${providerName} will provide customized software engineering, technical development, and release support for the "${projectTitle}" project as defined under the system specification, while ${receiverName} will handle internal operations, asset provisioning, and client-side testing parameters.`
        : `${providerName} will provide customized software engineering, technical development, and release support, while ${receiverName} will handle internal operations, asset provisioning, and client-side testing parameters.`;

    const startDateText = formatDateToText(agreement.timeline?.startDate, formatDate(new Date()));
    const endDateText = formatDateToText(agreement.timeline?.endDate, formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)));
    
    const rawNotice = (agreement.serviceCommitment?.noticePeriod || "30").toString().trim();
    const isOnlyDigits = /^\d+$/.test(rawNotice);
    const durationText = isOnlyDigits 
        ? `This Agreement shall commence on ${startDateText}, and continue until ${endDateText}, or until terminated by either party with ${rawNotice} days' written notice.`
        : `This Agreement shall commence on ${startDateText}, and continue until ${endDateText}, or until terminated by either party with ${rawNotice}.`;

    const baseValue = Number(agreement.payment?.totalCost) || 0;
    const disc = Number(agreement.payment?.discount) || 0;
    const grandTotal = baseValue - disc;

    const totalFee = grandTotal > 0 ? formatCurrency(grandTotal) : "Custom Contract Dues";
    const payTermsText = agreement.payment?.paymentTerms?.trim() || "Payments are to be made in accordance with the specified phase structure upon invoice generation.";
    
    let paymentText = `${receiverName} agrees to pay ${providerName} a total contract fee of ${totalFee} for the technical services rendered. ${payTermsText}`;
    if (!paymentText.toLowerCase().includes("all invoices sent to you")) {
        paymentText += " All invoices sent to you, then you have to make payment.";
    }

    const confText = "Both parties agree to treat all business documents, trade secrets, software methodologies, and client lists shared during the project duration as private and confidential. No information shall be shared with third parties without prior written consent.";
    const termText = isOnlyDigits
        ? `Either party may terminate this Agreement upon giving ${rawNotice} days' written notice to the other party.`
        : `Either party may terminate this Agreement upon giving ${rawNotice} to the other party.`;
    
    const jurisdiction = agreement.companyInfo?.state && agreement.companyInfo?.city
        ? `the laws of India, under the exclusive jurisdiction of the judicial courts located in ${agreement.companyInfo.city}, ${agreement.companyInfo.state}`
        : "the laws of India, under the exclusive jurisdiction of the judicial courts located in Patna, Bihar";
    const govText = `This Agreement shall be governed by and construed in accordance with ${jurisdiction}.`;

    const amendText = "Any amendments to this Agreement must be made in writing and signed by both parties.";
    const sigText = "Both parties agree to the terms outlined in this Agreement and acknowledge their understanding and acceptance by signing below.";

    const companySignDate = formatDateToText(agreement.createdAt, formatDate(new Date()));
    const clientSignDate = agreement.digitalSignature?.signedAt 
        ? formatDateToText(agreement.digitalSignature.signedAt, companySignDate) 
        : companySignDate;

    // -------------------------------------------------------------------------
    // DYNAMIC AUTO-COMPACTOR ENGINE (PAGE 1)
    // -------------------------------------------------------------------------
    const cardWidth = pageWidth - 48; // 162mm readable width
    
    // Initial standard layout measurements
    let fontSize = 8.5;
    let lineSpacing = 4.4;
    let partyCardHeight = 25;
    let durationCardHeight = 20;
    let financialCardHeight = 32;
    let gapSpacing = 5;
    let textLineHeight = 1.35;

    // Use a temporary measure document to predict heights
    const tempDoc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    tempDoc.setFont("helvetica", "normal");
    tempDoc.setFontSize(8.5);

    const projectScopeDescVal = agreement.projectInfo?.description?.trim() || "A professional IT Service Agreement Management System designed for IT companies, software agencies, and digital service providers to create, manage, generate, and export legally formatted agreements dynamically through a form-based admin panel.";
    const splitScopeDescTemp = tempDoc.splitTextToSize(projectScopeDescVal, cardWidth);
    const splitScopeTemp = tempDoc.splitTextToSize(scopeText, cardWidth);
    const splitDurationTemp = tempDoc.splitTextToSize(durationText, cardWidth - 8);
    const splitPaymentTemp = tempDoc.splitTextToSize(paymentText, cardWidth - 75); // Leave right column space for calculations

    const L1 = splitScopeDescTemp.length;
    const L2 = splitScopeTemp.length;
    const L_dur = splitDurationTemp.length;
    const L_pay = splitPaymentTemp.length;

    // Calculate dynamic vertical height of elements
    let expectedHeight = 14 // Title Reference Box
        + partyCardHeight * 2 + 8 // Providers cards + padding
        + 6 // Section 01 Header
        + 10 // Classification fields
        + 5 // Scope title padding
        + L1 * lineSpacing
        + 5 // Scope text title padding
        + L2 * lineSpacing
        + 8 // Section 02 Header + padding
        + durationCardHeight + 5
        + 8 // Section 03 Header + padding
        + financialCardHeight;

    // If expected height exceeds available vertical space (220mm), compress dynamically!
    if (expectedHeight > 220) {
        const ratio = 220 / expectedHeight;
        fontSize = Math.max(7.2, 8.5 * ratio);
        lineSpacing = Math.max(3.6, 4.4 * ratio);
        partyCardHeight = Math.max(20, 25 * ratio);
        durationCardHeight = Math.max(16, 20 * ratio);
        financialCardHeight = Math.max(26, 32 * ratio);
        gapSpacing = Math.max(3.2, 5 * ratio);
        textLineHeight = Math.max(1.15, 1.35 * ratio);
    }

    // -------------------------------------------------------------------------
    // PAGE 1 ASSEMBLY
    // -------------------------------------------------------------------------
    drawSecurityWatermark(doc, "SECURED WEBFLORA LEGAL CONTRACT");
    drawPageBorder(doc);

    // 1. Top Meta Header
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(SLATE_400_RGB[0], SLATE_400_RGB[1], SLATE_400_RGB[2]);
    doc.text("AGREEMENT ID: " + (agreement.agreementId || "WT-AGR-2026-0006"), 24, 15);
    doc.text("WEBFLORA LEGAL ARCHIVES  •  SECURED DIGITAL CONTRACT", pageWidth - 24, 15, { align: "right" });
    
    // Thin horizontal line under Top Meta
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.setLineWidth(0.4);
    doc.line(24, 17, pageWidth - 24, 17);

    // 2. Corporate Brand Header
    drawCorporateHeaderLogo(doc, 24, 21);

    // Right-aligned company registry
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text("Webflora Technologies Pvt. Ltd.", pageWidth - 24, 23, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    doc.text([
        "IOC Colony, Kumhrar, Patna, Bihar - 800026",
        "Email: hello.webflora@gmail.com",
        "Website: www.webfloratechnologies.com"
    ], pageWidth - 24, 27, { align: "right", lineHeightFactor: 1.3 });

    // Thick Divider line under brand header
    doc.setDrawColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.setLineWidth(0.35);
    doc.line(24, 40, pageWidth - 24, 40);

    // 3. Contract Document Title Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text("IT SERVICE RETRIBUTION AGREEMENT", 24, 47);

    // Right-aligned Reference Box
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.text("CONTRACT REFERENCE: " + (agreement.agreementId || "WT-AGR-2026-0006"), pageWidth - 24, 45, { align: "right" });
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    const effDate = formatDateToText(agreement.createdAt, formatDate(new Date()));
    const isSigned = agreement.digitalSignature?.signStatus === "Signed";
    doc.text(`Effective Stamp: ${effDate}  |  Current Status: ${isSigned ? "SIGNED" : "DRAFT"}`, pageWidth - 24, 49, { align: "right" });

    // Thin Orange Accent line under Title block
    doc.setDrawColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.setLineWidth(0.25);
    doc.line(24, 52, 24 + 40, 52);

    let y = 59;

    // -------------------------------------------------------------
    // STACKED ROW-WISE PARTY CARDS (With auto-wrapped grids)
    // -------------------------------------------------------------

    // Helper to draw a Party Card with grid alignment and wrapped fields
    const drawPartyRowCard = (cardY: number, title: string, company: string, rep: string, repTitle: string, fullAddress: string, phone: string, badgeLabel: string) => {
        doc.setFillColor(SLATE_50_RGB[0], SLATE_50_RGB[1], SLATE_50_RGB[2]);
        doc.rect(24, cardY, cardWidth, partyCardHeight, "F");
        doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
        doc.setLineWidth(0.35);
        doc.rect(24, cardY, cardWidth, partyCardHeight, "S");

        doc.setDrawColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
        doc.setLineWidth(0.35);
        doc.line(24, cardY, 24 + 40, cardY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(fontSize - 0.2);
        doc.setTextColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
        doc.text(title, 28, cardY + 4.5);

        // Small role badge
        const badgeX = 24 + cardWidth - 22;
        doc.setFillColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
        doc.rect(badgeX, cardY + 2.5, 18, 4, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
        doc.text(badgeLabel, badgeX + 9, cardY + 5.3, { align: "center" });

        // Party details
        doc.setFont("helvetica", "bold");
        doc.setFontSize(fontSize + 0.5);
        doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
        doc.text(company, 28, cardY + 9);

        // Grid-aligned details in two columns (Left details, Right details)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize - 0.2);
        doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
        
        doc.text(`Rep : ${rep} (${repTitle})`, 28, cardY + 13.5);
        
        // Wrap address cleanly inside the left column space
        const wrappedAddr = doc.splitTextToSize(`Loc : ${fullAddress}`, 82);
        doc.text(wrappedAddr.slice(0, 2), 28, cardY + 17.5, { lineHeightFactor: 1.25 });

        // Right Column grid values
        const col2X = 116;
        doc.text(`Tel  : ${phone}`, col2X, cardY + 13.5);
    };

    // SERVICE PROVIDER / FIRST PARTY Row Card
    drawPartyRowCard(
        y, 
        "SERVICE PROVIDER / FIRST PARTY", 
        companyName, 
        companyAuthRep, 
        companyAuthDesig, 
        companyFullAddress, 
        "+91 8863081255", 
        "PROVIDER"
    );

    y += partyCardHeight + 3.5;

    // CLIENT / SECOND PARTY Row Card
    const clientPhone = agreement.clientInfo?.contactNumber?.trim() || "N/A (Operational Registry)";
    drawPartyRowCard(
        y, 
        "CLIENT / SECOND PARTY", 
        clientCompanyName, 
        clientName, 
        clientDesig, 
        clientFullAddress, 
        clientPhone, 
        "CLIENT"
    );

    y += partyCardHeight + 5;

    // -------------------------------------------------------------
    // SECTION 01: TECHNICAL SCOPE (Auto-wrapped titles & statement)
    // -------------------------------------------------------------
    drawSectionHeader(doc, "01. TECHNICAL SCOPE & CLIENT DELIVERABLES", 24, y, fontSize + 0.8);
    y += 5.5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize + 0.2);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text("Project Title : ", 24, y);
    
    // Auto-wrapped Project Title to prevent right edge spill
    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    const wrappedProjTitle = doc.splitTextToSize(projectTitle, cardWidth - 24);
    doc.text(wrappedProjTitle, 46, y, { lineHeightFactor: 1.2 });
    y += wrappedProjTitle.length * (fontSize * 0.4) + 1.2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize + 0.2);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text("Classification : ", 24, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    const projectClass = agreement.projectInfo?.classification?.trim() || "Web Development";
    const stagingCoreType = agreement.projectInfo?.stagingCoreType?.trim() || "Website Development";
    doc.text(`${projectClass}  •  Staging Core Type : ${stagingCoreType}`, 48, y);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize + 0.2);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text("Project Scope Statement :", 24, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    const splitScopeDesc = doc.splitTextToSize(projectScopeDescVal, cardWidth);
    doc.text(splitScopeDesc, 24, y, { lineHeightFactor: textLineHeight });
    y += splitScopeDesc.length * (fontSize * 0.42) + 4.5;

    // Clause 1. Scope of Work (Plain narrative block under Section 1)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize + 0.5);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text("1. Scope of Work:", 24, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    const splitScope = doc.splitTextToSize(scopeText, cardWidth);
    doc.text(splitScope, 24, y, { lineHeightFactor: textLineHeight });
    y += splitScope.length * (fontSize * 0.42) + gapSpacing;

    // -------------------------------------------------------------
    // SECTION 02: TIMELINE (With brand accent orange border)
    // -------------------------------------------------------------
    drawSectionHeader(doc, "02. PROJECT TIMELINE & DELIVERY SCHEDULE", 24, y, fontSize + 0.8);
    y += 5;

    // Duration Card (Full width row-wise box)
    doc.setFillColor(SLATE_50_RGB[0], SLATE_50_RGB[1], SLATE_50_RGB[2]);
    doc.rect(24, y, cardWidth, durationCardHeight, "F");
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.setLineWidth(0.35);
    doc.rect(24, y, cardWidth, durationCardHeight, "S");

    doc.setDrawColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.setLineWidth(0.35);
    doc.line(24, y, 24 + 40, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize - 0.2);
    doc.setTextColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.text("2. DURATION & SCHEDULE", 28, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    const splitDuration = doc.splitTextToSize(durationText, cardWidth - 8);
    doc.text(splitDuration, 28, y + 9.5, { lineHeightFactor: textLineHeight });

    y += durationCardHeight + gapSpacing;

    // -------------------------------------------------------------
    // SECTION 03: FINANCIAL STRUCTURE & PRICING ROWS
    // -------------------------------------------------------------
    drawSectionHeader(doc, "03. FINANCIAL STRUCTURE & PAYMENT COMPLIANCE", 24, y, fontSize + 0.8);
    y += 5;

    // Financial Card with calculations styled row-wise inside!
    doc.setFillColor(SLATE_50_RGB[0], SLATE_50_RGB[1], SLATE_50_RGB[2]);
    doc.rect(24, y, cardWidth, financialCardHeight, "F");
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.setLineWidth(0.35);
    doc.rect(24, y, cardWidth, financialCardHeight, "S");

    doc.setDrawColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.setLineWidth(0.35);
    doc.line(24, y, 24 + 40, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize - 0.2);
    doc.setTextColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.text("3. PAYMENT TERMS & PRICING SPECIFICATIONS", 28, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    
    // Left Narrative details
    const splitPayment = doc.splitTextToSize(paymentText, cardWidth - 76);
    doc.text(splitPayment, 28, y + 9.5, { lineHeightFactor: textLineHeight });

    // Right Column structured key-value values for pricing
    const calcX = 120;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize - 0.4);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);

    if (disc > 0) {
        doc.text("Base Project Value (Subtotal):", calcX, y + 9.5);
        doc.text("Applied Discount:", calcX, y + 15.5);
        doc.text("Total Dues (Grand Value):", calcX, y + 23.5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(fontSize - 0.2);
        doc.setTextColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
        doc.text(formatCurrency(baseValue), pageWidth - 28, y + 9.5, { align: "right" });
        doc.setTextColor(220, 38, 38); // Red color for discount
        doc.text(`-${formatCurrency(disc)}`, pageWidth - 28, y + 15.5, { align: "right" });
        doc.setTextColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
        doc.text(formatCurrency(grandTotal), pageWidth - 28, y + 23.5, { align: "right" });

        // Subtle horizontal divider under subtotals
        doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
        doc.setLineWidth(0.35);
        doc.line(calcX, y + 19.5, pageWidth - 28, y + 19.5);
    } else {
        // Just show Total Contract Value vertically centered
        doc.text("Total Contract Value:", calcX, y + 16.5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(fontSize + 0.5);
        doc.setTextColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
        doc.text(formatCurrency(grandTotal), pageWidth - 28, y + 16.5, { align: "right" });
    }

    // Decorative page footer for Page 1
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_400_RGB[0], SLATE_400_RGB[1], SLATE_400_RGB[2]);
    doc.text("CLASSIFIED RECORD  •  PAGE 1 OF 2", 24, pageHeight - 14);
    doc.text("DIGITALLY SIGNED UNDER ELECTRONIC RECORDS & CONTRACT LAWS", pageWidth - 24, pageHeight - 14, { align: "right" });


    // -------------------------------------------------------------------------
    // PAGE 2: COVENANTS, MUTUAL SIGNATURES & CORPORATE SEALS
    // -------------------------------------------------------------------------
    doc.addPage();

    drawSecurityWatermark(doc, "SECURED WEBFLORA LEGAL CONTRACT");
    drawPageBorder(doc);

    let y2 = 23;
    drawSectionHeader(doc, "05. COVENANTS & GENERAL LEGAL COMPLIANCE", 24, y2, fontSize + 0.8);
    y2 += 7;

    const clauses: { num: string; title: string; text: string }[] = [];
    let clauseNum = 4;

    if (agreement.serviceCommitment?.commitmentRequired) {
        const duration = agreement.serviceCommitment.commitmentDuration || "No Commitment";
        const startDate = formatDateToText(agreement.serviceCommitment.lockInStartDate, formatDate(new Date()));
        
        const services = agreement.serviceCommitment.includedServices && agreement.serviceCommitment.includedServices.length > 0
            ? agreement.serviceCommitment.includedServices.join(", ")
            : "Hosting, AMC, and Server Management";
            
        const earlyCharges = agreement.serviceCommitment.earlyTerminationCharges || "50% of the remaining contract duration charges";
        const recoveryCharges = agreement.serviceCommitment.recoveryCharges || "zero rupees";
        const notice = agreement.serviceCommitment.noticePeriod || "30 days";
        
        const commitmentText = `The Client explicitly agrees to a minimum service lock-in commitment of ${duration} commencing on ${startDate}. During this period, the Client agrees to retain and pay for all active services, including: ${services}. Early termination prior to the commitment end date will trigger termination fees of ${earlyCharges} and recovery/setup charges of ${recoveryCharges}, subject to a mandatory written notice period of ${notice}.`;

        clauses.push({
            num: (clauseNum++).toString(),
            title: "Minimum Lock-in Commitment",
            text: commitmentText
        });
    }

    clauses.push(
        { num: (clauseNum++).toString(), title: "Confidentiality", text: confText },
        { num: (clauseNum++).toString(), title: "Termination", text: termText },
        { num: (clauseNum++).toString(), title: "Governing Law", text: govText },
        { num: (clauseNum++).toString(), title: "Amendments", text: amendText },
        { num: (clauseNum++).toString(), title: "Mutual Acceptance", text: sigText }
    );

    // Compute expected height of clauses on Page 2
    let page2ClausesHeight = 0;
    clauses.forEach((c) => {
        const splitText = tempDoc.splitTextToSize(c.text, cardWidth);
        page2ClausesHeight += 4.5 + splitText.length * 4.4 + 4.5;
    });

    // Compress Page 2 if needed (Safety margins)
    let p2FontSize = fontSize;
    let p2Spacing = lineSpacing;
    if (page2ClausesHeight > 165) {
        const ratio2 = 165 / page2ClausesHeight;
        p2FontSize = Math.max(7.2, fontSize * ratio2);
        p2Spacing = Math.max(3.5, lineSpacing * ratio2);
    }

    // Write Clauses
    clauses.forEach((c) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(p2FontSize + 0.5);
        doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
        doc.text(`${c.num}. ${c.title}`, 24, y2);
        y2 += p2FontSize * 0.4 + 1.2;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(p2FontSize);
        doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
        const splitText = doc.splitTextToSize(c.text, cardWidth);
        doc.text(splitText, 24, y2, { lineHeightFactor: textLineHeight });
        y2 += splitText.length * (p2FontSize * 0.42) + 3.8;
    });

    y2 += 2.5;
    drawSectionHeader(doc, "06. MUTUAL ELECTRONIC SIGNATURE & VALIDATION CERTIFICATE", 24, y2, fontSize + 0.8);
    y2 += 8;

    // Draw Symmetrical Signature Cards (Side-by-side with QR validation)
    const sigCardWidth = 66;
    const sigCardHeight = 42;
    const gap = 30; // 162 - 66*2 = 30mm gap!
    const leftCardX = 24;
    const rightCardX = pageWidth - 24 - sigCardWidth;
    const qrX = leftCardX + sigCardWidth + 5;
    const qrWidth = gap - 10; // 20mm

    // Left Signature Card (Party A - Webflora Technologies)
    doc.setFillColor(SLATE_50_RGB[0], SLATE_50_RGB[1], SLATE_50_RGB[2]);
    doc.rect(leftCardX, y2, sigCardWidth, sigCardHeight, "F");
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.setLineWidth(0.35);
    doc.rect(leftCardX, y2, sigCardWidth, sigCardHeight, "S");

    doc.setDrawColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.setLineWidth(0.35);
    doc.line(leftCardX, y2, leftCardX + 25, y2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.text("FOR: WEBFLORA TECHNOLOGIES", leftCardX + 4, y2 + 4.5);



    // Representative details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    doc.text(companyAuthRep, leftCardX + 4, y2 + sigCardHeight - 7.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    doc.text(`MD  •  ${companySignDate}`, leftCardX + 4, y2 + sigCardHeight - 3.5);

    // Right Signature Card (Party B - Client)
    doc.setFillColor(SLATE_50_RGB[0], SLATE_50_RGB[1], SLATE_50_RGB[2]);
    doc.rect(rightCardX, y2, sigCardWidth, sigCardHeight, "F");
    doc.setDrawColor(SLATE_200_RGB[0], SLATE_200_RGB[1], SLATE_200_RGB[2]);
    doc.rect(rightCardX, y2, sigCardWidth, sigCardHeight, "S");

    doc.setDrawColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.setLineWidth(0.35);
    doc.line(rightCardX, y2, rightCardX + 25, y2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(BRAND_ORANGE_RGB[0], BRAND_ORANGE_RGB[1], BRAND_ORANGE_RGB[2]);
    doc.text(`FOR: ${clientCompanyName.toUpperCase()}`, rightCardX + 4, y2 + 4.5);

    const clientStampY = y2 + 9;
    const isSignedStatus = agreement.digitalSignature?.signStatus === "Signed";
    if (isSignedStatus && agreement.digitalSignature?.signatureData) {
        try {
            doc.addImage(agreement.digitalSignature.signatureData, "PNG", rightCardX + 6, clientStampY, 54, 15);
        } catch (e) {
            doc.setFont("helvetica", "italic");
            doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
            doc.setFontSize(8);
            doc.text("Digitally Signed", rightCardX + 6, clientStampY + 8);
        }
    } else {
        // Awaiting Signature frame
        doc.saveGraphicsState();
        doc.setDrawColor(SLATE_400_RGB[0], SLATE_400_RGB[1], SLATE_400_RGB[2]);
        doc.setLineWidth(0.35);
        // Dashed outline
        (doc as any).setLineDashPattern([2, 1.5], 0);
        doc.rect(rightCardX + 5, clientStampY + 1, 56, 17, "S");
        (doc as any).setLineDashPattern([], 0); // Reset
        
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(SLATE_400_RGB[0], SLATE_400_RGB[1], SLATE_400_RGB[2]);
        doc.text("Awaiting Secure Client E-Sign Assent", rightCardX + 33, clientStampY + 10.5, { align: "center" });
        doc.restoreGraphicsState();
    }

    // Client Representative details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(SLATE_900_RGB[0], SLATE_900_RGB[1], SLATE_900_RGB[2]);
    const clientSigneeName = agreement.digitalSignature?.signedBy || clientName;
    doc.text(clientSigneeName, rightCardX + 4, y2 + sigCardHeight - 7.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(SLATE_600_RGB[0], SLATE_600_RGB[1], SLATE_600_RGB[2]);
    doc.text(`${clientDesig}  •  ${clientSignDate}`, rightCardX + 4, y2 + sigCardHeight - 3.5);

    // Draw Real Scannable QR Code in the gap
    if (qrDataUrl) {
        doc.addImage(qrDataUrl, "PNG", qrX, y2 + 8, qrWidth, qrWidth);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(SLATE_400_RGB[0], SLATE_400_RGB[1], SLATE_400_RGB[2]);
    doc.text("VERIFIED SECURE", qrX + qrWidth/2, y2 + qrWidth + 10.5, { align: "center" });

    // Decorative page footer for Page 2
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(SLATE_400_RGB[0], SLATE_400_RGB[1], SLATE_400_RGB[2]);
    doc.text("CLASSIFIED RECORD  •  PAGE 2 OF 2", 24, pageHeight - 14);
    doc.text("DIGITALLY SIGNED UNDER ELECTRONIC RECORDS & CONTRACT LAWS", pageWidth - 24, pageHeight - 14, { align: "right" });

    // Save with unique ID
    doc.save(`IT_Agreement_${agreement.agreementId}.pdf`);
};
