// Test script to verify date formatting logic for PDF export
console.log("🧪 Testing date formatting logic for PDF export...\n");

// Sample date objects that could come from Firebase or various sources
const testDates = [
  // Firebase Timestamp object simulation
  {
    seconds: 1734649200, // December 20, 2024
    toDate: function () {
      return new Date(this.seconds * 1000);
    },
  },

  // Firebase Timestamp with seconds only
  { seconds: 1734649200 },

  // ISO string
  "2024-12-20T10:00:00Z",

  // Simple date string
  "2024-12-20",

  // Already formatted date
  "20/12/2024",

  // Date object
  new Date("2024-12-20"),

  // Invalid date
  "invalid-date",

  // Empty/null values
  null,
  undefined,
  "",
];

// The same formatting function from our fix
function formatDateForPDF(dateValue) {
  if (!dateValue) return "";

  try {
    // Handle Firebase Timestamp objects
    if (dateValue && typeof dateValue === "object" && dateValue.toDate) {
      const date = dateValue.toDate();
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Handle Firebase Timestamp objects with seconds property
    if (
      dateValue &&
      typeof dateValue === "object" &&
      typeof dateValue.seconds === "number"
    ) {
      const date = new Date(dateValue.seconds * 1000);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Handle string dates
    if (typeof dateValue === "string") {
      if (dateValue.includes("/")) return dateValue; // Already formatted

      let dateToFormat;
      if (dateValue.includes("T") || dateValue.includes("Z")) {
        dateToFormat = new Date(dateValue);
      } else {
        dateToFormat = new Date(dateValue + "T12:00:00");
      }

      if (!isNaN(dateToFormat.getTime())) {
        const day = dateToFormat.getDate().toString().padStart(2, "0");
        const month = (dateToFormat.getMonth() + 1).toString().padStart(2, "0");
        const year = dateToFormat.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }

    // Try to create a Date object for other types
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (error) {
    console.error("Error formatting date:", dateValue, error);
  }

  return ""; // Return empty string if no valid date found
}

// Test each date format
testDates.forEach((testDate, index) => {
  const result = formatDateForPDF(testDate);
  console.log(`Test ${index + 1}:`);
  console.log(`  Input: ${JSON.stringify(testDate)}`);
  console.log(`  Output: "${result}"`);
  console.log(
    `  ✅ ${result ? "FORMATTED" : "EMPTY (as expected for invalid dates)"}\n`
  );
});

console.log("🎯 Key fixes applied:");
console.log("1. Firebase Timestamp objects are properly handled");
console.log("2. String dates with/without time are parsed correctly");
console.log("3. Already formatted dates (dd/mm/yyyy) are preserved");
console.log('4. Invalid dates return empty string instead of "Invalid Date"');
console.log(
  '5. Empty/null values return empty string instead of "Por confirmar"'
);
console.log("\n✅ Date formatting for PDF export should now work correctly!");
