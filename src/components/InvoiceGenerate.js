import React from "react";

const InvoiceGenerate = ({ selectedInvoice }) => {

    if (!selectedInvoice) return null;

    const isQuotation = selectedInvoice?.invoiceType === "quotation";

    const gstPercent = parseFloat(selectedInvoice?.gstPercent || 0);
    const subTotal = Number(selectedInvoice?.sub_total || 0);
    
    // GST CALCULATION (MINUS)
    const gstAmount = (subTotal * gstPercent) / 100;
    const finalTotal = subTotal - gstAmount;
    
    console.log(selectedInvoice, "selectedInvoice");

    const invoice = {
        invoice_no:
            selectedInvoice?.invoice_no ||
            selectedInvoice?.orderId ||
            "N/A",

        date: selectedInvoice?.date || new Date().toLocaleDateString("en-IN"),

        due_date: selectedInvoice?.due_date || selectedInvoice?.deliveryDate || "",

        customer_name:
            selectedInvoice?.customer_name ||
            selectedInvoice?.customerId?.fullName ||
            "",

        customer_phone:
            selectedInvoice?.customer_phone ||
            selectedInvoice?.customerId?.mobile ||
            "",

        customer_address:
            selectedInvoice?.customer_address ||
            selectedInvoice?.customerId?.address ||
            "",

        gst: selectedInvoice?.gstPercent || "",

        bank: selectedInvoice?.bank || null,

        sub_total: subTotal,

        gst_amount: gstAmount,

        discount: selectedInvoice?.discount || 0,

        total_amount: finalTotal,

        advance_paid: selectedInvoice?.advance_paid || 0,

        net_due: finalTotal - (selectedInvoice?.advance_paid || 0),

        items: Array.isArray(selectedInvoice?.items)
            ? selectedInvoice.items
            : [],
    };


    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <style>{`

      *{
        box-sizing:border-box;
      }

      body{
        margin:0;
        padding:0;
        font-family:Arial, Helvetica, sans-serif;
        background:#f5f5f5;
      }

      .invoice-container{

        width:900px;

        margin:20px auto;

        background:#fff;

        padding:35px;

        border-radius:8px;

        box-shadow:0 0 8px rgba(0,0,0,.15);

      }

      .header{

        display:flex;

        justify-content:space-between;

        align-items:flex-start;

        border-bottom:2px solid #EA9D81;

        padding-bottom:20px;

      }

      .company-name{

        font-size:32px;

        font-weight:bold;

        color:#EA9D81;

      }

      .company-address{

        margin-top:8px;

        font-size:14px;

        line-height:24px;

        color:#444;

      }

      .invoice-title{

        text-align:right;

      }

      .invoice-title h1{

        margin:0;

        color:#EA9D81;

        font-size:42px;

      }

      .invoice-title p{

        margin:5px 0;

        font-size:14px;

      }

      .customer-section{

        display:flex;

        justify-content:space-between;

        margin-top:35px;

      }

      .bill-box{

        width:48%;

      }

      .bill-box h3{

        margin-bottom:12px;

        color:#EA9D81;

      }

      .bill-box p{

        margin:6px 0;

        font-size:14px;

      }

      table{

        width:100%;

        border-collapse:collapse;

        margin-top:35px;

      }

      th{

        background:#EA9D81;

        color:#fff;

        padding:12px;

        font-size:14px;

      }

      td{

        border:1px solid #ddd;

        padding:12px;

        font-size:14px;

      }

      .text-right{

        text-align:right;

      }

      .text-center{

        text-align:center;

      }

      @media print{

        .no-print{

          display:none;

        }

        body{

          background:#fff;

        }

      }

      `}</style>

            <div id="invoice-print-area" className="invoice-container">

                <div className="header">

                    <div>

                        <div className="company-name">

                            Naari House

                        </div>

                        <div className="company-address">

                            24, Ugameshwar Bunglow
                            <br />

                            Nr Taapi Arcade

                            <br />

                            Nr Opel Gold

                            <br />

                            Mota Varachha

                            <br />

                            Surat - 394101

                        </div>

                    </div>

                    <div className="invoice-title">

                        <h1>INVOICE</h1>

                        <p>

                            <b>Invoice No :</b>

                            {invoice.invoice_no}

                        </p>

                        <p>

                            <b>Date :</b>

                            {invoice.date}

                        </p>

                        <p>

                            <b>Delivery :</b>

                            {invoice.due_date}

                        </p>

                    </div>

                </div>

                <div className="customer-section">

                    <div className="bill-box">

                        <h3>BILL TO</h3>

                        <p>

                            <b>{invoice.customer_name}</b>

                        </p>

                        <p>

                            {invoice.customer_phone}

                        </p>

                        <p>

                            {invoice.customer_address}

                        </p>

                    </div>

                </div>
                {invoice.bank ? (
                    <div style={{ marginTop: 20 }}>

                        {/* BANK */}
                        {invoice.bank && (
                            <div style={{ marginTop: 10 }}>
                                <p>
                                    <b>Bank Name:</b> {invoice.bank?.bankName || "-"}
                                </p>
                                <p>
                                    <b>Account:</b> {invoice.bank?.accountNumber || "-"}
                                </p>
                                <p>
                                    <b>IFSC:</b> {invoice.bank?.ifscCode || "-"}
                                </p>
                            </div>
                        )}
                    </div>
                ) : null}
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Description</th>
                            <th className="text-center">Qty</th>
                            <th className="text-right">Unit Price</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>

                    <tbody>
                        {invoice.items?.length > 0 ? (
                            invoice.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="text-center">{index + 1}</td>
                                    <td>{item.name || item.item_name || "-"}</td>
                                    <td className="text-center">{item.qty}</td>
                                    <td className="text-right">₹ {item.price}</td>
                                    <td className="text-right">₹ {item.total}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    No Items
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>


                {/* TOTAL SECTION */}
                <div style={{ marginTop: "30px", display: "flex", justifyContent: "flex-end" }}>

                    <div style={{ width: "350px" }}>

                        <table style={{ width: "100%" }}>

                            <tbody>

                                <tr>
                                    <td><b>Total Amount</b></td>
                                    <td className="text-right"><b>₹ {invoice.total_amount}</b></td>
                                </tr>

                                <tr>
                                    <td>Discount</td>
                                    <td className="text-right">₹ {invoice.discount}</td>
                                </tr>
                                {(invoice.gst && invoice.gst !== "") && (
                                    <tr>
                                        <td>GST {invoice.gst}%</td>
                                        <td className="text-right">₹ {invoice.gst_amount}</td>
                                    </tr>
                                )}

                                <tr>
                                    <td>Sub Total</td>
                                    <td className="text-right">₹ {invoice.sub_total}</td>
                                </tr>

                                <tr>
                                    <td>Advance Paid</td>
                                    <td className="text-right">₹ {invoice.advance_paid}</td>
                                </tr>

                                <tr>
                                    <td><b>Net Due</b></td>
                                    <td className="text-right"><b>₹ {invoice.net_due}</b></td>
                                </tr>

                            </tbody>

                        </table>

                    </div>
                </div>

            </div>
        </>
    );
};

export default InvoiceGenerate;