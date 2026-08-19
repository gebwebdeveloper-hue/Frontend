import {
  ArrowLeft, Download, Printer, Mail, MessageSquare
} from "lucide-react";

export default function AdminInvoicePreview({
  activeTab,
  form,
  computedAmountInWords,
  subTotal,
  totalTax,
  deliveryChg,
  packagingChg,
  courierChg,
  platformChg,
  discount,
  taxableAmount,
  cgstAmount,
  sgstAmount,
  totalPayable,
  formatDateDisplay,
  printRef,
  onEditGenerator,
  onDownloadPDF,
  onPrint,
  onSendEmail,
  onSendWhatsApp,
}) {
  return (
    <div className={activeTab === "preview" ? "block" : "hidden print:block"}>
      {/* Action bar for Preview mode */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-zinc-900/90 p-5 shadow-2xl backdrop-blur-xl">
        <button
          onClick={onEditGenerator}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Edit Details in Generator
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-xs font-bold text-black hover:bg-emerald-300 transition shadow"
          >
            <Download className="h-4 w-4" /> Save / Download PDF
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
          >
            <Printer className="h-4 w-4" /> Print Document
          </button>
          <button
            onClick={onSendEmail}
            className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition"
          >
            <Mail className="h-4 w-4" /> Send Email
          </button>
          <button
            onClick={onSendWhatsApp}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            <MessageSquare className="h-4 w-4" /> WhatsApp
          </button>
        </div>
      </div>

      {/* ── PRINTABLE INVOICE SHEET (Pure White Paper PDF Layout) ── */}
      <div className="flex justify-center">
        <div
          id="printable-invoice-container"
          ref={printRef}
          className="relative w-full max-w-[800px] bg-white text-black p-6 sm:p-8 rounded-lg shadow-2xl border border-zinc-300 text-[11px] leading-snug overflow-hidden"
        >
          {/* WATERMARK BACKGROUND EMBLEM */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <img
              src="/Web.jpeg"
              alt="Watermark Emblem"
              className="w-[340px] h-[340px] object-contain opacity-[0.06] select-none"
            />
          </div>

          {/* HEADER SECTION */}
          <div className="relative z-10 flex items-start justify-between gap-4 pb-4 border-b-2 border-black">
            <div className="flex items-start gap-3">
              <img
                src="/Web.jpeg"
                alt="Lekhok Tripura Logo"
                className="h-16 w-16 object-contain shrink-0 mt-0.5"
              />
              <div>
                <h1 className="text-xl font-black tracking-tight text-black uppercase">
                  LEKHOK TRIPURA PUBLISHERS
                </h1>
                <p className="text-[11px] text-zinc-700 font-medium">
                  Madhuban, Agartala, West Tripura - 799003
                </p>
                <p className="text-[11px] text-zinc-700 font-medium">
                  lekhok.tripura@gmail.com &nbsp;|&nbsp; 6033350539
                </p>
                <p className="text-[11px] font-bold text-black">
                  GST No. : 16BMLPC9718D1Z2
                </p>
              </div>
            </div>

            {/* QR CODE */}
            <div className="text-center shrink-0">
              <div className="h-16 w-16 bg-white border border-zinc-300 rounded p-1 mx-auto flex items-center justify-center shadow-sm">
                <img
                  src="/lekhoktripura_qr.png"
                  alt="Scan QR Code"
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="text-[9px] font-bold text-zinc-800 mt-1">
                Scan to Visit<br />lekhoktripura.in
              </p>
            </div>
          </div>

          <div className="relative z-10">
            {/* INVOICE BANNER */}
            <div className="flex items-center justify-between pt-3 pb-2">
              <div>
                <h2 className="text-2xl font-black tracking-wider text-black">INVOICE</h2>
                <p className="text-[10px] text-zinc-600 font-bold uppercase mt-0.5">
                  Bill Generated By :{" "}
                  <span className="text-black">{form.billInfo.generatedBy}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black uppercase text-black">
                  INVOICE NO. :{" "}
                  <span className="font-extrabold">{form.billInfo.invoiceNo}</span>
                </p>
                <p className="text-xs font-bold text-black mt-0.5">
                  DATE : <span>{formatDateDisplay(form.billInfo.billingDate)}</span>
                </p>
              </div>
            </div>

            {/* ROW 1: BILL TO, SHIP TO, INVOICE DETAILS */}
            <div className="grid grid-cols-12 gap-0 border border-black mb-3 bg-white/90">
              {/* BILL TO */}
              <div className="col-span-4 border-r border-black">
                <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase flex items-center gap-1">
                  <span>■</span> BILL TO
                </div>
                <div className="p-2 space-y-1 text-[10px]">
                  <p><strong className="inline-block w-16">Name</strong>: {form.billTo.name}</p>
                  <p><strong className="inline-block w-16">Address</strong>: {form.billTo.address}</p>
                  <p><strong className="inline-block w-16">State</strong>: {form.billTo.state}</p>
                  <p><strong className="inline-block w-16">GST No.</strong>: {form.billTo.gstNo}</p>
                  <p><strong className="inline-block w-16">Phone No.</strong>: {form.billTo.phoneNo}</p>
                  <p><strong className="inline-block w-16">Mail ID</strong>: {form.billTo.email}</p>
                </div>
              </div>

              {/* SHIP TO */}
              <div className="col-span-4 border-r border-black">
                <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase flex items-center gap-1">
                  <span>■</span> SHIP TO
                </div>
                <div className="p-2 space-y-1 text-[10px]">
                  <p><strong className="inline-block w-16">Name</strong>: {form.shipTo.name}</p>
                  <p><strong className="inline-block w-16">Address</strong>: {form.shipTo.address}</p>
                  <p><strong className="inline-block w-16">State</strong>: {form.shipTo.state}</p>
                  <p><strong className="inline-block w-16">GST No.</strong>: {form.shipTo.gstNo}</p>
                </div>
              </div>

              {/* INVOICE DETAILS */}
              <div className="col-span-4">
                <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase flex items-center gap-1">
                  <span>■</span> INVOICE DETAILS
                </div>
                <div className="p-2 space-y-1 text-[10px]">
                  <p><strong className="inline-block w-24">Bill No.</strong>: {form.billInfo.invoiceNo}</p>
                  <p><strong className="inline-block w-24">Billing Date</strong>: {formatDateDisplay(form.billInfo.billingDate)}</p>
                  <p><strong className="inline-block w-24">Payment Mode</strong>: {form.billInfo.paymentMode}</p>
                  <p><strong className="inline-block w-24">Generated By</strong>: {form.billInfo.generatedBy}</p>
                </div>
              </div>
            </div>

            {/* ROW 2: DELIVERY DETAILS */}
            <div className="border border-black mb-3 bg-white/90">
              <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase flex items-center gap-1">
                <span>■</span> DELIVERY DETAILS
              </div>
              <div className="p-2 grid grid-cols-3 text-[10px]">
                <p><strong>Delivery</strong>: ₹{deliveryChg.toFixed(2)}</p>
                <p><strong>Courier</strong>: {form.deliveryDetails.courierName}</p>
                <p><strong>Courier ID</strong>: {form.deliveryDetails.courierId}</p>
              </div>
            </div>

            {/* ROW 3: ITEMS TABLE & SUMMARY */}
            <div className="border border-black mb-3 bg-white/90">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-black text-white font-bold text-[10px] uppercase border-b border-black">
                    <th className="p-1.5 border-r border-white/20 w-8 text-center">SL.</th>
                    <th className="p-1.5 border-r border-white/20 text-left">DESCRIPTION</th>
                    <th className="p-1.5 border-r border-white/20 w-24 text-center">HSN/SAC</th>
                    <th className="p-1.5 border-r border-white/20 w-12 text-center">QTY.</th>
                    <th className="p-1.5 border-r border-white/20 w-24 text-right">RATE (₹)</th>
                    <th className="p-1.5 w-28 text-right">AMOUNT (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-zinc-300">
                      <td className="p-2 border-r border-zinc-300 text-center font-bold">{idx + 1}</td>
                      <td className="p-2 border-r border-zinc-300 font-medium">{item.description}</td>
                      <td className="p-2 border-r border-zinc-300 text-center">{item.hsn}</td>
                      <td className="p-2 border-r border-zinc-300 text-center">{item.qty}</td>
                      <td className="p-2 border-r border-zinc-300 text-right font-medium">
                        ₹{Number(item.rate).toFixed(2)}
                      </td>
                      <td className="p-2 text-right font-bold">
                        ₹{Number(item.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Split Table Bottom: Amount in Words (Left) | Detailed Breakdown (Right) */}
              <div className="grid grid-cols-12 border-t border-black">
                {/* Left: AMOUNT IN WORDS */}
                <div className="col-span-6 border-r border-black p-2 flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-[10px] text-black uppercase">AMOUNT IN WORDS</p>
                    <p className="text-[11px] font-semibold text-zinc-900 mt-1 leading-snug">
                      {computedAmountInWords}
                    </p>
                  </div>
                </div>

                {/* Right: SUMMARY TABLE */}
                <div className="col-span-6 text-[10px]">
                  <div className="flex justify-between p-1.5 border-b border-zinc-200">
                    <span>Sub Total</span>
                    <span className="font-semibold">₹{subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-1.5 border-b border-zinc-200">
                    <span>Total Taxable Amount</span>
                    <span className="font-semibold">₹{taxableAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-1.5 border-b border-zinc-200">
                    <span>CGST @ {form.taxConfig.cgstRate}%</span>
                    <span className="font-semibold">₹{cgstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-1.5 border-b border-zinc-200">
                    <span>SGST @ {form.taxConfig.sgstRate}%</span>
                    <span className="font-semibold">₹{sgstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-1.5 border-b border-zinc-200">
                    <span>Price without tax</span>
                    <span className="font-semibold">₹{taxableAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-1.5 border-b border-zinc-200">
                    <span>Packaging Charge</span>
                    <span className="font-semibold">₹{packagingChg.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-1.5 border-b border-zinc-200">
                    <span>Courier Charge</span>
                    <span className="font-semibold">₹{courierChg.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-1.5 border-b border-zinc-200">
                    <span>Platform Charge</span>
                    <span className="font-semibold">₹{platformChg.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-1.5 border-b border-zinc-200">
                    <span>Discount Amount</span>
                    <span className="font-semibold">₹{discount.toFixed(2)}</span>
                  </div>

                  {/* TOTAL PAYABLE AMOUNT */}
                  <div className="flex justify-between p-2 bg-black text-white font-black text-xs uppercase">
                    <span>TOTAL PAYABLE AMOUNT</span>
                    <span>₹{totalPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 4: BANK DETAILS & TAX SUMMARY */}
            <div className="grid grid-cols-12 gap-3 mb-3">
              {/* BANK DETAILS */}
              <div className="col-span-6 border border-black bg-white/90">
                <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase flex items-center gap-1">
                  <span>■</span> BANK DETAILS
                </div>
                <div className="p-2 space-y-1 text-[10px]">
                  <p><strong className="inline-block w-24">Account Name</strong>: {form.bankDetails.accountName}</p>
                  <p><strong className="inline-block w-24">Account No.</strong>: {form.bankDetails.accountNo}</p>
                  <p><strong className="inline-block w-24">IFSC Code</strong>: {form.bankDetails.ifscCode}</p>
                  <p><strong className="inline-block w-24">Branch Code</strong>: {form.bankDetails.branchCode}</p>
                  <p><strong className="inline-block w-24">CIF</strong>: {form.bankDetails.cif}</p>
                  <p><strong className="inline-block w-24">MICR</strong>: {form.bankDetails.micr}</p>
                  <p><strong className="inline-block w-24">UPI ID</strong>: {form.bankDetails.upiId}</p>
                </div>
              </div>

              {/* TAX SUMMARY */}
              <div className="col-span-6 border border-black bg-white/90">
                <div className="bg-black text-white font-bold text-[10px] px-2 py-1 uppercase flex items-center gap-1">
                  <span>TAX SUMMARY</span>
                </div>
                <div className="p-1">
                  <table className="w-full border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-black text-left font-bold text-[9px] uppercase">
                        <th className="p-1">TAX TYPE</th>
                        <th className="p-1 text-center">RATE</th>
                        <th className="p-1 text-right">TAXABLE AMOUNT (₹)</th>
                        <th className="p-1 text-right">TAX AMOUNT (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-zinc-200">
                        <td className="p-1 font-semibold">CGST</td>
                        <td className="p-1 text-center">{form.taxConfig.cgstRate}%</td>
                        <td className="p-1 text-right">₹{taxableAmount.toFixed(2)}</td>
                        <td className="p-1 text-right font-semibold">₹{cgstAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-zinc-200">
                        <td className="p-1 font-semibold">SGST</td>
                        <td className="p-1 text-center">{form.taxConfig.sgstRate}%</td>
                        <td className="p-1 text-right">₹{taxableAmount.toFixed(2)}</td>
                        <td className="p-1 text-right font-semibold">₹{sgstAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="font-bold">
                        <td className="p-1">TOTAL</td>
                        <td className="p-1 text-center">
                          {form.taxConfig.cgstRate + form.taxConfig.sgstRate}%
                        </td>
                        <td className="p-1 text-right">₹{taxableAmount.toFixed(2)}</td>
                        <td className="p-1 text-right">₹{totalTax.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ROW 5: TERMS & CONDITIONS & AUTHORISED SIGNATORY */}
            <div className="grid grid-cols-12 gap-3 mb-2">
              {/* TERMS & CONDITIONS */}
              <div className="col-span-7 border border-black bg-white/90">
                <div className="bg-black text-white font-bold text-[10px] px-2 py-0.5 uppercase flex items-center gap-1">
                  <span>■</span> TERMS & CONDITIONS
                </div>
                <div className="p-1.5 text-[9px] leading-tight text-zinc-800 font-medium whitespace-pre-line">
                  {form.terms}
                </div>
              </div>

              {/* AUTHORISED SIGNATORY */}
              <div className="col-span-5 border border-black flex flex-col justify-between bg-white/90">
                <div className="bg-black text-white font-bold text-[10px] px-2 py-0.5 uppercase text-center">
                  AUTHORISED SIGNATORY
                </div>
                <div className="p-1.5 text-center flex-1 flex flex-col items-center justify-end">
                  {/* Authorised Seal & Signature Image */}
                  <div className="mb-1">
                    <img
                      src={form.signatureImage}
                      alt="Authorised Signatory"
                      className="h-12 max-w-full object-contain mx-auto"
                    />
                  </div>
                  <div className="w-full border-t border-black pt-0.5">
                    <p className="font-bold text-[9.5px] text-black">
                      {form.signatoryName}
                    </p>
                    <p className="text-[8.5px] font-semibold text-zinc-600">
                      Authorised Signatory
                    </p>
                    <p className="text-[8.5px] font-semibold text-zinc-600">
                      Lekhok Tripura Publishers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER THANK YOU MESSAGE */}
            <div className="pt-2 border-t border-black text-center">
              <p className="text-[10px] font-black tracking-widest text-black uppercase">
                THANK YOU FOR YOUR BUSINESS!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
