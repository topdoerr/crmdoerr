import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#222" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 12,
  },
  companyName: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  companyDetails: { fontSize: 9, color: "#666", lineHeight: 1.4 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "right" },
  titleSub: { fontSize: 10, textAlign: "right", color: "#666", marginTop: 2 },
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    color: "#888",
    marginBottom: 4,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { flexDirection: "column" },
  bold: { fontWeight: "bold" },
  table: { marginTop: 8, marginBottom: 8 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 6,
    fontWeight: "bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "right" },
  colRate: { flex: 1.2, textAlign: "right" },
  colAmt: { flex: 1.4, textAlign: "right" },
  totalsBox: { marginTop: 12, marginLeft: "auto", width: "40%" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalRowBold: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: "#333",
    marginTop: 4,
    fontWeight: "bold",
  },
  notes: { marginTop: 16, fontSize: 9, color: "#555" },
});

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface EstimatePDFProps {
  estimate: any;
  client: any;
  lineItems: any[];
}

export function EstimatePDF({ estimate, client, lineItems }: EstimatePDFProps) {
  const subtotal = Number(estimate?.subtotal ?? 0);
  const tax = Number(estimate?.totalTax ?? 0);
  const discount = Number(estimate?.discountTotal ?? 0);
  const adjustment = Number(estimate?.adjustment ?? 0);
  const total = Number(estimate?.total ?? 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.col}>
            <Text style={styles.companyName}>Your Company</Text>
            <Text style={styles.companyDetails}>123 Business Ave</Text>
            <Text style={styles.companyDetails}>City, ST 12345</Text>
            <Text style={styles.companyDetails}>billing@company.com</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.title}>ESTIMATE</Text>
            <Text style={styles.titleSub}>
              {estimate?.prefix ?? "EST-"}
              {estimate?.number}
            </Text>
          </View>
        </View>

        <View style={[styles.row, styles.section]}>
          <View style={{ width: "48%" }}>
            <Text style={styles.sectionLabel}>Prepared For</Text>
            <Text style={styles.bold}>{client?.company ?? "—"}</Text>
            {client?.address ? <Text>{client.address}</Text> : null}
            {client?.city || client?.state || client?.zip ? (
              <Text>
                {[client?.city, client?.state, client?.zip]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            ) : null}
          </View>
          <View style={{ width: "40%" }}>
            <View style={styles.totalRow}>
              <Text style={styles.sectionLabel}>Estimate Date</Text>
              <Text>{fmtDate(estimate?.date)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.sectionLabel}>Expiry Date</Text>
              <Text>{fmtDate(estimate?.expirydate)}</Text>
            </View>
            {estimate?.referenceNo ? (
              <View style={styles.totalRow}>
                <Text style={styles.sectionLabel}>Reference</Text>
                <Text>{estimate.referenceNo}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colRate}>Rate</Text>
            <Text style={styles.colAmt}>Amount</Text>
          </View>
          {lineItems && lineItems.length > 0 ? (
            lineItems.map((item, idx) => {
              const qty = Number(item.qty ?? 0);
              const rate = Number(item.rate ?? 0);
              return (
                <View style={styles.tableRow} key={item.id ?? idx}>
                  <View style={styles.colDesc}>
                    <Text style={styles.bold}>{item.description}</Text>
                    {item.longDescription ? (
                      <Text style={{ color: "#666", fontSize: 9 }}>
                        {item.longDescription}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.colQty}>
                    {qty}
                    {item.unit ? ` ${item.unit}` : ""}
                  </Text>
                  <Text style={styles.colRate}>{money(rate)}</Text>
                  <Text style={styles.colAmt}>{money(qty * rate)}</Text>
                </View>
              );
            })
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>No line items.</Text>
            </View>
          )}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{money(subtotal)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text>Discount</Text>
              <Text>-{money(discount)}</Text>
            </View>
          )}
          {tax > 0 && (
            <View style={styles.totalRow}>
              <Text>Tax</Text>
              <Text>{money(tax)}</Text>
            </View>
          )}
          {adjustment !== 0 && (
            <View style={styles.totalRow}>
              <Text>Adjustment</Text>
              <Text>{money(adjustment)}</Text>
            </View>
          )}
          <View style={styles.totalRowBold}>
            <Text>Total</Text>
            <Text>{money(total)}</Text>
          </View>
        </View>

        <View style={styles.notes}>
          <Text style={styles.sectionLabel}>Terms</Text>
          <Text>
            This estimate is valid until {fmtDate(estimate?.expirydate)}.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default EstimatePDF;
