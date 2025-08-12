document.getElementById("travelForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const destination = document.getElementById("destination").value.trim();
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  // Show loading spinner
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("results").classList.add("hidden");

  try {
    const response = await fetch("http://localhost:3001/api/itinerary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destination,
        startDate,
        endDate,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API Error: ${errorData.error || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.content;

    // Hide loading spinner
    document.getElementById("loading").classList.add("hidden");

    // Parse and display the itinerary
    const itineraryBody = document.getElementById("itineraryBody");
    itineraryBody.innerHTML = "";

    const lines = content
      .split("\n")
      .filter(
        (line) =>
          line.trim() &&
          !line.includes("\\boxed") &&
          !line.includes("undefined") &&
          !line.includes("{") &&
          !line.includes("}")
      );

    let validRowFound = false;
    lines.forEach((line) => {
      const [day, time, activity] = line.split("|").map((item) => item && item.trim());
      if (day && time && activity) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${day}</td>
          <td>${time}</td>
          <td>${activity}</td>
        `;
        itineraryBody.appendChild(row);
        validRowFound = true;
      }
    });

    if (!validRowFound) {
      itineraryBody.innerHTML = `<tr><td colspan="3">No valid itinerary found. Please try again.</td></tr>`;
    }

    document.getElementById("results").classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("loading").classList.add("hidden");
    alert("An error occurred: " + error.message);
  }
});