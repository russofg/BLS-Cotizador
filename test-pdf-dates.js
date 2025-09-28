// Test the PDF date parsing function
function parseAndFormatDate(dateValue) {
  if (!dateValue || dateValue.trim() === "") return "Por confirmar";

  try {
    // If it's already in dd/mm/yyyy format, convert to a parseable format
    if (dateValue.includes("/")) {
      const parts = dateValue.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        // Create date in yyyy-mm-dd format which is universally parseable
        const date = new Date(
          `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
        );
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("es-AR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      }
    }

    // Try to parse as is (for ISO strings and other standard formats)
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    console.warn("Could not parse date value for PDF:", dateValue);
    return "Por confirmar";
  } catch (error) {
    console.error("Error parsing date for PDF:", dateValue, error);
    return "Por confirmar";
  }
}

console.log("🧪 Testing PDF date parsing function...\n");

const testCases = [
  "20/12/2024", // dd/mm/yyyy format
  "05/01/2025", // Another dd/mm/yyyy
  "2024-12-20", // ISO format
  "2024-12-20T10:00:00Z", // ISO with time
  "", // Empty
  null, // Null
  "invalid-date", // Invalid
];

testCases.forEach((testCase, index) => {
  const result = parseAndFormatDate(testCase);
  console.log(`Test ${index + 1}: "${testCase}" → "${result}"`);
});

console.log(
  "\n✅ PDF date parsing should now handle formatted dates correctly!"
);
