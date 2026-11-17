const DISTRICTS = [
  "Bagalkote",
  "Ballari",
  "Belagavi",
  "Bengaluru Rural",
  "Bengaluru Urban",
  "Bidar",
  "Chamarajanagar",
  "Chikkaballapur",
  "Chikkamagaluru",
  "Chitradurga",
  "Dakshina Kannada",
  "Davanagere",
  "Dharwad",
  "Gadag",
  "Hassan",
  "Haveri",
  "Kalaburagi",
  "Kodagu",
  "Kolar",
  "Koppal",
  "Mandya",
  "Mysuru",
  "Raichur",
  "Ramanagara",
  "Shivamogga",
  "Tumakuru",
  "Udupi",
  "Uttara Kannada",
  "Vijayapura",
  "Yadgir",
  "Vijayanagara"
];

const KRBC_EMAIL = "karnatakarajyotsavabirdcount@gmail.com";
const volunteers = document.getElementById("district-volunteers");

volunteers.innerHTML = DISTRICTS.map((district, index) => {
  const volunteer = `Volunteer ${String(index + 1).padStart(2, "0")} (Demo)`;
  const subject = encodeURIComponent(`Contact ${volunteer} of the district ${district}`);

  return `
    <tr>
      <td>${district}</td>
      <td>${volunteer}</td>
      <td><a class="btn btn-small" href="mailto:${KRBC_EMAIL}?subject=${subject}">Get in touch</a></td>
    </tr>`;
}).join("");
