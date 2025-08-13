//Capture the form submit
document.getElementById("travelForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  //Read user input
  const destination = document.getElementById("destination").value.trim();
  const numDays = document.getElementById("numDays").value;
  const numPeople = document.getElementById("numPeople").value;

  // Show loading spinner
  document.getElementById("loading").classList.remove("d-none");
  document.getElementById("results").classList.add("d-none");

  try {

    //Send request to backend
    const response = await fetch("http://localhost:3001/api/itinerary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destination,
        numDays,
        numPeople,
      }),
    });

    //Check for errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API Error: ${errorData.error || response.statusText}`
      );
    }

    //Get the AI’s response
    const data = await response.json();
    const content = data.content;

    // Hide loading spinner
    document.getElementById("loading").classList.add("d-none");

    //Prepare the table
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

    //Fill the table
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

    //Handle no data case
    if (!validRowFound) {
      itineraryBody.innerHTML = `<tr><td colspan="3">No valid itinerary found. Please try again.</td></tr>`;
    }

    //Show the table
    document.getElementById("results").classList.remove("d-none");
  }

  //Handle any errors
  catch (error) {
    console.error("Error:", error);
    document.getElementById("loading").classList.add("d-none");
    alert("An error occurred: " + error.message);
  }

});