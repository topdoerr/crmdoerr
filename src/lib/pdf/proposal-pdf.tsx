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
  bold: { fontWeight: "bold" },
  subject: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  content: { fontSize: 10, lineHeight: 1.5, marginBottom: 12 },
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

function stripHtml(s: string | null | undefined) {
  if (!s) return "";
  return s.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
}

interface ProposalPDFProps {
  proposal: any;
  client?: any;
  lineItems?: any[];
}

export function ProposalPDF({ proposal, client, lineItems }: ProposalPDFProps) {
  const subtotal = Number(proposal?.subtotal ?? 0);
  const total = Number(proposal?.total ?? 0);
  const items = lineItems ?? [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Your Company</Text>
            <Text style={styles.companyDetails}>123 Business Ave</Text>
            <Text style={styles.companyDetails}>City, ST 12345</Text>
            <Text style={styles.companyDetails}>billing@company.com</Text>
          </View>
          <View>
            <Text style={styles.title}>PROPOSAL</Text>
            <Text style={styles.titleSub}>#{proposal?.id}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subject}>{proposal?.subject ?? "Proposal"}</Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.sectionLabel}>To</Text>
              <Text>
                {proposal?.proposalTo ?? client?.company ?? "—"}
              </Text>
            </View>
            <View>
              <Text style={styles.sectionLabel}>Date</Text>
              <Text>{fmtDate(proposal?.date)}</Text>
            </View>
            <View>
              <Text style={styles.sectionLabel}>Open Till</Text>
              <Text>{fmtDate(proposal?.openTill)}</Text>
            </View>
          </View>
        </View>

        {proposal?.content ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Proposal</Text>
            <Text style={styles.content}>{stripHtml(proposal.content)}</Text>
          </View>
        ) : null}

        {items.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Items</Text>
            {items.map((item, idx) => {
              const qty = Number(item.qty ?? 0);
              const rate = Number(item.rate ?? 0);
              return (
                <View
                  key={item.id ?? idx}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 4,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#eee",
                  }}
                >
                  <Text style={{ flex: 3 }}>{item.description}</Text>
                  <Text style={{ flex: 1, textAlign: "right" }}>
                    {qty} × {money(rate)}
                  </Text>
                  <Text style={{ flex: 1, textAlign: "right" }}>
                    {money(qty * rate)}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{money(subtotal)}</Text>
          </View>
          <View style={styles.totalRowBold}>
            <Text>Total</Text>
            <Text>{money(total)}</Text>
          </View>
        </View>

        <View style={styles.notes}>
          <Text style={styles.sectionLabel}>Thank You</Text>
          <Text>
            Thank you for considering our proposal. Please reach out with any
            questions.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default ProposalPDF;
