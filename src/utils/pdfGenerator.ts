import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (invoice: any) => {
    if (!invoice) return;

    const formatCurrency = (amount: number) => {
        return "Rs. " + new Intl.NumberFormat("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Branding Header
    const logoUrl = "/Blacktextlogo.jpeg";
    doc.addImage(logoUrl, "JPEG", 20, 12, 65, 20);

    // Company Details (Right Aligned)
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("Webflora Technologies", pageWidth - 20, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text([
        "IOC Colony, Kumhrar, Patna, 800026",
        "hello.webflora@gmail.com",
        "+91 8863081255"
    ], pageWidth - 20, 25, { align: "right", lineHeightFactor: 1.5 });

    // Divider
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(20, 42, pageWidth - 20, 42);

    // 2. Document Title & Key Meta
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 95, 31); // Brand Orange
    doc.text("INVOICE", 20, 60);

    // Document Meta Block
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details", 20, 72);

    doc.setFont("helvetica", "normal");
    doc.text(`No: ${invoice.number || 'N/A'}`, 20, 78);
    doc.text(`Date: ${invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : 'N/A'}`, 20, 83);

    const statusText = (invoice.status || 'PAID').toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.text("Status:", 20, 88);
    const statusColor = statusText === 'PAID' ? { r: 0, g: 150, b: 0 } : { r: 200, g: 0, b: 0 };
    doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
    doc.text(statusText, 35, 88);

    // 3. Billing Info (Clean Address Block)
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 120, 72);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(invoice.clientName || "Client Name", 120, 78);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    // Avoid repeating clientName if it matches company
    const subtitle = invoice.projectName || "Standard Project";
    doc.text(subtitle, 120, 83);
    if (invoice.address) doc.text(invoice.address, 120, 88);

    // 4. Items Table
    const tableColumn = ["Sl", "Description", "Qty", "Unit Price", "Total"];

    // Main Item - Show Project Name and Total Project Value as requested
    const projectTotal = Number(invoice.projectTotal || invoice.amount || 0);
    const tableRows = [
        [
            "1",
            invoice.projectName || invoice.description || "Project Service",
            "1",
            formatCurrency(projectTotal),
            formatCurrency(projectTotal),
        ],
    ];

    // Previous Dues as separate rows
    let sl = 2;
    const previousDue = Number(invoice.previousDue) || 0;
    const breakdown = invoice.dueBreakdown || [];

    if (breakdown.length > 0) {
        breakdown.forEach((item: any) => {
            tableRows.push([
                (sl++).toString(),
                `Due of ${item.projectName || 'Previous Project'}`,
                "1",
                formatCurrency(item.amount || 0),
                formatCurrency(item.amount || 0)
            ]);
        });
    } else if (previousDue > 0) {
        tableRows.push([
            (sl++).toString(),
            "Previous Outstanding Balance",
            "1",
            formatCurrency(previousDue),
            formatCurrency(previousDue)
        ]);
    }

    autoTable(doc, {
        startY: 105,
        head: [tableColumn],
        body: tableRows,
        theme: "plain",
        styles: {
            fontSize: 9,
            cellPadding: { top: 5, right: 2, bottom: 5, left: 2 },
            textColor: [50, 50, 50],
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 35, halign: 'right' },
            4: { cellWidth: 35, halign: 'right' },
        },
        headStyles: {
            fillColor: [255, 95, 31],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250],
        },
        margin: { left: 20, right: 20 },
    });

    // 5. Financial Summary (Matching handwritten layout: Total, Paid, Due)
    // Use the final height of the table to position the summary
    const finalY = (doc as any).lastAutoTable?.finalY || 135;
    const currentInvoiceAmount = Number(invoice.amount || 0); // This is the 'Paid' amount in this context
    const grandTotal = projectTotal + previousDue;

    // Determine "Paid" amount: ONLY the current invoice amount is paid if status is 'paid'
    let paidAmount = invoice.status === 'paid' ? currentInvoiceAmount : 0;
    let dueAmount = grandTotal - paidAmount;

    // Summary Box - Start a bit lower to ensure no overlap if the table is short
    const boxHeight = 40;
    const boxY = finalY + 10;

    doc.setFillColor(255, 245, 240); // Very light orange background
    doc.rect(pageWidth - 85, boxY, 65, boxHeight, "F");

    let currentY = boxY + 12;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    // Total
    doc.setTextColor(100, 100, 100);
    doc.text("Total - ", pageWidth - 80, currentY);
    doc.setTextColor(0, 0, 0);
    doc.text(formatCurrency(grandTotal), pageWidth - 25, currentY, { align: "right" });

    currentY += 8;

    // Paid
    doc.setTextColor(100, 100, 100);
    doc.text("Paid - ", pageWidth - 80, currentY);
    doc.setTextColor(0, 120, 0); // Green for paid
    doc.text(formatCurrency(paidAmount), pageWidth - 25, currentY, { align: "right" });

    // Divider
    currentY += 4;
    doc.setDrawColor(255, 220, 200);
    doc.line(pageWidth - 80, currentY, pageWidth - 25, currentY);
    currentY += 8;

    // Due
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text("Due - ", pageWidth - 80, currentY);
    doc.setTextColor(255, 95, 31); // Brand Orange
    doc.text(formatCurrency(dueAmount), pageWidth - 25, currentY, { align: "right" });

    // 6. Professional Footer
    doc.setDrawColor(240, 240, 240);
    doc.line(20, 265, pageWidth - 20, 265);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated document. No signature is required.", pageWidth / 2, 272, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 95, 31);
    doc.text("Thank you for partnering with Webflora Technologies!", pageWidth / 2, 278, { align: "center" });

    // Save
    doc.save(`Invoice_${invoice.number || '000'}.pdf`);
};
