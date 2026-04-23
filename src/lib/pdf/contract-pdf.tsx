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
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    color: "#888",
    marginBottom: 4,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  subject: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  content: { fontSize: 10, lineHeight: 1.5 },
  kv: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  signatureBox: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    width: "40%",
    paddingTop: 4,
    fontSize: 9,
  },
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
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

interface ContractPDFProps {
  contract: any;
  client?: any;
  lineItems?: any[];
}

export function ContractPDF({ contract, client }: ContractPDFProps) {
  const value = Number(contract?.contractValue ?? 0);

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
            <Text style={styles.title}>CONTRACT</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subject}>{contract?.subject ?? "Contract"}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.kv}>
            <Text style={styles.sectionLabel}>Client</Text>
            <Text>{client?.company ?? "—"}</Text>
          </View>
          <View style={styles.kv}>
            <Text style={styles.sectionLabel}>Start Date</Text>
            <Text>{fmtDate(contract?.datestart)}</Text>
          </View>
          <View style={styles.kv}>
            <Text style={styles.sectionLabel}>End Date</Text>
            <Text>{fmtDate(contract?.dateend)}</Text>
          </View>
          <View style={styles.kv}>
            <Text style={styles.sectionLabel}>Value</Text>
            <Text>{money(value)}</Text>
          </View>
        </View>

        {contract?.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.content}>{stripHtml(contract.description)}</Text>
          </View>
        ) : null}

        {contract?.content ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Contract Terms</Text>
            <Text style={styles.content}>{stripHtml(contract.content)}</Text>
          </View>
        ) : null}

        <View style={styles.signatureBox}>
          <View style={styles.sigLine}>
            <Text>Client Signature</Text>
          </View>
          <View style={styles.sigLine}>
            <Text>Company Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default ContractPDF;
