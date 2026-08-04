import React, { forwardRef } from "react";

const sectionStyle = {
  marginTop: 20,
  marginBottom: 15,
};

const titleStyle = {
  background: "#222",
  color: "#fff",
  padding: "8px 12px",
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 10,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10,
};

const thStyle = {
  border: "1px solid #000",
  padding: 8,
  background: "#f3f3f3",
  textAlign: "left",
  fontSize: 13,
};

const tdStyle = {
  border: "1px solid #000",
  padding: 8,
  fontSize: 13,
  verticalAlign: "top",
};

const imageStyle = {
  width: 130,
  height: 130,
  objectFit: "cover",
  border: "1px solid #ccc",
  borderRadius: 6,
  margin: 5,
};

const OrderPrint = forwardRef(({ order }, ref) => {
  if (!order) return null;

  const customer = order.customerId || {};

  const money = (value) => {
    if (value === undefined || value === null) return "0";
    return Number(value).toLocaleString("en-IN");
  };

  const date = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN");
  };

  const renderImages = (images = []) => {
    if (!images.length) return <p>No Images</p>;

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt=""
            style={imageStyle}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: 25,
        margin: "0 auto",
        background: "#fff",
        color: "#000",
        fontFamily: "Arial",
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "2px solid #000",
          paddingBottom: 15,
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#d66f45",
            }}
          >
            Naari House
          </h1>

          <div style={{ marginTop: 10, fontSize: 13 }}>
            24 Ugameshwar Bunglow
            <br />
            Near Taapi Arcade
            <br />
            Mota Varachha
            <br />
            Surat - 394101
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <h2
            style={{
              margin: 0,
              color: "#d66f45",
            }}
          >
            ORDER DETAILS
          </h2>

          <p>
            <b>Order ID :</b> {order.orderId}
          </p>

          <p>
            <b>Created :</b> {date(order.createdAt)}
          </p>

          <p>
            <b>Delivery :</b> {date(order.deliveryDate)}
          </p>

          <p>
            <b>Status :</b> {order.status}
          </p>
        </div>
      </div>

      {/* ================= CUSTOMER ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>
          Customer Information
        </div>

        <table style={tableStyle}>
          <tbody>

            <tr>
              <td style={tdStyle}><b>Name</b></td>
              <td style={tdStyle}>{customer.fullName}</td>

              <td style={tdStyle}><b>Mobile</b></td>
              <td style={tdStyle}>{customer.mobile}</td>
            </tr>

            <tr>
              <td style={tdStyle}><b>Address</b></td>
              <td
                style={tdStyle}
                colSpan={3}
              >
                {customer.address}
              </td>
            </tr>

            <tr>
              <td style={tdStyle}><b>Reference</b></td>
              <td style={tdStyle}>
                {customer.reference || "-"}
              </td>

              <td style={tdStyle}><b>DOB</b></td>
              <td style={tdStyle}>
                {customer.dob || "-"}
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* ================= ORDER ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>
          Order Information
        </div>

        <table style={tableStyle}>
          <tbody>

            <tr>

              <td style={tdStyle}>
                <b>Order Type</b>
              </td>

              <td style={tdStyle}>
                {order.orderType}
              </td>

              <td style={tdStyle}>
                <b>Outfit</b>
              </td>

              <td style={tdStyle}>
                {order.outfitTypeName}
              </td>

            </tr>

            <tr>

              <td style={tdStyle}>
                <b>Fabric Type</b>
              </td>

              <td style={tdStyle}>
                {order.fabricType || "-"}
              </td>

              <td style={tdStyle}>
                <b>Fabric Color</b>
              </td>

              <td style={tdStyle}>
                {order.fabricColor || "-"}
              </td>

            </tr>

            <tr>

              <td style={tdStyle}>
                <b>Meters Required</b>
              </td>

              <td style={tdStyle}>
                {order.metersRequired || 0}
              </td>

              <td style={tdStyle}>
                <b>Fusing Required</b>
              </td>

              <td style={tdStyle}>
                {order.fusingRequired ? "Yes" : "No"}
              </td>

            </tr>

          </tbody>
        </table>
      </div>
            {/* ================= MEASUREMENTS ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>Measurements</div>

        {order.measurement && order.measurement.length > 0 ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Measurement</th>
                <th style={thStyle}>Value</th>
                <th style={thStyle}>Unit</th>
              </tr>
            </thead>

            <tbody>
              {order.measurement.map((item, index) => (
                <tr key={index}>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={tdStyle}>{item.fieldLable}</td>
                  <td style={tdStyle}>{item.fieldValue}</td>
                  <td style={tdStyle}>{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No Measurements</p>
        )}
      </div>

      {/* ================= FABRIC ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>Fabric Details</div>

        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={tdStyle}>
                <b>Fabric Type</b>
              </td>

              <td style={tdStyle}>
                {order.fabricType || "-"}
              </td>

              <td style={tdStyle}>
                <b>Color</b>
              </td>

              <td style={tdStyle}>
                {order.fabricColor || "-"}
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <b>Meters Required</b>
              </td>

              <td style={tdStyle}>
                {order.metersRequired || "-"}
              </td>

              <td style={tdStyle}>
                <b>Notes</b>
              </td>

              <td style={tdStyle}>
                {order.fabricNotes || "-"}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            marginTop: 15,
            fontWeight: "bold",
          }}
        >
          Fabric Images
        </div>

        {renderImages(order.fabricRefImg)}
      </div>

      {/* ================= OUTFIT STYLE ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>
          Outfit Style Reference
        </div>

        {renderImages(order.outfitStyleRefImg)}
      </div>

      {/* ================= WORK TYPE ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>Work Type</div>

        <table style={tableStyle}>
          <tbody>

            <tr>
              <td style={tdStyle}>
                <b>Selected Work</b>
              </td>

              <td style={tdStyle}>
                {order.workTypes?.length
                  ? order.workTypes.join(", ")
                  : "-"}
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <b>Embroidery Notes</b>
              </td>

              <td style={tdStyle}>
                {order.embroideryWorkNotes || "-"}
              </td>
            </tr>

          </tbody>
        </table>

        <div
          style={{
            marginTop: 15,
            fontWeight: "bold",
          }}
        >
          Work Reference Images
        </div>

        {renderImages(order.workTypeRefImg)}
      </div>

      {/* ================= EMBROIDERY ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>
          Embroidery Reference Images
        </div>

        {renderImages(order.embroideryRefImg)}
      </div>

      {/* ================= STITCHING ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>
          Stitching Details
        </div>

        <table style={tableStyle}>
          <tbody>

            <tr>

              <td style={tdStyle}>
                <b>Style</b>
              </td>

              <td style={tdStyle}>
                {order.stitichingStyle || "-"}
              </td>

            </tr>

            <tr>

              <td style={tdStyle}>
                <b>Notes</b>
              </td>

              <td style={tdStyle}>
                {order.stitichingNotes || "-"}
              </td>

            </tr>

          </tbody>
        </table>

        <div
          style={{
            marginTop: 15,
            fontWeight: "bold",
          }}
        >
          Stitching Images
        </div>

        {renderImages(order.stitichingRefImg)}
      </div>

      {/* ================= OTHER WORK ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>
          Other Work
        </div>

        <table style={tableStyle}>
          <tbody>

            <tr>
              <td style={tdStyle}>
                <b>Description</b>
              </td>

              <td style={tdStyle}>
                {order.otherWork || "-"}
              </td>
            </tr>

          </tbody>
        </table>

        <div
          style={{
            marginTop: 15,
            fontWeight: "bold",
          }}
        >
          Other Work Images
        </div>

        {renderImages(order.otherWorkRefImg)}
      </div>
            {/* ================= ASSIGNED WORKERS ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>Assigned Workers</div>

        {order.assignWorker && order.assignWorker.length > 0 ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Worker</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Description</th>
              </tr>
            </thead>

            <tbody>
              {order.assignWorker.map((worker, index) => (
                <tr key={index}>
                  <td style={tdStyle}>{index + 1}</td>

                  <td style={tdStyle}>
                    {worker.workerId?.fullName || "-"}
                  </td>

                  <td style={tdStyle}>
                    {worker.status || "-"}
                  </td>

                  <td style={tdStyle}>
                    {worker.description || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No Worker Assigned</p>
        )}
      </div>

      {/* ================= COST SUMMARY ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>Cost Summary</div>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Work</th>
              <th style={thStyle}>Days</th>
              <th style={thStyle}>Price</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td style={tdStyle}>Fabric Purchase</td>
              <td style={tdStyle}>{order.fabricPurchaseDays}</td>
              <td style={tdStyle}>₹ {money(order.fabricPurchasePrice)}</td>
            </tr>

            <tr>
              <td style={tdStyle}>Dyeing</td>
              <td style={tdStyle}>{order.dyeingDays}</td>
              <td style={tdStyle}>₹ {money(order.dyeingPrice)}</td>
            </tr>

            <tr>
              <td style={tdStyle}>Embroidery</td>
              <td style={tdStyle}>{order.embroideryDays}</td>
              <td style={tdStyle}>₹ {money(order.embroideryPrice)}</td>
            </tr>

            <tr>
              <td style={tdStyle}>Stitching</td>
              <td style={tdStyle}>{order.stitichingDays}</td>
              <td style={tdStyle}>₹ {money(order.stitichingPrice)}</td>
            </tr>

            <tr>
              <td style={tdStyle}>Other Work</td>
              <td style={tdStyle}>{order.otherWorkDays}</td>
              <td style={tdStyle}>₹ {money(order.otherWorkPrice)}</td>
            </tr>

            <tr>
              <td style={tdStyle}>Packing</td>
              <td style={tdStyle}>{order.packingDays}</td>
              <td style={tdStyle}>₹ {money(order.packingPrice)}</td>
            </tr>

            <tr>
              <td style={tdStyle}>Fusing</td>
              <td style={tdStyle}>{order.fusingDays}</td>
              <td style={tdStyle}>₹ {money(order.fusingPrice)}</td>
            </tr>

            <tr>
              <td style={tdStyle}>Khakha</td>
              <td style={tdStyle}>{order.khakhaDays}</td>
              <td style={tdStyle}>₹ {money(order.khakhaPrice)}</td>
            </tr>

            <tr>
              <td style={tdStyle}>Art Work</td>
              <td style={tdStyle}>{order.artWorkDays}</td>
              <td style={tdStyle}>₹ {money(order.artWorkPrice)}</td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* ================= PAYMENT SUMMARY ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>Payment Summary</div>

        <table style={tableStyle}>
          <tbody>

            <tr>
              <td style={tdStyle}>
                <b>Total Days</b>
              </td>

              <td style={tdStyle}>
                {order.totalDays}
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <b>Total Cost</b>
              </td>

              <td style={tdStyle}>
                ₹ {money(order.totalPrice)}
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <b>Selling Price</b>
              </td>

              <td style={tdStyle}>
                ₹ {money(order.sellingPrice)}
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <b>Advance Paid</b>
              </td>

              <td style={tdStyle}>
                ₹ {money(order.advanceAmount)}
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <b>Remaining Amount</b>
              </td>

              <td style={tdStyle}>
                ₹ {money(
                  Number(order.sellingPrice || 0) -
                  Number(order.advanceAmount || 0)
                )}
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <b>Difference %</b>
              </td>

              <td style={tdStyle}>
                {order.diffPercentage} %
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* ================= DELIVERY ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>Delivery Information</div>

        <table style={tableStyle}>
          <tbody>

            <tr>
              <td style={tdStyle}>
                <b>Delivery Date</b>
              </td>

              <td style={tdStyle}>
                {date(order.deliveryDate)}
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <b>Current Status</b>
              </td>

              <td style={tdStyle}>
                {order.status}
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* ================= SPECIAL INSTRUCTIONS ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>Special Instructions</div>

        <div
          style={{
            border: "1px solid #000",
            padding: 15,
            minHeight: 80,
            fontSize: 13,
          }}
        >
          {order.specialInstructions || "No Special Instructions"}
        </div>
      </div>

      {/* ================= CREATED INFO ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>Created Information</div>

        <table style={tableStyle}>
          <tbody>

            <tr>
              <td style={tdStyle}>
                <b>Created By</b>
              </td>

              <td style={tdStyle}>
                {order.createdBy?.fullName || "-"}
              </td>

              <td style={tdStyle}>
                <b>Updated By</b>
              </td>

              <td style={tdStyle}>
                {order.updatedBy?.fullName || "-"}
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <b>Created At</b>
              </td>

              <td style={tdStyle}>
                {date(order.createdAt)}
              </td>

              <td style={tdStyle}>
                <b>Updated At</b>
              </td>

              <td style={tdStyle}>
                {date(order.updatedAt)}
              </td>
            </tr>

          </tbody>
        </table>
      </div>
            {/* ================= ALL IMAGE GALLERY ================= */}

      <div style={sectionStyle}>
        <div style={titleStyle}>All Reference Images</div>

        {[
          {
            title: "Outfit Style",
            images: order.outfitStyleRefImg,
          },
          {
            title: "Fabric",
            images: order.fabricRefImg,
          },
          {
            title: "Work Type",
            images: order.workTypeRefImg,
          },
          {
            title: "Embroidery",
            images: order.embroideryRefImg,
          },
          {
            title: "Stitching",
            images: order.stitichingRefImg,
          },
          {
            title: "Other Work",
            images: order.otherWorkRefImg,
          },
        ].map((section, index) => (
          <div key={index} style={{ marginBottom: 25 }}>
            <h4
              style={{
                marginBottom: 10,
              }}
            >
              {section.title}
            </h4>

            {renderImages(section.images)}
          </div>
        ))}
      </div>

      {/* ================= FOOTER ================= */}

      <div
        style={{
          marginTop: 40,
          borderTop: "2px solid #000",
          paddingTop: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <strong>Naari House</strong>

          <div
            style={{
              marginTop: 5,
              fontSize: 12,
            }}
          >
            Thank you for choosing us.
          </div>
        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >
          <div
            style={{
              marginBottom: 40,
            }}
          >
            ____________________
          </div>

          Authorized Signature
        </div>
      </div>

      {/* ================= PRINT CSS ================= */}

      <style>
        {`
            @page{
                size:A4;
                margin:12mm;
            }

            @media print{

                body{
                    background:#fff;
                }

                img{
                    break-inside:avoid;
                }

                table{
                    page-break-inside:auto;
                }

                tr{
                    page-break-inside:avoid;
                }

                td{
                    page-break-inside:avoid;
                }

                .page-break{
                    page-break-before:always;
                }

            }
        `}
      </style>

    </div>
  );
});

export default OrderPrint;