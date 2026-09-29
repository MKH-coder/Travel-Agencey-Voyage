import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ALBANIA_PACKAGE_TIERS,
  ALBANIA_DAYS_ITINERARY,
  ALBANIA_PACKAGE_INCLUSIONS,
  ALBANIA_TIER_COMPARISON_ROWS,
  PackageTierInfo,
} from '../data/albaniaItineraryData.ts';

export class AlbaniaPdfService {
  /**
   * Generates and downloads a clean, beautifully styled PDF for a specific package tier
   */
  static generateTierPdf(tierId: 'basic' | 'midrange' | 'luxury'): void {
    const tier: PackageTierInfo = ALBANIA_PACKAGE_TIERS[tierId];
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    // --- PAGE 1: TITLE, ESTIMATE & FLIGHT PLAN ---
    this.renderHeader(doc, 'ALBANIA • 9-DAY ITINERARY', 'Per person • ALL + INR • 1');

    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 30, 45);
    doc.text('ALBANIA', pageWidth / 2, 34, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(190, 140, 20); // Gold/Amber
    doc.text(
      `${tier.title.toUpperCase()} • COMPLETE 9-DAY ITINERARY`,
      pageWidth / 2,
      43,
      { align: 'center' }
    );

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 60, 75);
    const routeText =
      'Tirana → Berat → Gjirokastër → Blue Eye → Sarandë → Ksamil → Butrint → Riviera → Vlorë → Tirana → India';
    doc.text(routeText, pageWidth / 2, 50, { align: 'center' });

    // Banner box: Final Package Estimate
    doc.setFillColor(15, 30, 55); // Dark Navy
    doc.rect(margin, 55, pageWidth - margin * 2, 11, 'F');
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const estimateBanner = `FINAL PACKAGE ESTIMATE • ${tier.estimatePerPerson}/person • 4 PEOPLE: ${tier.estimateFourPax}`;
    doc.text(estimateBanner, pageWidth / 2, 62, { align: 'center' });

    // Overview Table
    autoTable(doc, {
      startY: 68,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 8.5, cellPadding: 3, textColor: [30, 30, 30] },
      headStyles: { fillColor: [240, 243, 248], textColor: [20, 30, 50], fontStyle: 'bold' },
      body: [
        ['International airfare', tier.airfarePerPerson],
        ['Land package', tier.landPackagePerPerson],
        ['Hotel level', tier.hotelLevel],
        ['Food level', tier.foodLevel],
        ['Transport', tier.transport],
      ],
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 55 },
        1: { cellWidth: 'auto' },
      },
    });

    // Flight Plan Title
    let currentY = (doc as any).lastAutoTable.finalY + 7;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 30, 50);
    doc.text('Flight plan', margin, currentY);

    currentY += 4;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(190, 140, 20);
    doc.text(`SELECTED FLIGHT • ${tier.airfarePerPerson}`, margin, currentY);

    if (tier.flightOptionNote) {
      currentY += 4;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const splitNotes = doc.splitTextToSize(tier.flightOptionNote, pageWidth - margin * 2);
      doc.text(splitNotes, margin, currentY);
      currentY += splitNotes.length * 3.5;
    }

    currentY += 3;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 30, 50);
    doc.text(tier.flightPlan.outboundTitle, margin, currentY);

    // Outbound Flight Table
    autoTable(doc, {
      startY: currentY + 2,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [['Time', 'Sector', 'Duration / Connection', 'Airline / Notes']],
      styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 30, 30] },
      headStyles: { fillColor: [240, 243, 248], textColor: [20, 30, 50], fontStyle: 'bold' },
      body: tier.flightPlan.outboundLegs.map(leg => [leg.time, leg.sector, leg.duration, leg.airlineNotes]),
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 35 },
        2: { cellWidth: 45 },
        3: { cellWidth: 'auto' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 30, 50);
    doc.text(tier.flightPlan.returnTitle, margin, currentY);

    // Return Flight Table
    autoTable(doc, {
      startY: currentY + 2,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [['Time', 'Sector', 'Duration / Connection', 'Airline / Notes']],
      styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 30, 30] },
      headStyles: { fillColor: [240, 243, 248], textColor: [20, 30, 50], fontStyle: 'bold' },
      body: tier.flightPlan.returnLegs.map(leg => [leg.time, leg.sector, leg.duration, leg.airlineNotes]),
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 35 },
        2: { cellWidth: 45 },
        3: { cellWidth: 'auto' },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(90, 90, 90);
    doc.text('Flight fare is included in the package total.', margin, currentY);

    // --- DAY BY DAY PAGES (PAGES 2 TO 10) ---
    ALBANIA_DAYS_ITINERARY.forEach((day, index) => {
      doc.addPage();
      const pageNum = index + 2;
      this.renderHeader(doc, 'ALBANIA • 9-DAY ITINERARY', `Per person • ALL + INR • ${pageNum}`);

      let dayY = 28;

      if (index === 0) {
        // Arrival night section on Day 1 page
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(20, 30, 50);
        doc.text('ARRIVAL NIGHT • 9 OCTOBER 2026', margin, dayY);
        dayY += 4.5;
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(70, 70, 70);
        doc.text('23:45 — Arrive at Tirana International Airport (TIA).', margin, dayY);
        dayY += 4;
        doc.text('23:45–00:25 — Immigration, baggage collection and exit the terminal.', margin, dayY);
        dayY += 4;
        doc.text('00:25–01:00 — Transfer to the Tirana hotel.', margin, dayY);
        dayY += 4;
        doc.text('01:00–01:30 — Hotel check-in and settle into the room.', margin, dayY);
        dayY += 4;
        doc.text('01:30 onward — Rest. No sightseeing is scheduled after the overnight flight.', margin, dayY);
        dayY += 4;
        doc.setFont('helvetica', 'italic');
        doc.text('DAY 1 begins the following morning after a full night of rest.', margin, dayY);
        dayY += 8;
      }

      // Day Title Banner
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 30, 50);
      doc.text(`DAY ${day.dayNumber} • ${day.dateStr}`, margin, dayY);

      dayY += 5.5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(190, 140, 20);
      doc.text(day.title, margin, dayY);

      dayY += 4;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 110, 120);
      doc.text('ALL + INR • PER PERSON • FULL DAY PLAN', margin, dayY);

      // Activities Table
      autoTable(doc, {
        startY: dayY + 2.5,
        margin: { left: margin, right: margin },
        theme: 'grid',
        head: [['Time', 'Activity', 'Duration', 'Cost / Notes']],
        styles: { fontSize: 7.5, cellPadding: 2.2, textColor: [30, 30, 30] },
        headStyles: { fillColor: [15, 30, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
        body: day.activities.map(act => [act.time, act.activity, act.duration, act.costNotes]),
        columnStyles: {
          0: { cellWidth: 26, fontStyle: 'bold' },
          1: { cellWidth: 65 },
          2: { cellWidth: 25 },
          3: { cellWidth: 'auto' },
        },
      });

      let afterTableY = (doc as any).lastAutoTable.finalY + 5;

      // Itinerary detail paragraph
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 30, 50);
      doc.text('ITINERARY DETAIL', margin, afterTableY);
      afterTableY += 4;

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const splitDetail = doc.splitTextToSize(day.detail, pageWidth - margin * 2);
      doc.text(splitDetail, margin, afterTableY);
      afterTableY += splitDetail.length * 3.5 + 4;

      // Day Cost Estimate banner
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 30, 50);
      doc.text('DAY COST ESTIMATE', margin, afterTableY);
      afterTableY += 3;

      const daySpend = day.estimatedSpend[tierId];
      doc.setFillColor(25, 65, 110);
      doc.rect(margin, afterTableY, pageWidth - margin * 2, 7.5, 'F');
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(
        `${tier.title.toUpperCase()} • ESTIMATED DAY SPEND: ${daySpend}`,
        pageWidth / 2,
        afterTableY + 5,
        { align: 'center' }
      );

      afterTableY += 11;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(110, 110, 110);
      doc.text(
        'This is the package-specific planning allowance for the day. The final package total is shown separately at the end.',
        margin,
        afterTableY
      );
    });

    // --- PAGE 11: FINAL PACKAGE COST & INCLUSIONS ---
    doc.addPage();
    this.renderHeader(doc, 'ALBANIA • 9-DAY ITINERARY', 'Per person • ALL + INR • 11');

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 30, 50);
    doc.text('FINAL PACKAGE COST', margin, 32);

    // Golden cost banner
    doc.setFillColor(190, 140, 20);
    doc.rect(margin, 36, pageWidth - margin * 2, 8, 'F');
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(
      `${tier.title.toUpperCase()} • ${tier.estimatePerPerson}/person PER PERSON`,
      pageWidth / 2,
      41.5,
      { align: 'center' }
    );

    // Final Cost Table
    autoTable(doc, {
      startY: 46,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 8.5, cellPadding: 3, textColor: [30, 30, 30] },
      body: [
        ['International airfare', tier.airfarePerPerson],
        ['Land package', tier.landPackagePerPerson],
        ['FINAL TRIP ESTIMATE', `${tier.estimatePerPerson}/person`],
        ['4 travellers', tier.estimateFourPax],
      ],
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60, fillColor: [248, 250, 252] },
        1: { cellWidth: 'auto', fontStyle: 'bold' },
      },
    });

    let finalY = (doc as any).lastAutoTable.finalY + 7;

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 30, 50);
    doc.text('Trip route', margin, finalY);
    finalY += 4.5;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 60, 70);
    const splitRoute = doc.splitTextToSize(
      'Tirana → Berat → Gjirokastër → Blue Eye → Sarandë → Ksamil → Butrint → Porto Palermo → Himarë → Jalë → Dhërmi → Llogara → Vlorë → Tirana → India',
      pageWidth - margin * 2
    );
    doc.text(splitRoute, margin, finalY);
    finalY += splitRoute.length * 3.5 + 5;

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 30, 50);
    doc.text('Package inclusions', margin, finalY);
    finalY += 5;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 60, 70);

    ALBANIA_PACKAGE_INCLUSIONS.forEach(inc => {
      doc.text(`• ${inc}`, margin + 2, finalY);
      finalY += 4.5;
    });

    // Save PDF
    const filename = `Albania_9Day_Itinerary_${tierId.toUpperCase()}.pdf`;
    doc.save(filename);
  }

  /**
   * Generates and downloads the 3-Tier Side-by-Side Comparison PDF
   */
  static generateComparisonPdf(): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    this.renderHeader(doc, 'ALBANIA • 9-DAY ITINERARY', 'Per person • ALL + INR • 1');

    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 30, 50);
    doc.text('ALBANIA', pageWidth / 2, 34, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(190, 140, 20);
    doc.text('BASIC • MID-RANGE • LUXURY', pageWidth / 2, 43, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 60, 75);
    doc.text(
      'Tirana → Berat → Gjirokastër → Blue Eye → Sarandë → Ksamil → Butrint → Riviera → Vlorë → Tirana → India',
      pageWidth / 2,
      50,
      { align: 'center' }
    );

    // Navy header box
    doc.setFillColor(15, 30, 55);
    doc.rect(margin, 55, pageWidth - margin * 2, 10, 'F');
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(
      'ONE 9-DAY ROUTE • THREE PACKAGE LEVELS',
      pageWidth / 2,
      61.5,
      { align: 'center' }
    );

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(60, 60, 60);
    const subNote =
      'The itinerary stays the same across the three versions. The package level changes the airfare, accommodation level, dining allowance, transport comfort and activity allowance.';
    const splitSubNote = doc.splitTextToSize(subNote, pageWidth - margin * 2);
    doc.text(splitSubNote, margin, 70);

    // Comparison Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 30, 50);
    doc.text('FINAL COMPARISON', pageWidth / 2, 85, { align: 'center' });

    autoTable(doc, {
      startY: 90,
      margin: { left: margin, right: margin },
      theme: 'grid',
      head: [['Category', 'Basic', 'Mid-range', 'Luxury']],
      styles: { fontSize: 7.5, cellPadding: 2.8, textColor: [30, 30, 30] },
      headStyles: { fillColor: [15, 30, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
      body: ALBANIA_TIER_COMPARISON_ROWS.map(row => [
        row.category,
        row.basic,
        row.midrange,
        row.luxury,
      ]),
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 28, fillColor: [248, 250, 252] },
        1: { cellWidth: 48 },
        2: { cellWidth: 50 },
        3: { cellWidth: 'auto' },
      },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 6;

    // Callout Box
    doc.setFillColor(25, 65, 110);
    doc.rect(margin, currentY, pageWidth - margin * 2, 9, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(
      'THE SAME ROUTE AND MAJOR EXPERIENCES ARE RETAINED ACROSS ALL THREE PACKAGES',
      pageWidth / 2,
      currentY + 5.5,
      { align: 'center' }
    );

    currentY += 13;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const splitExp = doc.splitTextToSize(
      'The only changes between the package documents are the spending level and the package-specific daily cost allowance.\n\nFLIGHT CABIN CHOICE: The Luxury package allows you to choose your preferred cabin for the international flights—Premium Economy, Business Class, or First Class—subject to airline/route availability. The package\'s current airfare estimate of ₹2,95,343 per person is based on Premium Economy. Choosing Business Class or First Class will increase the airfare and therefore the final package total.',
      pageWidth - margin * 2
    );
    doc.text(splitExp, margin, currentY);

    // Save
    doc.save('Albania_9Day_Three_Tier_Comparison.pdf');
  }

  /**
   * Helper to render standardized header with brand & pagination
   */
  private static renderHeader(doc: jsPDF, leftTitle: string, rightPage: string): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(110, 110, 120);
    doc.text(leftTitle, pageWidth - 14, 15, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(rightPage, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
      align: 'center',
    });
  }
}
