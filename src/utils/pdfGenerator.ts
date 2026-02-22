import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (invoice: any) => {
    if (!invoice) return;
    const doc = new jsPDF();

    // Add Logo
    // Note: In Vite/React, public assets are served from the root
    const logoUrl = "/webfloralogo.png";

    // Add image (x, y, width, height)
    // We'll use a standard size and position
    doc.addImage(logoUrl, "PNG", 20, 15, 40, 15);

    // Header Info - Shifted right to make room for logo
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("B-12, Sector 2, Noida, Uttar Pradesh, 201301", 115, 20);
    doc.text("hello.webflora@gmail.com | +91 9876543210", 115, 25);

    // Line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);

    // Invoice Details
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("INVOICE", 20, 60);

    doc.setFontSize(10);
    doc.text(`Invoice No: ${invoice.number || 'N/A'}`, 20, 70);
    doc.text(`Date: ${invoice.date ? new Date(invoice.date).toLocaleDateString('en-IN') : 'N/A'}`, 20, 75);
    doc.text(`Payment Status: ${(invoice.status || 'PAID').toUpperCase()}`, 20, 80);

    // Bill To
    doc.setFontSize(12);
    doc.text("BILL TO:", 120, 60);
    doc.setFontSize(10);
    doc.text(invoice.clientName || "Unknown Client", 120, 67);
    doc.text(invoice.projectName || "General Service", 120, 72);
    if (invoice.company) doc.text(invoice.company, 120, 77);

    // Table
    const tableColumn = ["Description", "Quantity", "Price", "Total"];
    const tableRows = [
        [
            invoice.description || "Project Service Fee",
            "1",
            new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(invoice.amount || 0),
            new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(invoice.amount || 0),
        ],
    ];

    autoTable(doc, {
        startY: 95,
        head: [tableColumn],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [255, 95, 31] },
        margin: { left: 20, right: 20 },
    });

    // Summary - Safely get Y position
    const finalY = (doc as any).lastAutoTable?.cursor?.y || 115;
    doc.setFontSize(12);
    doc.text("Grand Total:", 140, finalY + 10);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(invoice.total || invoice.amount || 0), 140, finalY + 18);

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for choosing WebFlora Technologies!", 105, 280, { align: "center" });

    // Save the PDF
    doc.save(`Invoice_${invoice.number || '000'}.pdf`);
};
